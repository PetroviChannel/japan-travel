'use client';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Clock3,
  Footprints,
  TrainFront,
  CarFront,
  Ticket,
  CalendarDays,
  Play,
  Shuffle,
  List,
  Bike,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  mapDirections,
  mapEmbed,
  mapSearch,
  type RouteStop,
  type RouteDay,
} from './route-data';
import { baseRouteDays as defaultDays } from './base-route-days';
import { purchases } from './trip-data';
import type { SavedPurchase } from './purchase-state';
import DayStories from './day-stories';
import OkinawaBases from './okinawa-bases';
import FujiLakeside from './fuji-lakeside';
import { PlaceImage, PhotoCredit } from './place-photo';
import {
  photoForDay,
  photoForStop,
  nextRandomDay,
  storyDuration,
} from './trip-photos';
const rub = (n: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(n);
const kindLabel = {
  main: 'Главное',
  optional: 'По желанию',
  rest: 'Отдых',
  travel: 'Переезд',
};
const firstMain = (days: RouteDay[], i: number) =>
  Math.max(
    0,
    days[i].stops.findIndex((s) => s.kind === 'main'),
  );
const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'instant'
    : 'smooth';
function External({
  url,
  children,
  className = '',
}: {
  url: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      className={className}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ArrowUpRight size={14} />
    </a>
  );
}
export default function RoutePlanner({
  records,
  onPurchase,
  days = defaultDays,
  variantId,
  initialDate,
  dayFooter,
}: {
  records: Record<string, SavedPurchase>;
  onPurchase: (id: string) => void;
  days?: RouteDay[];
  variantId?: string;
  initialDate?: string;
  dayFooter?: (date: string) => React.ReactNode;
}) {
  const routeDays = days;
  const initialIndex = Math.max(
    0,
    initialDate ? days.findIndex((d) => d.date === initialDate) : 1,
  );
  const [index, setIndex] = useState(initialIndex),
    [point, setPoint] = useState(() => firstMain(days, initialIndex)),
    [loadedMapKey, setLoadedMapKey] = useState(''),
    [storiesOpen, setStoriesOpen] = useState(false),
    [mobileView, setMobileView] = useState('program');
  const mapRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const tile = railRef.current?.children[index] as HTMLElement | undefined;
    if (tile && railRef.current)
      railRef.current.scrollTo({
        left: tile.offsetLeft - railRef.current.offsetLeft - 12,
        behavior: scrollBehavior(),
      });
  }, [index]);
  useEffect(() => {
    const sync = () => {
      const found = routeDays.findIndex(
        (d) =>
          d.date === new URLSearchParams(window.location.search).get('day'),
      );
      if (found >= 0) {
        setIndex(found);
        setPoint(firstMain(days, found));
      }
    };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, [days, routeDays]);
  const day = routeDays[index],
    stop = day.stops[point] ?? day.stops[0],
    mapKey = `${day.date}-${point}`,
    mapLoading = loadedMapKey !== mapKey;
  function selectDay(i: number) {
    if (!Number.isInteger(i) || i < 0 || i >= routeDays.length) return;
    setIndex(i);
    setPoint(firstMain(days, i));
    setMobileView('program');
    const url = new URL(window.location.href);
    url.searchParams.set('tab', variantId ? 'variants' : 'route');
    if (variantId) url.searchParams.set('variant', variantId);
    url.searchParams.set('day', routeDays[i].date);
    window.history.replaceState(null, '', url);
  }
  function selectPoint(i: number, scroll = false) {
    if (i !== point) {
      setPoint(i);
    }
    if (scroll && window.matchMedia('(max-width: 900px)').matches) {
      setMobileView('map');
      requestAnimationFrame(() =>
        mapRef.current?.scrollIntoView({
          behavior: scrollBehavior(),
          block: 'start',
        }),
      );
    }
  }
  const from = point === 0 ? day.origin : day.stops[point - 1].query;
  const legLink = (s: RouteStop, i: number) =>
    mapDirections(
      i === 0 ? day.origin : day.stops[i - 1].query,
      s.query,
      s.mode,
    );
  return (
    <section
      className="route-workspace"
      aria-label="Маршрутные листы"
      ref={workspaceRef}
    >
      <div className="route-heading">
        <div>
          <p className="eyebrow">22 октября — 10 ноября · без машины</p>
          <h2>Каждый день — новая Япония</h2>
          <p>
            Выберите день. Посмотрите его как историю или откройте подробную
            программу.
          </p>
        </div>
      </div>
      {!variantId && <OkinawaBases />}
      <div
        className="photo-day-rail"
        ref={railRef}
        aria-label="Фотокалендарь поездки"
      >
        {routeDays.map((d, i) => (
          <button
            key={d.date}
            type="button"
            onClick={() => selectDay(i)}
            className={`photo-day ${i === index ? 'active' : ''}`}
            aria-pressed={i === index}
            aria-label={`${d.label}: ${d.title}`}
          >
            <PlaceImage photo={photoForDay(d)} />
            <span className="photo-day-date">
              {new Intl.DateTimeFormat('ru-RU', {
                day: 'numeric',
                month: 'short',
                timeZone: 'UTC',
              }).format(new Date(d.date + 'T12:00:00Z'))}
            </span>
            <strong>{d.city}</strong>
          </button>
        ))}
      </div>
      <div className="day-control">
        <Button
          variant="outline"
          aria-label="Предыдущий день"
          disabled={index === 0}
          onClick={() => selectDay(index - 1)}
        >
          <ArrowLeft size={18} />
        </Button>
        <label>
          <span>День поездки</span>
          <NativeSelect
            value={index}
            onChange={(e) => selectDay(Number(e.target.value))}
          >
            {routeDays.map((d, i) => (
              <NativeSelectOption key={d.date} value={i}>
                {d.label} · {d.city}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </label>
        <Button
          variant="outline"
          aria-label="Следующий день"
          disabled={index === routeDays.length - 1}
          onClick={() => selectDay(index + 1)}
        >
          <ArrowRight size={18} />
        </Button>
        <span className="day-count">
          {index + 1} / {routeDays.length}
        </span>
      </div>
      <div className="day-cover">
        <PlaceImage photo={photoForDay(day)} eager />
        <div className="day-cover-shade" />
        <div className="day-cover-content">
          <span className="day-cover-tag">
            День {index + 1} / {routeDays.length} · {day.city}
          </span>
          <h3>{day.title}</h3>
          <p>
            <CalendarDays size={16} />
            {day.label} <span>·</span> {day.stops.length} остановок
          </p>
          <div className="day-cover-actions">
            <Button onClick={() => setStoriesOpen(true)}>
              <Play size={18} />
              Смотреть день · {storyDuration(day)} сек
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                selectDay(nextRandomDay(routeDays.length, index));
                setStoriesOpen(true);
              }}
            >
              <Shuffle size={17} />
              Случайный день
            </Button>
          </div>
        </div>
        <PhotoCredit photo={photoForDay(day)} />
      </div>
      {!variantId && ['2026-11-05', '2026-11-06'].includes(day.date) && (
        <FujiLakeside onPurchase={onPurchase} />
      )}
      <div className="route-day-title">
        <div>
          <h3>Программа дня</h3>
          <p>
            <CalendarDays size={16} />
            {day.label} <span>·</span> {day.hotel}
          </p>
        </div>
        <span className="pace">
          <Footprints size={17} />
          {day.pace}
        </span>
      </div>
      <div className="mobile-route-switch" aria-label="Вид маршрута">
        <Button
          variant={mobileView === 'program' ? 'default' : 'outline'}
          aria-pressed={mobileView === 'program'}
          onClick={() => setMobileView('program')}
        >
          <List size={17} />
          Программа
        </Button>
        <Button
          variant={mobileView === 'map' ? 'default' : 'outline'}
          aria-pressed={mobileView === 'map'}
          onClick={() => setMobileView('map')}
        >
          <MapPin size={17} />
          Карта дня
        </Button>
      </div>
      <div className={`route-columns mobile-${mobileView}`}>
        <div className="timeline-column">
          <div className="route-time-note">
            <Clock3 size={18} />
            <p>
              Все часы — местное время Японии. «План» означает ориентир, «По
              расписанию» — опубликованное время, которое нужно сверить перед
              выездом.
            </p>
          </div>
          <ol className="day-timeline">
            {day.stops.map((s, i) => (
              <li
                key={`${day.date}-${i}`}
                className={i === point ? 'selected' : ''}
              >
                <div className="timeline-rail">
                  <Button
                    variant="ghost"
                    aria-label={`Показать точку ${i + 1}: ${s.title}`}
                    aria-pressed={point === i}
                    onClick={() => selectPoint(i, true)}
                  >
                    {i + 1}
                  </Button>
                </div>
                <article className="timeline-card">
                  {photoForStop(s) && (
                    <figure className="stop-photo">
                      <PlaceImage photo={photoForStop(s)} />
                      <PhotoCredit photo={photoForStop(s)} />
                    </figure>
                  )}
                  <div className="stop-top">
                    <span className="stop-time">{s.time}</span>
                    <span className={`stop-kind ${s.kind}`}>
                      {kindLabel[s.kind]}
                    </span>
                  </div>
                  <p className="timing-type">
                    {s.published ? 'По расписанию' : 'План'} · {s.duration}
                  </p>
                  <h4>{s.title}</h4>
                  <div className="stop-leg">
                    {s.mode === 'driving' ? (
                      <CarFront size={16} />
                    ) : s.mode === 'bicycling' ? (
                      <Bike size={16} />
                    ) : s.mode === 'transit' ? (
                      <TrainFront size={16} />
                    ) : (
                      <Footprints size={16} />
                    )}
                    <span>{s.leg}</span>
                  </div>
                  <div className="stop-actions">
                    <Button
                      variant="ghost"
                      aria-pressed={point === i}
                      onClick={() => selectPoint(i, true)}
                    >
                      <MapPin size={15} />
                      На карте
                    </Button>
                    {s.mode !== 'none' &&
                      s.query !==
                        (i === 0 ? day.origin : day.stops[i - 1].query) && (
                        <External url={legLink(s, i)}>
                          {s.mode === 'driving'
                            ? 'Маршрут для такси'
                            : s.mode === 'walking'
                              ? 'Как пройти'
                              : s.mode === 'bicycling'
                                ? 'На велосипеде'
                                : 'Как доехать'}
                        </External>
                      )}
                  </div>
                  <details className="stop-more">
                    <summary>Подробности и билеты</summary>
                    <p className="stop-detail">{s.detail}</p>
                    {s.source && (
                      <External url={s.source.url}>{s.source.label}</External>
                    )}
                    {s.purchaseIds?.map((id) => {
                      const p = purchases.find((p) => p.id === id),
                        r = records[id];
                      if (!p || !r) return null;
                      return (
                        <Button
                          type="button"
                          variant="ghost"
                          className="route-purchase"
                          key={id}
                          onClick={() => onPurchase(id)}
                        >
                          <Ticket size={16} />
                          <span>
                            {p.title}
                            <small>
                              {r.paid
                                ? 'Отмечено оплаченным'
                                : 'Посмотреть цену и покупку'}
                            </small>
                          </span>
                          <strong>{rub(r.actual ?? r.plan)}</strong>
                          <ArrowRight size={16} />
                        </Button>
                      );
                    })}
                  </details>
                </article>
              </li>
            ))}
          </ol>
          <div className="day-note">
            <h4>Для этого дня</h4>
            <p>{day.note}</p>
          </div>
          {dayFooter?.(day.date)}
        </div>
        <aside className="route-map-panel" ref={mapRef}>
          <div className="map-caption">
            <p className="eyebrow">
              Google Maps · точка {point + 1} из {day.stops.length}
            </p>
            <h4>{stop.title}</h4>
          </div>
          <div className="embedded-map">
            {mapLoading && (
              <output className="map-loading">Загружаем карту…</output>
            )}
            <iframe
              key={mapKey}
              title={`Google Maps: ${stop.title}`}
              src={mapEmbed(stop.query)}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              onLoad={() => setLoadedMapKey(mapKey)}
              onError={() => setLoadedMapKey(mapKey)}
            />
          </div>
          <div className="map-point-buttons" aria-label="Точки выбранного дня">
            {day.stops.map((s, i) => (
              <Button
                key={i}
                variant={point === i ? 'default' : 'outline'}
                aria-label={`${i + 1}. ${s.title}`}
                aria-pressed={point === i}
                onClick={() => selectPoint(i)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <div className="map-links">
            <External url={mapSearch(stop.query)} className="map-open">
              Открыть в Google Maps
            </External>
            {stop.mode !== 'none' && from !== stop.query && (
              <External url={mapDirections(from, stop.query, stop.mode)}>
                Маршрут от предыдущей точки
              </External>
            )}
            {day.walk && (
              <External
                url={mapDirections(
                  day.walk[0],
                  day.walk[day.walk.length - 1],
                  'walking',
                  day.walk.slice(1, -1),
                )}
              >
                Вся прогулка по району
              </External>
            )}
          </div>
          <p className="map-help">
            На встроенной карте показана выбранная точка. Маршруты откроются в
            Google Maps. Для общественного транспорта выставьте дату поездки и
            нужное время отправления.
          </p>
          <p className="map-help">
            Если карта не загрузилась, откройте её по ссылке выше.
          </p>
        </aside>
      </div>
      <div className="route-last-note">
        <strong>
          {variantId
            ? 'Альтернативный маршрут.'
            : 'Основной маршрут под ваши интересы.'}
        </strong>{' '}
        «Главное» — наш приоритет, «По желанию» можно пропустить. Цены в
        карточках — на двоих,
        {variantId ? 'в смете выбранного варианта.' : 'из вашего бюджета.'}{' '}
        Дорога и входы проверены по доступным данным на 8 сентября 2026;
        временные закрытия и расписания могут измениться.
      </div>
      <DayStories
        days={routeDays}
        index={index}
        open={storiesOpen}
        onOpenChange={setStoriesOpen}
        onSelectDay={selectDay}
        onProgram={(i) => {
          selectPoint(i);
          setMobileView('program');
          requestAnimationFrame(() =>
            workspaceRef.current
              ?.querySelector('.day-timeline > li:nth-child(' + (i + 1) + ')')
              ?.scrollIntoView({ behavior: scrollBehavior(), block: 'center' }),
          );
        }}
      />
    </section>
  );
}
