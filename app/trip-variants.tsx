'use client';
import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  BedDouble,
  Check,
  Route,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import RoutePlanner from './route-planner';
import { priceCheckedAt, rateSource } from './price-refresh';
import { PlaceImage } from './place-photo';
import { photoByKey, variantPhotoKeys } from './trip-photos';
import {
  tripVariants,
  costGroups,
  costTotal,
  originalTotal,
  type CostLine,
} from './variant-data';
const rub = (n: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(n);
const range = (low: number, high: number) =>
  low === high ? rub(low) : `${rub(low)} – ${rub(high)}`;
const compactRange = (low: number, high: number) =>
  `${Math.round(low / 1000)}–${Math.round(high / 1000)} тыс. ₽`;
const date = (d: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(d + 'T12:00:00Z'));
const kind = {
  quote: 'Котировка Trip.com',
  tariff: 'Опубликованный тариф',
  budget: 'Расчётный резерв',
};
const highlights: Record<string, string> = {
  'night-bus': '2026-11-05',
  koyasan: '2026-10-31',
  kamakura: '2026-11-06',
  hiroshima: '2026-10-31',
  hakone: '2026-11-05',
};
function External({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {children}
      <ArrowUpRight size={14} />
    </a>
  );
}
function CostTable({ lines }: { lines: CostLine[] }) {
  return (
    <div className="variant-cost-list">
      {lines.map((c) => (
        <article className="variant-cost" key={c.id}>
          <div>
            <span className="purchase-date">
              {c.from && c.to
                ? `${date(c.from)} → ${date(c.to)} · ${c.nights} ноч.`
                : c.date}
            </span>
            <h4>{c.title}</h4>
            <p>{c.note}</p>
            <small className={`price-kind ${c.kind}`}>
              {kind[c.kind]}
              {c.checkedAt ? ` · ${date(c.checkedAt)}` : ''}
              {c.evidence === 'checkout' ? ' · итог перед вводом данных' : ''}
              {c.evidence === 'room-list' ? ' · округлённая цена карточки' : ''}
            </small>
            {c.url && (
              <External url={c.url}>
                {c.category === 'hotel'
                  ? 'Выбрать номер на Trip.com'
                  : c.category === 'flight'
                    ? 'Проверить наличие и итоговую цену'
                    : 'Тарифы и оформление'}
              </External>
            )}
            {c.sourceUrl && (
              <External url={c.sourceUrl}>
                Условия на официальном сайте
              </External>
            )}
          </div>
          <div className="variant-cost-price">
            <strong>
              {c.kind === 'quote' ? rub(c.low) : range(c.low, c.high)}
            </strong>
            <small>На двоих {c.nights ? 'за весь заезд' : ''}</small>
            {c.kind === 'quote' && <small>С запасом 10%: {rub(c.high)}</small>}
            {c.nights && <span>{rub(c.low / c.nights)} / ночь в среднем</span>}
            {c.jpy && <span>{c.jpy} на двоих</span>}
          </div>
        </article>
      ))}
    </div>
  );
}
export default function TripVariants() {
  const [selected, setSelected] = useState('kamakura'),
    [view, setView] = useState('days');
  useEffect(() => {
    const sync = () => {
      const id = new URLSearchParams(window.location.search).get('variant');
      if (tripVariants.some((v) => v.id === id)) setSelected(id!);
      const requestedView = new URLSearchParams(window.location.search).get(
        'view',
      );
      if (requestedView && ['days', 'hotels', 'costs'].includes(requestedView))
        setView(requestedView);
    };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  const variant = tripVariants.find((v) => v.id === selected)!,
    total = costTotal(variant.costs);
  function selectView(next: string) {
    setView(next);
    const url = new URL(window.location.href);
    url.searchParams.set('view', next);
    window.history.replaceState(null, '', url);
  }
  function select(id: string) {
    setSelected(id);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'variants');
    url.searchParams.set('variant', id);
    url.searchParams.set('day', highlights[id]);
    window.history.replaceState(null, '', url);
  }
  function dayCost(day: string) {
    const stay = variant.costs.find(
      (c) =>
        c.category === 'hotel' && c.from && c.to && c.from <= day && day < c.to,
    );
    return (
      <div className="day-note variant-day-cost">
        <h4>
          <BedDouble size={17} /> Ночёвка {date(day)}
        </h4>
        {stay ? (
          <>
            <p>
              {stay.title} · {rub(stay.low / stay.nights!)} за эту ночь на
              двоих.
            </p>
            <small>
              Средняя стоимость ночи внутри всего заезда; фактическая разбивка
              отеля может отличаться.
            </small>
            {stay.url && (
              <External url={stay.url}>
                Забронировать этот отель на Trip.com · {date(stay.from!)} —{' '}
                {date(stay.to!)}
              </External>
            )}
          </>
        ) : (
          <p>
            {selected === 'night-bus' && day === '2026-11-05'
              ? 'Сон в ночном автобусе. Билет уже включён в транспорт, отеля на эту ночь нет.'
              : 'Ночь в пути после вылета из Японии. Дополнительный отель в Дохе не включён.'}
          </p>
        )}
        <Button
          variant="ghost"
          onClick={() => {
            selectView('costs');
            document
              .getElementById('variant-detail')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          Жильё, входы и весь транспорт этого варианта{' '}
          <ArrowUpRight size={15} />
        </Button>
      </div>
    );
  }
  return (
    <section
      className="variants-workspace"
      aria-label="Пять альтернативных поездок"
    >
      <div className="variant-heading">
        <div>
          <p className="eyebrow">
            2 взрослых · 20 октября — 12 ноября 2026 · без машины
          </p>
          <h2>Пять способов прожить эту поездку</h2>
          <p>
            Окинава, ночёвки в Киото, USJ, Наруто, Нара и три полных дня Токио
            есть во всех вариантах. Меняем одну часть путешествия и сразу видим
            цену.
          </p>
        </div>
      </div>
      <details className="compact-note">
        <summary>Как сравнивать варианты с основным планом</summary>
        <div className="variant-baseline">
          <div>
            <span>Исходная смета до пересчёта · для сравнения</span>
            <strong>{rub(originalTotal)}</strong>
            <small>Все перелёты, жильё, транспорт, еда и входы на двоих</small>
          </div>
          <p>
            Выбор карточки меняет только просмотр. Купленные позиции и ваши
            суммы в основном плане сохраняются. Их сводка находится во вкладке
            «Покупки».
          </p>
        </div>
      </details>
      <div className="variant-choices">
        {tripVariants.map((v, i) => {
          const t = costTotal(v.costs);
          return (
            <button
              type="button"
              key={v.id}
              onClick={() => select(v.id)}
              className={`variant-choice ${selected === v.id ? 'active' : ''}`}
              aria-pressed={selected === v.id}
            >
              <PlaceImage
                className="variant-choice-photo"
                photo={photoByKey(variantPhotoKeys[v.id])}
              />
              <div className="variant-choice-body">
                <span className="variant-choice-top">
                  <span>
                    0{i + 1} · {v.tag}
                  </span>
                  {selected === v.id && <Check size={18} />}
                </span>
                <h3>{v.title}</h3>
                <strong>{compactRange(t.low, t.high)}</strong>
                <p>{v.summary}</p>
                <span className="variant-choice-action">
                  Открыть смету и дни <ArrowDown size={15} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <details className="compact-note price-method">
        <summary>Цены проверены 8 сентября · что входит в расчёт</summary>
        <div className="variant-method">
          <strong>Пересчитано {date(priceCheckedAt)} 2026.</strong> Проверены 15
          разных заездов на Trip.com и 4 варианта перелётов: туда, обратно и
          Наха → Осака на 27 / 28 октября. В карточках — стоимость всего заезда
          и условия выбранного номера. Нижняя сумма складывает текущие
          котировки, опубликованные тарифы и явно названные резервы. Верхняя
          добавляет 10% к отелям и перелётам, а также указанный запас на
          транспорт. Наличие ноябрьских мест в поездах, автобусах и на паромах
          не подтверждено. Цены могут измениться за пределы диапазона.
          Авиатарифы показаны для СБП; иены пересчитаны по курсу 0,552789 ₽.
          Комиссии карты и посредника могут отличаться. Trip Coins и
          неподтверждённые промокоды не вычитались.{' '}
          <External url={rateSource}>Курс ЦБ на 8 сентября</External>
        </div>
      </details>
      <article className="variant-selected" id="variant-detail">
        <div className="variant-selected-heading">
          <div>
            <p className="eyebrow">Выбранный сценарий</p>
            <h2>{variant.title}</h2>
            <p>{variant.stays}</p>
          </div>
          <div className="variant-total">
            <strong>{compactRange(total.low, total.high)}</strong>
            <span>Полная смета на двоих</span>
          </div>
        </div>
        <p className="variant-tradeoff">{variant.tradeoff}</p>
        <details className="compact-note variant-facts-note">
          <summary>Что меняется и из чего складывается бюджет</summary>
          <div className="variant-facts">
            <ul>
              {variant.changes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <div className="variant-mini-budget">
              {costGroups.map((g) => {
                const t = costTotal(
                  variant.costs.filter((c) => c.category === g.id),
                );
                return (
                  <div key={g.id}>
                    <span>{g.label}</span>
                    <strong>{range(t.low, t.high)}</strong>
                  </div>
                );
              })}
              <div className="variant-sum">
                <span>Итого</span>
                <strong>{range(total.low, total.high)}</strong>
              </div>
            </div>
          </div>
        </details>
        <Tabs value={view} onValueChange={selectView}>
          <TabsList className="tabbar variant-subtabs" variant="line">
            <TabsTrigger value="days">
              <Route size={16} /> Дни и Google Maps
            </TabsTrigger>
            <TabsTrigger value="costs">
              <Wallet size={16} /> Вся смета и ссылки
            </TabsTrigger>
            <TabsTrigger value="hotels">
              <BedDouble size={16} /> Отели на Trip.com
            </TabsTrigger>
          </TabsList>
          <TabsContent value="days">
            <RoutePlanner
              key={variant.id}
              days={variant.days}
              variantId={variant.id}
              initialDate={highlights[variant.id]}
              records={{}}
              onPurchase={() => {}}
              dayFooter={dayCost}
            />
          </TabsContent>
          <TabsContent value="hotels">
            <p className="variant-cost-intro">
              Все отели выбранного маршрута: ссылки на Trip.com с датами заезда
              и выезда, 1 номером и 2 взрослыми. Выберите на Trip.com нужную
              категорию и питание из описания ниже. 14 итогов проверены перед
              вводом данных гостей; у Hanting показана округлённая цена карточки
              за одну ночь. Сроки отмены — по местному времени отеля.
            </p>
            <CostTable
              lines={variant.costs.filter((c) => c.category === 'hotel')}
            />
            {selected === 'hakone' && (
              <div className="variant-method">
                <strong>Альтернатива: Mount View Hakone.</strong> Для
                собственного санузла выбирайте категорию с ванной / душем; более
                дешёвый Standard может иметь только туалет и общую купальню.
                Этот отель в Sengokuhara потребует другой дороги к месту
                ночёвки.{' '}
                <External url="https://ru.trip.com/hotels/hakone-hotel-detail-706180/mount-view-hakone-ryokan/?checkin=2026-11-05&checkout=2026-11-06&adult=2&crn=1&curr=RUB">
                  Mount View на Trip.com · 5–6 ноября
                </External>
              </div>
            )}
          </TabsContent>
          <TabsContent value="costs">
            <p className="variant-cost-intro">
              Все суммы ниже уже входят в итог. У отелей указана стоимость всего
              проживания и средняя цена ночи; у проездных — все покрываемые
              поездки. Сохранённые покупки исходного плана автоматически сюда не
              переносятся.
            </p>
            {costGroups.map((g) => (
              <details
                className="variant-cost-group"
                key={g.id}
                open={g.id === 'hotel' || g.id === 'transport'}
              >
                <summary>
                  <span>{g.label}</span>
                  <strong>
                    {range(
                      ...(Object.values(
                        costTotal(
                          variant.costs.filter((c) => c.category === g.id),
                        ),
                      ) as [number, number]),
                    )}
                  </strong>
                </summary>
                <CostTable
                  lines={variant.costs.filter((c) => c.category === g.id)}
                />
              </details>
            ))}
            {selected === 'hakone' && (
              <div className="variant-method">
                <strong>Ещё два уровня жилья в Хаконе.</strong> Mount View
                Hakone: комната M Low bed с ванной и туалетом — недатированный
                ориентир ¥51 700 за двоих с ужином и завтраком. Standard
                Japanese-style — ориентир ¥36 300, свой туалет, но мыться нужно
                в общем онсэне. Это категории на другом объекте, не проверенные
                предложения на 5–6 ноября; Mount View в Sengokuhara требует
                другого маршрута к отелю.{' '}
                <External url="https://www.mvhakone.jp/lg_en/">
                  Условия Mount View
                </External>
                <External url="https://ru.trip.com/hotels/hakone-hotel-detail-706180/mount-view-hakone-ryokan/?checkin=2026-11-05&checkout=2026-11-06&adult=2&crn=1&curr=RUB">
                  Mount View на Trip.com · 5–6 ноября
                </External>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </article>
      <div className="variant-guide">
        <h3>Что взял из вашего гайда</h3>
        <p>
          Каппабаси как остановку между Асакусой и Уэно, Камакуру как отдельный
          выезд и Хаконе как альтернативу Кавагутико. Сохраняю ваш лимит Токио в
          три полных дня. Не заполняю каждую паузу новым музеем: покупки,
          прогулки и отдых тоже требуют времени.
        </p>
        <div>
          <External url="https://ryubabajp.ru/guide/japan-guide/tokyo">
            Ваш гайд: Токио
          </External>
          <External url="https://ryubabajp.ru/guide/japan-guide/14-days">
            Ваш гайд: идеи поездки
          </External>
        </div>
        <p>
          Тарифы автобусов и региональных билетов проверены отдельно по
          перевозчикам, ссылки есть в смете. Для отелей и рейсов оставлены
          поиски Trip.com; отдельные автобусы, паромы и храмовые билеты удобнее
          оформлять у перевозчика или на месте. Нельзя считать, что любой
          японский билет продаётся на Trip.com.
        </p>
      </div>
      <div className="variant-method">
        <strong>
          Дорога до и после Японии во всех пяти сценариях одинакова.
        </strong>{' '}
        20 октября — вылет из Москвы, 21–22 октября — транзит через Ханчжоу с
        отелем, затем Гонконг и Наха вечером 22-го. 10 ноября — вечерний вылет
        из Нариты, 11-го — длинная пересадка в Дохе, 12-го — Москва. Эти рейсы
        повторно проверены 8 сентября, билеты ещё не куплены. Самостоятельная
        пересадка туда и почти сутки в Дохе обратно — существенная плата
        временем за цену. Отель в Дохе, виза, страховка, связь, покупки и USJ
        Express Pass в приведённые итоги не входят. Проезд от вашего адреса до
        аэропорта Москвы и обратно также не оценён. Еда на пересадках и резерв
        местных гостиничных сборов входят.
      </div>
    </section>
  );
}
