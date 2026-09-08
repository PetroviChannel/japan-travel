import { useId, useRef, useState, type ReactNode } from 'react';
import {
  ArrowUpRight,
  BedDouble,
  Clock3,
  Footprints,
  MapPin,
  TrainFront,
  Waves,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mapDirections, mapEmbed, mapSearch } from './route-data';
import { onsenVisitCost } from './kawaguchiko-onsen-cost';
import './kawaguchiko-onsen-map.css';

export type OnsenMapHotel = {
  id: string;
  name: string;
  query: string;
  priceRub: number | null;
  priceLabel: string;
  bookingUrl: string;
  summary: string;
};

export type OnsenMapBath = {
  id: string;
  name: string;
  query: string;
  /** Admission in JPY for one adult. */
  entryYen: number;
  extrasLabel: string;
  hours: string;
  sourceUrl: string;
  description: string;
};

export type OnsenMapPair = {
  hotelId: string;
  bathId: string;
  /** Optional guest-specific admission total for two; zero means included. */
  entryYenForTwo?: number;
  walkKm: number | null;
  walkMinutes: number | null;
  travelLabel: string;
  /** Total in JPY for two adults for the journey described in travelLabel. */
  transportYenForTwo: number | null;
  mode: 'walking' | 'transit';
  distanceNote: string;
};

export type KawaguchikoOnsenMapProps = {
  hotels: OnsenMapHotel[];
  baths: OnsenMapBath[];
  pairs: OnsenMapPair[];
  /** RUB per one JPY. */
  yenRate: number;
};

const hasAmount = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;
const number = (value: number) =>
  new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(value);
const rub = (value: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
const yen = (value: number) => `¥${number(value)}`;

function Link({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <ArrowUpRight size={15} aria-hidden="true" />
    </a>
  );
}

export default function KawaguchikoOnsenMap({
  hotels,
  baths,
  pairs,
  yenRate,
}: KawaguchikoOnsenMapProps) {
  const id = useId();
  const [hotelId, setHotelId] = useState(hotels[0]?.id ?? '');
  const [sort, setSort] = useState<'distance' | 'price'>('distance');
  const [mappedBathId, setMappedBathId] = useState<string | null>(null);
  const [loadedQuery, setLoadedQuery] = useState('');
  const mapRef = useRef<HTMLElement>(null);
  const hotel = hotels.find((item) => item.id === hotelId) ?? hotels[0];
  const mappedBath = baths.find((item) => item.id === mappedBathId);
  const mappedPlace = mappedBath ?? hotel;
  const rateKnown = Number.isFinite(yenRate) && yenRate > 0;
  const pairFor = (bathId: string) =>
    pairs.find((item) => item.hotelId === hotel?.id && item.bathId === bathId);
  const costFor = (bath: OnsenMapBath) =>
    onsenVisitCost(
      hotel?.priceRub ?? null,
      bath.entryYen,
      pairFor(bath.id),
      yenRate,
    );
  const tripCostYen = (bath: OnsenMapBath) => costFor(bath).visitYen;
  const sortedBaths = [...baths].sort((a, b) => {
    const aValue = sort === 'price' ? tripCostYen(a) : pairFor(a.id)?.walkKm;
    const bValue = sort === 'price' ? tripCostYen(b) : pairFor(b.id)?.walkKm;
    if (!hasAmount(aValue)) return hasAmount(bValue) ? 1 : 0;
    if (!hasAmount(bValue)) return -1;
    return aValue - bValue;
  });
  const mappedPair = mappedBath ? pairFor(mappedBath.id) : undefined;

  function showOnMap(bathId: string | null) {
    setMappedBathId(bathId);
    if (window.matchMedia('(max-width: 800px)').matches) {
      requestAnimationFrame(() =>
        mapRef.current?.scrollIntoView({
          block: 'start',
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
            .matches
            ? 'instant'
            : 'smooth',
        }),
      );
    }
  }

  return (
    <section className="kawa-onsen" aria-labelledby={`${id}-title`}>
      <header className="kawa-onsen-heading">
        <span className="kawa-onsen-kicker">
          <Waves size={17} aria-hidden="true" />
          Жильё и купальни рядом
        </span>
        <h3 id={`${id}-title`}>Где остановиться и сходить в онсэн</h3>
        <p>
          Выберите жильё: сравним путь до купален и расходы на двоих. Нажмите на
          название места, чтобы показать его на карте.
        </p>
      </header>

      {hotel ? (
        <>
          <div className="kawa-onsen-filters">
            <label htmlFor={`${id}-hotel`}>
              <span>Откуда идём</span>
              <select
                id={`${id}-hotel`}
                value={hotel.id}
                onChange={(event) => {
                  setHotelId(event.target.value);
                  setMappedBathId(null);
                }}
              >
                {hotels.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label htmlFor={`${id}-sort`}>
              <span>Порядок купален</span>
              <select
                id={`${id}-sort`}
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as 'distance' | 'price')
                }
              >
                <option value="distance">Ближе пешком</option>
                <option value="price">Дешевле с дорогой</option>
              </select>
            </label>
          </div>

          <article className="kawa-onsen-hotel">
            <div>
              <span className="kawa-onsen-kicker">
                <BedDouble size={17} aria-hidden="true" />
                Выбранное жильё для сравнения
              </span>
              <h4>{hotel.name}</h4>
              <p>{hotel.summary}</p>
            </div>
            <div className="kawa-onsen-hotel-price">
              <strong>
                {hasAmount(hotel.priceRub)
                  ? rub(hotel.priceRub)
                  : 'Цена не подтверждена'}
              </strong>
              <span>{hotel.priceLabel}</span>
            </div>
            <div className="kawa-onsen-links">
              <Button
                type="button"
                variant={mappedBath ? 'outline' : 'secondary'}
                aria-pressed={!mappedBath}
                onClick={() => showOnMap(null)}
              >
                <MapPin size={16} />
                Жильё на карте
              </Button>
              {hotel.bookingUrl && (
                <Link href={hotel.bookingUrl}>Проверить номер и цену</Link>
              )}
            </div>
          </article>

          <div className="kawa-onsen-layout">
            <div
              className="kawa-onsen-cards"
              aria-label="Купальни для сравнения"
            >
              {sortedBaths.length === 0 && (
                <p className="kawa-onsen-empty">Купальни пока не добавлены.</p>
              )}
              {sortedBaths.map((bath) => {
                const pair = pairFor(bath.id);
                const {
                  transportYen: transport,
                  admissionYen: admission,
                  visitRub,
                  totalRub,
                } = costFor(bath);
                const isSelected = mappedBath?.id === bath.id;
                const walkParts = [
                  hasAmount(pair?.walkKm) ? `${number(pair.walkKm)} км` : '',
                  hasAmount(pair?.walkMinutes)
                    ? `${number(pair.walkMinutes)} мин`
                    : '',
                ].filter(Boolean);

                return (
                  <article
                    className={`kawa-onsen-card${isSelected ? ' is-selected' : ''}`}
                    key={bath.id}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      className="kawa-onsen-place-button"
                      aria-pressed={isSelected}
                      aria-label={`${bath.name}: показать на карте`}
                      onClick={() => showOnMap(bath.id)}
                    >
                      <MapPin size={18} />
                      <span>{bath.name}</span>
                      <span className="kawa-onsen-map-badge">
                        {isSelected ? 'На карте' : 'Показать'}
                      </span>
                    </Button>
                    <p>{bath.description}</p>
                    <div className="kawa-onsen-distance">
                      <Footprints size={17} aria-hidden="true" />
                      <span>
                        Пешком:{' '}
                        {walkParts.length
                          ? walkParts.join(' · ')
                          : 'путь не проверен'}
                      </span>
                    </div>
                    <div className="kawa-onsen-travel">
                      {pair?.mode === 'walking' ? (
                        <Footprints size={17} aria-hidden="true" />
                      ) : (
                        <TrainFront size={17} aria-hidden="true" />
                      )}
                      <span>
                        {pair?.travelLabel || 'Транспорт пока не проверен'}
                      </span>
                    </div>
                    {pair?.distanceNote && (
                      <p className="kawa-onsen-small">{pair.distanceNote}</p>
                    )}

                    <dl className="kawa-onsen-costs">
                      <div>
                        <dt>Вход на двоих</dt>
                        <dd>
                          {admission === null
                            ? 'Уточнить'
                            : pair?.entryYenForTwo === 0
                              ? 'Включён в проживание'
                              : yen(admission)}
                          {admission !== null && admission > 0 && rateKnown && (
                            <small>≈ {rub(admission * yenRate)}</small>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt>Дорога на двоих</dt>
                        <dd>
                          {hasAmount(transport) ? yen(transport) : 'Уточнить'}
                          {hasAmount(transport) && rateKnown && (
                            <small>≈ {rub(transport * yenRate)}</small>
                          )}
                        </dd>
                      </div>
                    </dl>
                    <div className="kawa-onsen-total">
                      <span>Жильё + вход + дорога на двоих</span>
                      <strong>
                        {totalRub === null
                          ? 'Пока без полного итога'
                          : `≈ ${rub(totalRub)}`}
                      </strong>
                      <small>{hotel.priceLabel}</small>
                      <small>
                        {visitRub !== null
                          ? `Из них поездка в онсэн: ≈ ${rub(visitRub)}`
                          : !hasAmount(transport)
                            ? 'Стоимость дороги ещё нужно уточнить.'
                            : !rateKnown
                              ? 'Курс для расчёта в рублях не задан.'
                              : 'Стоимость входа ещё нужно уточнить.'}
                        {visitRub !== null && !hasAmount(hotel.priceRub)
                          ? ' Цена жилья пока не подтверждена.'
                          : ''}
                      </small>
                    </div>
                    {bath.extrasLabel && (
                      <p className="kawa-onsen-small">{bath.extrasLabel}</p>
                    )}
                    <div className="kawa-onsen-hours">
                      <Clock3 size={17} aria-hidden="true" />
                      <span>{bath.hours || 'Часы посещения уточнить'}</span>
                    </div>
                    <div className="kawa-onsen-links">
                      <Link
                        href={mapDirections(
                          hotel.query,
                          bath.query,
                          pair?.mode ?? 'transit',
                        )}
                      >
                        {pair?.mode === 'walking'
                          ? 'Путь от жилья'
                          : 'Как доехать от жилья'}
                      </Link>
                      {bath.sourceUrl && (
                        <Link href={bath.sourceUrl}>Условия посещения</Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="kawa-onsen-map-panel" ref={mapRef}>
              <div className="kawa-onsen-map-caption" aria-live="polite">
                <span className="kawa-onsen-kicker">
                  Google Maps · {mappedBath ? 'купальня' : 'жильё'}
                </span>
                <h4>{mappedPlace.name}</h4>
                <p>На карте одна выбранная точка.</p>
              </div>
              <div className="kawa-onsen-map-frame">
                {loadedQuery !== mappedPlace.query && (
                  <span className="kawa-onsen-map-loading">
                    Загружаем карту…
                  </span>
                )}
                <iframe
                  key={mappedPlace.query}
                  title={`Google Maps: ${mappedPlace.name}`}
                  src={mapEmbed(mappedPlace.query)}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                  onLoad={() => setLoadedQuery(mappedPlace.query)}
                  onError={() => setLoadedQuery(mappedPlace.query)}
                />
              </div>
              <div className="kawa-onsen-links">
                <Link href={mapSearch(mappedPlace.query)}>
                  Открыть Google Maps
                </Link>
                {mappedBath && (
                  <Link
                    href={mapDirections(
                      hotel.query,
                      mappedBath.query,
                      mappedPair?.mode ?? 'transit',
                    )}
                  >
                    Маршрут от {hotel.name}
                  </Link>
                )}
              </div>
              <p className="kawa-onsen-small">
                Маршрут откроется отдельно. Для автобусов выставьте дату и время
                поездки. Если карта не загрузилась, используйте ссылку.
              </p>
            </aside>
          </div>
          <p className="kawa-onsen-footnote">
            Итог складывается из указанной цены жилья, двух взрослых входных
            билетов и дороги на двоих. Доплаты — по условиям купальни; они не
            прибавляются автоматически. Неизвестные расходы остаются
            неподтверждёнными. Выбор здесь меняет сравнение, а не ваши покупки.
            {rateKnown
              ? ` Курс расчёта: ¥1 ≈ ${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 4 }).format(yenRate)} ₽.`
              : ''}
          </p>
        </>
      ) : (
        <p className="kawa-onsen-empty">
          Жильё для сравнения пока не добавлено.
        </p>
      )}
    </section>
  );
}
