import {
  legacyPurchases as purchases,
  purchases as mainPurchases,
  type Purchase,
} from './trip-data';
import { routeDays, type RouteDay, type RouteStop } from './route-data';
import { refreshVariant } from './price-refresh';

export const yenRate = 0.552789;
const yen = (n: number) => Math.round(n * yenRate);
export type CostLine = {
  id: string;
  category: Purchase['category'];
  title: string;
  low: number;
  high: number;
  note: string;
  url?: string;
  sourceUrl?: string;
  date: string;
  kind: 'quote' | 'tariff' | 'budget';
  from?: string;
  to?: string;
  nights?: number;
  jpy?: string;
  checkedAt?: string;
  evidence?: 'checkout' | 'room-list' | 'published' | 'estimate';
};
export type TripVariant = {
  id: string;
  title: string;
  tag: string;
  summary: string;
  tradeoff: string;
  stays: string;
  changes: string[];
  costs: CostLine[];
  days: RouteDay[];
};
export const originalTotal = mainPurchases.reduce((n, p) => n + p.price, 0);
export const costGroups = [
  { id: 'flight', label: 'Перелёты' },
  { id: 'hotel', label: 'Жильё' },
  { id: 'transport', label: 'Весь наземный транспорт' },
  { id: 'place', label: 'Входы и развлечения' },
  { id: 'daily', label: 'Еда и сборы' },
] as const;
export function costTotal(lines: CostLine[]) {
  return {
    low: lines.reduce((n, c) => n + c.low, 0),
    high: lines.reduce((n, c) => n + c.high, 0),
  };
}
const periods: Record<string, [string, string]> = {
  'h-transit': ['2026-10-21', '2026-10-22'],
  'h-naha': ['2026-10-22', '2026-10-25'],
  'h-onna': ['2026-10-25', '2026-10-28'],
  'h-osaka': ['2026-10-28', '2026-11-01'],
  'h-kyoto': ['2026-11-01', '2026-11-05'],
  'h-fuji': ['2026-11-05', '2026-11-06'],
  'h-tokyo': ['2026-11-06', '2026-11-10'],
};
const nights = (from: string, to: string) =>
  (Date.parse(to) - Date.parse(from)) / 86400000;
const baseCosts = (): CostLine[] =>
  purchases.map((p) => {
    const dates = periods[p.id];
    return {
      id: p.id,
      category: p.category,
      title: p.title,
      low: p.price,
      high: p.kind === 'quote' ? Math.ceil(p.price * 1.1) : p.price,
      note: p.note,
      url: p.link,
      date: p.date,
      kind: p.kind,
      ...(dates
        ? { from: dates[0], to: dates[1], nights: nights(...dates) }
        : {}),
    };
  });
function update(lines: CostLine[], id: string, values: Partial<CostLine>) {
  const item = lines.find((c) => c.id === id);
  if (!item) throw new Error(`Unknown cost ${id}`);
  Object.assign(item, values);
}
function remove(lines: CostLine[], ...ids: string[]) {
  return lines.filter((c) => !ids.includes(c.id));
}
function hotelDate(lines: CostLine[], id: string, from: string, to: string) {
  const old = lines.find((c) => c.id === id)!;
  const url = new URL(old.url!);
  for (const [key, value] of [
    ['checkIn', from],
    ['checkOut', to],
    ['checkin', from],
    ['checkout', to],
  ]) {
    if (url.searchParams.has(key)) url.searchParams.set(key, value);
  }
  const count = nights(from, to);
  update(lines, id, {
    from,
    to,
    nights: count,
    date: `${from} → ${to}`,
    url: url.toString(),
  });
}
function newLine(
  id: string,
  category: CostLine['category'],
  title: string,
  date: string,
  low: number,
  high: number,
  note: string,
  url?: string,
  jpy?: string,
): CostLine {
  return {
    id,
    category,
    title,
    date,
    low,
    high,
    note,
    url,
    jpy,
    kind: jpy ? 'tariff' : 'budget',
  };
}
function mainlandEarlier(lines: CostLine[]) {
  hotelDate(lines, 'h-onna', '2026-10-25', '2026-10-27');
  update(lines, 'f-osaka', {
    title: 'Наха → Осака · выбрать рейс 27 октября',
    date: '27 октября · время пока ориентировочное',
    low: 10272,
    high: 18000,
    kind: 'budget',
    url: 'https://ru.trip.com/flights/showfarefirst?dcity=oka&acity=osa&ddate=2026-10-27&triptype=ow&class=y&quantity=2&locale=ru-RU&curr=RUB',
    note: 'Цена на 27 октября не проверена: прежняя котировка на 28 октября служит только ориентиром. Нужен дневной прямой рейс в KIX, ручная кладь до 7 кг, без сдаваемого багажа. Пересобрать день дороги после покупки.',
  });
  update(lines, 't-onna', { date: '25 и 27 октября' });
  update(lines, 't-kix', { date: '27 октября' });
  update(lines, 't-naruto', { date: '28 октября' });
  update(lines, 'p-naruto', { date: '28 октября' });
}

const place = (
  time: string,
  title: string,
  query: string,
  detail: string,
  leg: string,
  mode: RouteStop['mode'] = 'walking',
  kind: RouteStop['kind'] = 'main',
  source?: RouteStop['source'],
  published = false,
): RouteStop => ({
  time,
  title,
  query,
  detail,
  leg,
  mode,
  kind,
  duration: 'В пределах указанного времени',
  source,
  published,
});
const ref = (label: string, url: string) => ({ label, url });
const kyoto = 'KIORI Exec Gojo Kyoto',
  osaka = 'nippori Osaka Nishitengachaya Guesthouse Osaka',
  tokyo = 'Hotel Horidome Villa Tokyo';
const hiro = 'Hiroshima Station Japan',
  pax = 'Hakone Pax Yoshino';
const label = (date: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
    timeZone: 'UTC',
  }).format(new Date(date + 'T12:00:00Z'));
function cloneDay(sourceDate: string, date = sourceDate): RouteDay {
  const original = routeDays.find((d) => d.date === sourceDate)!;
  return {
    ...original,
    date,
    label: label(date),
    hotel: original.hotel.split(' · ')[0],
    stops: original.stops.map((s) => ({ ...s, purchaseIds: undefined })),
  };
}
function day(
  date: string,
  city: string,
  title: string,
  hotel: string,
  origin: string,
  pace: string,
  note: string,
  stops: RouteStop[],
): RouteDay {
  return {
    date,
    label: label(date),
    city,
    title,
    hotel,
    origin,
    pace,
    note,
    stops,
  };
}
function commonDays() {
  const days = routeDays.map((d) => cloneDay(d.date));
  // A small guide-inspired substitution; the rest remains the independently planned route.
  const asakusa = days.find((d) => d.date === '2026-11-07')!;
  asakusa.stops[2] = place(
    '11:15–12:30',
    'Каппабаси: посуда и кухонные мелочи',
    'Kappabashi Dougu Street Tokyo',
    'Прогулка по магазинам между Асакусой и Уэно, затем обед. Покупки отдельно. Если магазины не интересны — сохраните прогулку по Сумиде из исходного маршрута.',
    'От Сэнсо-дзи: 15–20 минут',
    'walking',
    'optional',
    ref(
      'Идея из вашего гайда',
      'https://ryubabajp.ru/guide/japan-guide/14-days',
    ),
  );
  asakusa.stops[3] = {
    ...asakusa.stops[3],
    mode: 'walking',
    leg: 'От Каппабаси: около 25–35 минут пешком; обед до 13:30',
  };
  asakusa.walk = [
    'Senso-ji Tokyo',
    'Kappabashi Dougu Street Tokyo',
    'Ueno Park Tokyo',
    'Ameyoko Shopping Street Tokyo',
  ];
  return days;
}
function replace(days: RouteDay[], date: string, value: RouteDay) {
  days[days.findIndex((d) => d.date === date)] = value;
}
function earlierDays() {
  const days = commonDays();
  const flight = cloneDay('2026-10-28', '2026-10-27');
  flight.note =
    'Peach MM212 на 27 октября проверен 8 сентября: 12:20–14:15, 10 300 ₽ на двоих. Автобус Kariyushi 07:45 → OKA 09:45. Билеты ещё не куплены; дорожный запас и очереди остаются плановыми.';
  flight.stops = flight.stops.map((s) => ({ ...s, published: false }));
  flight.stops[2] = place(
    '12:20–14:15',
    'Peach MM212 · Наха → Кансай',
    'Naha Airport Domestic Terminal',
    'Прямой рейс, прилёт в KIX T2. Ручная кладь и личная вещь вместе до 7 кг на человека, сдаваемый багаж не включён. Цена на двоих при СБП — 10 300 ₽.',
    'После автобуса в 09:45 остаётся 2 ч 35 мин до вылета',
    'none',
    'travel',
    ref(
      'Поиск на 27 октября',
      'https://ru.trip.com/flights/showfarefirst?dcity=oka&acity=osa&ddate=2026-10-27&triptype=ow&quantity=2&curr=RUB',
    ),
    true,
  );
  flight.stops[4] = {
    ...flight.stops[4],
    detail:
      'Неон, канал, вывеска Glico и Hozenji. Ужин и спокойное возвращение в отель.',
  };
  replace(days, '2026-10-27', flight);
  replace(days, '2026-10-28', cloneDay('2026-10-31', '2026-10-28'));
  return days;
}

function nightBus(): TripVariant {
  let costs = remove(baseCosts(), 'h-fuji', 't-shinkansen', 't-mishima');
  update(costs, 't-fuji-local', {
    date: '6 ноября',
    low: 2000,
    high: 3000,
    note: 'Резерв на местные автобусы к онсэну и озеру на двоих. Бесплатный шаттл только при подходящем времени и подтверждённой брони.',
  });
  update(costs, 'p-yurari', { date: '6 ноября' });
  costs.push(
    newLine(
      'v-night',
      'transport',
      'Ночной Fujiyama Liner · Киото → Кавагутико',
      '5 → 6 ноября',
      yen(16400),
      yen(20400),
      'Нижняя сумма: 4 кресла в ряду. Верхняя: 3 независимых кресла. Продажи за 2 месяца; наличие двух мест не проверено. Ночь сидя, без отеля.',
      'https://www.kintetsu-bus.co.jp/highway/routelist/20',
      '¥16 400–20 400',
    ),
  );
  costs.push(
    newLine(
      'v-night-local',
      'transport',
      'Дополнительный день Киото и камеры хранения',
      '5–6 ноября',
      1200,
      1800,
      'Городские поездки 5 ноября и хранение вещей в Киото / Кавагутико. Отель не обязан хранить вещи после выезда.',
    ),
  );
  const days = commonDays();
  replace(
    days,
    '2026-11-05',
    day(
      '2026-11-05',
      'Киото → ночной автобус',
      'Ещё один спокойный Киото и дорога к Фудзи',
      'Ночь в автобусе · отеля нет',
      kyoto,
      'Без раннего подъёма',
      'Для варианта с 3 независимыми креслами отправление 23:18, прибытие 08:27. Ниже расписание 4-местного ряда. На следующий день не добавляем ещё и подъём на смотровую.',
      [
        place(
          '09:00–11:00',
          'Выселение и багаж',
          'Kyoto Station Japan',
          'Позавтракать, сдать номер, оставить вещи в отеле по согласованию либо в камере хранения у Kyoto Station.',
          'От KIORI: 20–35 минут',
          'transit',
          'travel',
        ),
        place(
          '12:00–14:00',
          'Сад Киотского императорского дворца',
          'Kyoto Gyoen National Garden',
          'Бесплатная прогулка по большому парку. Внутренние дворцовые экскурсии в план не входят.',
          'Метро от Kyoto Station + подход: 30–45 минут',
          'transit',
        ),
        place(
          '15:00–18:00',
          'Камогава, кофе и свободное время',
          'Sanjo Ohashi Kyoto',
          'Неспешный центр, обед и пауза. Вечером поужинать до возвращения за багажом.',
          'От парка: 30–40 минут пешком',
          'walking',
          'rest',
        ),
        place(
          '21:30–22:45',
          'Багаж и выход Hachijo',
          'Kyoto Station Hachijo Exit Bus Stop',
          'Забрать вещи до закрытия хранения, найти точную платформу в билете. К 23:00 быть у отправления.',
          'Центр → станция: 25–40 минут',
          'transit',
          'travel',
        ),
        place(
          '23:33–08:32 +1',
          'Fujiyama Liner до Кавагутико',
          'Kawaguchiko Station Japan',
          'Опубликованное расписание автобуса с парными креслами. Выбрать два места рядом, проверить допустимый багаж.',
          'Киото → Кавагутико без пересадки',
          'transit',
          'travel',
          ref(
            'Расписание и покупка',
            'https://www.kintetsu-bus.co.jp/highway/routelist/20',
          ),
          true,
        ),
      ],
    ),
  );
  replace(
    days,
    '2026-11-06',
    day(
      '2026-11-06',
      'Фудзи → Токио',
      'Озеро, восстановление в онсэне и Токио',
      'Horidome Villa',
      'Kawaguchiko Station Japan',
      'Лёгкий день после ночи в пути',
      'Время местного автобуса и шаттла Yurari пока не закреплено. Если не подходит, выбрать озеро и ранний автобус в Токио; резерв онсэна можно убрать. Не планировать Oishi Park и Yurari одновременно.',
      [
        place(
          '08:32–09:45',
          'Завтрак и камера хранения',
          'Kawaguchiko Station Japan',
          'Привести себя в порядок, оставить большие вещи у станции, позавтракать.',
          'После выхода из ночного автобуса',
          'none',
          'rest',
        ),
        place(
          '10:00–11:00',
          'Берег Кавагутико',
          'Funatsu Hama Lake Kawaguchi',
          'Короткая прогулка у воды. Вид на Фудзи зависит от облаков; длинную поездку на северный берег сегодня не навязываем.',
          'От станции 20–25 минут пешком',
          'walking',
        ),
        place(
          '11:30–14:30',
          'Поездка в Fuji Yurari и купальни',
          'Fuji Yurari Onsen Narusawa',
          'План с дорогой туда: местный автобус либо подходящий заранее заказанный шаттл. На купание около 1,5–2 часов. Общие раздельные купальни, правила татуировок проверить.',
          'Сначала к станции, далее автобус; заложить 45–60 минут',
          'transit',
          'main',
          ref('Тариф и правила', 'https://www.fuji-yurari.jp/charge-plan.html'),
        ),
        place(
          '14:30–16:30',
          'Обратно за вещами и поздний обед',
          'Kawaguchiko Station Japan',
          'Обратный автобус выбрать заранее. Оставить час запаса перед междугородним рейсом.',
          'Онсэн → станция: около 30–60 минут с ожиданием',
          'transit',
          'rest',
        ),
        place(
          '17:00–20:00',
          'Автобус в Синдзюку',
          'Busta Shinjuku Tokyo',
          'Время отправления плановое. Купить конкретный рейс; учтён запас на дорожные задержки.',
          'Кавагутико → Синдзюку',
          'transit',
          'travel',
          ref(
            'Билеты в Токио',
            'https://bus.fujikyu.co.jp/en/highway/fujisan/shinjuku-kawaguchiko/',
          ),
        ),
        place(
          '20:00–21:30',
          'Заселение и ужин',
          tokyo,
          'Доехать до отеля. Позднее заселение согласовать; три полных дня Токио начинаются завтра.',
          'Метро и подход: 40–60 минут',
          'transit',
          'travel',
        ),
      ],
    ),
  );
  return {
    id: 'night-bus',
    title: 'Ночной автобус к Фудзи',
    tag: 'Экономнее',
    summary: 'Больше Киото, одна ночь в пути и прежние 6 ночей на Окинаве.',
    tradeoff:
      'Главная цена экономии — сон в кресле и уставшее утро. Если плохо спите в дороге, исходный маршрут комфортнее.',
    stays: 'Наха 3 · Онна 3 · Осака 4 · Киото 4 · автобус 1 · Токио 4',
    changes: [
      '5 ноября — дополнительный день Киото и ночной автобус.',
      '6 ноября — короткое озеро, онсэн по силам, вечерний Токио.',
      '18 ночей в отелях Японии + 1 в автобусе; 1 транзитная ночь в Ханчжоу отдельно учтена.',
    ],
    costs,
    days,
  };
}

function koyasan(): TripVariant {
  const costs = baseCosts();
  mainlandEarlier(costs);
  hotelDate(costs, 'h-osaka', '2026-10-27', '2026-11-01');
  update(costs, 't-osaka-local', {
    date: '27 октября — 1 ноября',
    low: yen(6000),
    high: yen(6000),
    note: 'Пять дней городских подходов и метро. Поезда / автобусы Коясана входят в отдельный билет ниже.',
  });
  costs.push(
    newLine(
      'v-koyasan-pass',
      'transport',
      'Koyasan World Heritage Ticket',
      '31 октября',
      yen(7960),
      yen(7960),
      'Два взрослых: обычные поезда Nankai туда-обратно, фуникулёр и местные автобусы. Без доплаты за limited express. Билет действует 2 дня; используем за один.',
      'https://www.nankai.co.jp/en_railway/ticket/koyasan',
      '¥7 960',
    ),
  );
  costs.push(
    newLine(
      'v-koyasan-entry',
      'place',
      'Коясан: Конгобудзи и платные залы Гаран',
      '31 октября',
      2000,
      2000,
      'Резерв на двоих. Конгобудзи ¥1 000 на взрослого; набор других платных залов выбрать на месте. Прогулка по Окуноин без отдельного билета.',
      'https://www.howto-osaka.com/en/wp/wp-content/uploads/2024/04/20240329_KOYASAN_en.pdf',
    ),
  );
  const days = earlierDays();
  replace(
    days,
    '2026-10-31',
    day(
      '2026-10-31',
      'Коясан',
      'Храмы среди кедров с возвращением в Осаку',
      'nippori · без смены отеля',
      osaka,
      'Ранний длинный выезд',
      'В горах прохладнее побережья. Проверить последние связки автобус → фуникулёр → поезд. Ночёвка в храме не включена: собственный санузел остаётся в вашем отеле Осаки.',
      [
        place(
          '07:00–10:00',
          'Через Gokurakubashi на Коясан',
          'Koyasan Station Japan',
          'От Tengachaya обычные Nankai, пересадки по расписанию, фуникулёр, затем автобус в центр. Limited express требует доплаты.',
          'От двери до центра: около 3 часов',
          'transit',
          'travel',
          ref(
            'Проездной Nankai',
            'https://www.nankai.co.jp/en_railway/ticket/koyasan',
          ),
        ),
        place(
          '10:00–11:15',
          'Дандзё Гаран',
          'Danjo Garan Koyasan',
          'Красная пагода, храмовый комплекс, один выбранный платный зал. Дальние тропы сегодня не добавляем.',
          'От станции местный автобус и короткий подход',
          'transit',
        ),
        place(
          '11:20–12:15',
          'Конгобудзи',
          'Kongobuji Temple Koyasan',
          'Главный храм, интерьеры и каменный сад. После — обед рядом.',
          'Около 5–10 минут пешком',
          'walking',
        ),
        place(
          '13:15–15:00',
          'Кедровая аллея Окуноин',
          'Okunoin Koyasan',
          'Прогулка от Ichinohashi до мавзолея с возвращением к остановке Okunoin-mae. Уважать ограничения на фотографирование.',
          'Автобус до Ichinohashi, затем пешком',
          'transit',
        ),
        place(
          '15:15–18:30',
          'Обратно в Осаку',
          osaka,
          'Сначала автобус к станции Коясан, затем фуникулёр и Nankai. Точную связку проверить в день поездки.',
          'Около 3 часов от храма до отеля',
          'transit',
          'travel',
        ),
      ],
    ),
  );
  return {
    id: 'koyasan',
    title: 'Коясан: храмы и кедры',
    tag: 'Природа и тишина',
    summary:
      'Одна пляжная ночь переходит в Осаку, появляется полноценный день в горах.',
    tradeoff:
      'На Окинаве 5 ночей вместо 6. После Наруто, USJ и Нары будет ещё один день с ранним подъёмом.',
    stays: 'Наха 3 · Онна 2 · Осака 5 · Киото 4 · Фудзи 1 · Токио 4',
    changes: [
      '27 октября — перелёт в Осаку, 28-го — Наруто.',
      '29-го USJ, 30-го Нара, 31-го Коясан.',
      'Киото, Фудзи и три полных дня Токио остаются на прежних датах.',
    ],
    costs,
    days,
  };
}

function kamakura(): TripVariant {
  const costs = baseCosts();
  mainlandEarlier(costs);
  hotelDate(costs, 'h-osaka', '2026-10-27', '2026-10-31');
  hotelDate(costs, 'h-kyoto', '2026-10-31', '2026-11-04');
  hotelDate(costs, 'h-fuji', '2026-11-04', '2026-11-05');
  hotelDate(costs, 'h-tokyo', '2026-11-05', '2026-11-10');
  for (const id of ['t-shinkansen', 't-mishima', 'p-yurari'])
    update(costs, id, { date: '4 ноября' });
  update(costs, 't-kyoto', { date: '31 октября' });
  update(costs, 't-kyoto-local', { date: '31 октября — 4 ноября' });
  update(costs, 't-osaka-local', { date: '27–31 октября' });
  update(costs, 't-fuji-local', { date: '4–5 ноября' });
  update(costs, 't-tokyo', { date: '5 ноября' });
  update(costs, 'p-kinkaku', { date: '1 ноября' });
  update(costs, 'p-tenryu', { date: '1 ноября' });
  update(costs, 'p-nijo', { date: '2 ноября' });
  update(costs, 'p-kiyomizu', { date: '3 ноября' });
  update(costs, 'p-small', { date: '4–5 ноября' });
  costs.push(
    newLine(
      'v-kamakura-pass',
      'transport',
      'Enoshima-Kamakura Freepass',
      '6 ноября',
      yen(3280),
      yen(3280),
      'Два взрослых: один круг Shinjuku ↔ Fujisawa обычным Odakyu, Enoden и участок к Katase-Enoshima. Romancecar не включён.',
      'https://www.odakyu-freepass.jp/enokama/buy.html',
      '¥3 280',
    ),
  );
  costs.push(
    newLine(
      'v-kamakura-local',
      'transport',
      'Дополнительные подходы к Синдзюку',
      '5–6 ноября',
      600,
      600,
      'Дополнительный день до запуска Tokyo Subway Ticket на 7–9 ноября. Поезд Enoden повторно не оплачиваем.',
    ),
  );
  costs.push(
    newLine(
      'v-hasedera',
      'place',
      'Хасэдэра · обычный вход',
      '6 ноября',
      yen(800),
      yen(800),
      'По ¥400. Отдельный Kannon Museum не включён.',
      'https://www.hasedera.jp/guide/',
      '¥800',
    ),
  );
  costs.push(
    newLine(
      'v-kotokuin',
      'place',
      'Котокуин · Большой Будда',
      '6 ноября',
      yen(600),
      yen(600),
      'По ¥300 за территорию. Внутрь статуи — по желанию отдельно.',
      'https://kotoku-in.jp/en/index.php',
      '¥600',
    ),
  );
  const days = earlierDays();
  const moved = [
    ['2026-11-01', '2026-10-31'],
    ['2026-11-02', '2026-11-01'],
    ['2026-11-03', '2026-11-02'],
    ['2026-11-04', '2026-11-03'],
    ['2026-11-05', '2026-11-04'],
    ['2026-11-06', '2026-11-05'],
  ];
  for (const [oldDate, newDate] of moved) {
    const movedDay = cloneDay(oldDate, newDate);
    movedDay.note = movedDay.note.replace(
      '3 ноября — День культуры в Японии, поэтому стартуем рано. ',
      '',
    );
    movedDay.stops = movedDay.stops.map((s) => ({
      ...s,
      detail: s.detail.replace('4 ноября', '3 ноября'),
    }));
    if (newDate === '2026-11-03')
      movedDay.note +=
        ' 3 ноября — государственный праздник: начать рано, возможны очереди.';
    replace(days, newDate, movedDay);
  }
  replace(
    days,
    '2026-11-06',
    day(
      '2026-11-06',
      'Камакура и Эносима',
      'Большой Будда и море за один день',
      'Horidome Villa · возвращаемся в Токио',
      tokyo,
      'Около 7–10 км, лестницы на острове',
      'Это выезд из Токио, а не четвёртый день в самом городе. Не добавляем Tsurugaoka Hachimangu на противоположном конце Камакуры. При усталости выбрать только Хасэ и побережье.',
      [
        place(
          '07:00–09:45',
          'Синдзюку → Fujisawa → Hase',
          'Hase Station Kamakura',
          'До Синдзюку отдельно; далее обычный Odakyu до Fujisawa, пересадка на Enoden до Hase.',
          'От отеля заложить 2,5–3 часа',
          'transit',
          'travel',
          ref(
            'Проездной на день',
            'https://www.odakyu-freepass.jp/enokama/buy.html',
          ),
        ),
        place(
          '10:00–11:00',
          'Хасэдэра',
          'Hasedera Kamakura',
          'Храм, террасы и вид на побережье. Вход ¥800 за двоих, отдельный музей не нужен.',
          'От станции около 5–10 минут',
          'walking',
          'main',
          ref('Билеты Хасэдэра', 'https://www.hasedera.jp/guide/'),
        ),
        place(
          '11:15–12:00',
          'Большой Будда Котокуин',
          'Kotoku-in Kamakura',
          'Главная статуя и территория. Затем пообедать возле Hase.',
          'От Хасэдэра около 10–15 минут',
          'walking',
          'main',
          ref('Тариф Котокуин', 'https://kotoku-in.jp/en/index.php'),
        ),
        place(
          '13:00–14:00',
          'Enoden вдоль побережья',
          'Enoshima Station Fujisawa',
          'Сесть на поезд к Эносиме. Короткую остановку у моря делать только при наличии времени; на железнодорожные пути не выходить.',
          'Hase → Enoshima, поезд и подход к мосту',
          'transit',
        ),
        place(
          '14:00–16:15',
          'Мост и улочки Эносимы',
          'Enoshima Island Japan',
          'Прогулка по острову, святилище снаружи и море. Башня Sea Candle, платные эскалаторы и пещеры не включены.',
          'От станции по мосту 20–30 минут',
          'walking',
        ),
        place(
          '16:15–19:00',
          'Возвращение в Токио',
          tokyo,
          'От Katase-Enoshima через Fujisawa и Shinjuku. Ужин рядом с отелем.',
          'Обычный Odakyu + метро, около 2,5 часа',
          'transit',
          'travel',
        ),
      ],
    ),
  );
  return {
    id: 'kamakura',
    title: 'Камакура и Эносима',
    tag: 'Мой выбор по балансу',
    summary:
      'Храмы, прибрежный поезд и океан — новый опыт с умеренной доплатой.',
    tradeoff:
      'Окинава короче на ночь; даты всех отелей на основной части сдвигаются. Дополнительная ночь Токио нужна для выезда к морю.',
    stays: 'Наха 3 · Онна 2 · Осака 4 · Киото 4 · Фудзи 1 · Токио 5',
    changes: [
      '27 октября — Осака, 28-го — Наруто; USJ 29-го и Нара 30-го.',
      'Киото 31 октября — 4 ноября, Фудзи 4–5 ноября.',
      '6 ноября — Камакура; 7–9 ноября — три полных дня Токио.',
    ],
    costs,
    days,
  };
}

function hiroshima(): TripVariant {
  let costs = baseCosts();
  mainlandEarlier(costs);
  hotelDate(costs, 'h-osaka', '2026-10-27', '2026-10-31');
  update(costs, 't-osaka-local', { date: '27–31 октября' });
  costs = remove(costs, 't-nara', 't-usj', 't-kyoto');
  costs.push({
    ...newLine(
      'v-hiro-hotel',
      'hotel',
      'Хиросима · Toyoko Inn Hiroshima-eki Minami-guchi Migi',
      '31 октября → 1 ноября',
      8000,
      12000,
      'Резерв на отдельный двухместный номер с санузлом. По официальному сайту 10 минут пешком от южного выхода Hiroshima Station, завтрак включён. Субботняя ночь: наличие и тариф не проверены. Можно сравнить с APA у станции.',
      'https://ru.trip.com/hotels/hiroshima-hotel-detail-704432/toyoko-inn-hiroshima-eki-minami-guchi-migi/?checkin=2026-10-31&checkout=2026-11-01&adult=2&crn=1&curr=RUB',
    ),
    sourceUrl: 'https://www.toyoko-inn.com/eng/search/detail/00145/',
    from: '2026-10-31',
    to: '2026-11-01',
    nights: 1,
  });
  costs.push(
    newLine(
      'v-hiro-pass',
      'transport',
      'Kansai-Hiroshima Area Pass · 5 дней',
      '29 октября — 2 ноября',
      yen(34000),
      yen(34000),
      'По ¥17 000. Покрывает JR к USJ, JR в Нару, Shin-Osaka ↔ Hiroshima, JR к Miyajimaguchi, JR-паром и обычный JR Shin-Osaka → Kyoto. Не покрывает синкансэн Shin-Osaka → Kyoto, метро, автобусы Наруто. Подходит иностранным туристам со статусом Temporary Visitor.',
      'https://www.westjr.co.jp/travel-information/en/tickets-passes/jrwest-rail-pass/kansai_hiroshima/',
      '¥34 000',
    ),
  );
  costs.push(
    newLine(
      'v-hiro-local',
      'transport',
      'Трамвай Хиросимы и хранение вещей',
      '31 октября — 1 ноября',
      1000,
      1500,
      'Резерв на участки вне JR Pass и камеры хранения. Отель рядом со станцией сокращает необходимость такси.',
    ),
  );
  costs.push(
    newLine(
      'v-peace',
      'place',
      'Мемориальный музей мира',
      '31 октября',
      yen(400),
      yen(400),
      'Два взрослых по ¥200; выбрать время посещения. Парк и купол снаружи бесплатны.',
      'https://dive-hiroshima.com/en/explore/2675/',
      '¥400',
    ),
  );
  costs.push(
    newLine(
      'v-itsukushima',
      'place',
      'Святилище Ицукусима',
      '1 ноября',
      yen(600),
      yen(600),
      'По ¥300 за вход в святилище. Вид ворот меняется с приливом.',
      'https://www.itsukushimajinja.jp/en/admission.html',
      '¥600',
    ),
  );
  costs.push(
    newLine(
      'v-miyajima-tax',
      'place',
      'Сбор при посещении Миядзимы',
      '1 ноября',
      yen(200),
      yen(200),
      'По ¥100 даже при проездном с паромом. Отельные налоги остаются в общем резерве, повторно не добавлены.',
      'https://another1000years-miyajima.jp/en/visitortax/index.html',
      '¥200',
    ),
  );
  const days = earlierDays();
  const nara = days.find((d) => d.date === '2026-10-30')!;
  nara.note =
    'В этом варианте используем JR Pass и станцию JR Nara, не Kintetsu-Nara. От JR до парка дальше: предусмотрено около 35–40 минут пешком. Касуга и Нарамати по силам.';
  nara.stops[0] = place(
    '07:30–09:00',
    'Доехать до JR Nara',
    'Nara Station Japan',
    'Через Tennoji, далее JR Yamatoji Rapid. Показать активированный региональный проездной.',
    'От отеля примерно 1,5 часа',
    'transit',
    'travel',
  );
  nara.stops[1] = {
    ...nara.stops[1],
    time: '09:00–10:15',
    leg: 'От JR Nara до парка: 30–40 минут пешком',
  };
  nara.stops[4] = {
    ...nara.stops[4],
    detail:
      'Нарамати по силам, затем пешком к JR Nara и JR через Tennoji в Осаку.',
    leg: 'Нарамати → JR Nara → Осака',
  };
  nara.walk = [
    'Nara Station Japan',
    'Nara Park Japan',
    'Todai-ji Nara',
    'Nigatsu-do Nara',
  ];
  replace(
    days,
    '2026-10-31',
    day(
      '2026-10-31',
      'Хиросима',
      'Город мира и вечер в Хиросиме',
      'Hotel S-Plus Hiroshima Peace Park',
      osaka,
      'Переезд и один большой музей',
      'Утренний синкансэн бронировать в рамках регионального проездного. Отель S-Plus у Парка мира заменяет недоступный Toyoko Inn. Сдать вещи в отель по согласованию; если это невозможно — в шкафчик на станции, время на возврат оставлено.',
      [
        place(
          '07:30–10:30',
          'Осака → Хиросима',
          hiro,
          'До Shin-Osaka, затем подходящий Sanyo Shinkansen. Сдать багаж на станции либо отвезти в S-Plus по согласованию с отелем.',
          'Около 3 часов с подходами и запасом',
          'transit',
          'travel',
          ref(
            'Региональный JR Pass',
            'https://www.westjr.co.jp/travel-information/en/tickets-passes/jrwest-rail-pass/kansai_hiroshima/',
          ),
        ),
        place(
          '11:00–12:30',
          'Мемориальный парк и купол',
          'Hiroshima Peace Memorial Park',
          'Парк, памятники и Atomic Bomb Dome снаружи. До парка можно доехать Meipuru-pu по JR Pass; трамвай оплачивается из местного резерва. После — обед и пауза.',
          'От станции 25–40 минут; от S-Plus — пешком около 15 минут',
          'transit',
        ),
        place(
          '13:30–15:30',
          'Музей мира',
          'Hiroshima Peace Memorial Museum',
          'Выделить два часа на экспозицию. Тяжёлые свидетельства войны: можно сократить посещение по самочувствию.',
          'В пределах парка',
          'walking',
          'main',
          ref('Посещение музея', 'https://dive-hiroshima.com/en/explore/2675/'),
        ),
        place(
          '16:00–17:30',
          'Заселение и отдых',
          'Hotel S-Plus Hiroshima Peace Park',
          'От музея пешком в S-Plus. Если вещи оставлены на станции, съездить за ними до заселения; для этого оставлен весь полуторачасовой блок.',
          'Пешком 10–15 минут; с возвратом за багажом до 90 минут',
          'transit',
          'rest',
        ),
        place(
          '18:00–20:00',
          'Ужин в Хиросиме',
          'Hondori Hiroshima',
          'Окономияки и прогулка по Hondori / Shintenchi рядом с центром. Возвращаться на вокзал ради ужина не нужно.',
          'Пешком от отеля',
          'walking',
          'rest',
        ),
      ],
    ),
  );
  replace(
    days,
    '2026-11-01',
    day(
      '2026-11-01',
      'Миядзима → Киото',
      'Ворота в воде и переезд в Киото',
      'KIORI Exec Gojo',
      'Hotel S-Plus Hiroshima Peace Park',
      'Раннее утро, длинный вечерний переезд',
      'Гору Мисэн и канатную дорогу не включаем. Паром нужен именно JR. К Киото едем из Shin-Osaka обычным JR, чтобы оставаться в покрытии проездного. Поздний заезд в KIORI подтвердить.',
      [
        place(
          '07:00–09:00',
          'JR и паром на Миядзиму',
          'Miyajima Ferry Terminal',
          'Выселиться из S-Plus, доехать до Hiroshima Station и оставить багаж. JR до Miyajimaguchi, пешком к JR-парому. Трамвай к вокзалу — из местного резерва, туристический сбор отдельно.',
          'Подвоз к вокзалу, шкафчик, JR и паром: заложено 2 часа',
          'transit',
          'travel',
        ),
        place(
          '09:00–10:30',
          'Ицукусима и большие тории',
          'Itsukushima Shrine Miyajima',
          'Святилище и берег. Не обещаем ворота «в воде»: зависит от прилива на день посещения.',
          'От пристани 15–20 минут пешком',
          'walking',
          'main',
          ref(
            'Тариф святилища',
            'https://www.itsukushimajinja.jp/en/admission.html',
          ),
        ),
        place(
          '10:45–12:00',
          'Дайсё-ин',
          'Daishoin Temple Miyajima',
          'Храм у склона и лестницы. Если тяжело подниматься, оставить только набережную.',
          'Около 15–20 минут от святилища',
          'walking',
        ),
        place(
          '12:00–13:00',
          'Обед и путь к пристани',
          'Omotesando Shopping Street Miyajima',
          'Устрицы или простой обед, затем без спешки на паром. Длинный горный маршрут сегодня не подходит.',
          'Спуск и улочки: 20–30 минут',
          'walking',
          'rest',
        ),
        place(
          '13:15–15:00',
          'Обратно в Хиросиму за вещами',
          hiro,
          'JR-паром и JR-поезд, забрать багаж. Заложить запас на очередь и ожидание.',
          'Около 1,5 часа',
          'transit',
          'travel',
        ),
        place(
          '15:30–19:00',
          'Хиросима → Киото и заселение',
          kyoto,
          'Синкансэн до Shin-Osaka, затем JR Kyoto Line без синкансэна. Вечером только ужин рядом с отелем.',
          'Около 3–3,5 часа от станции до отеля',
          'transit',
          'travel',
        ),
      ],
    ),
  );
  return {
    id: 'hiroshima',
    title: 'Хиросима и Миядзима',
    tag: 'Больше разных впечатлений',
    summary:
      'Ещё один регион Японии, мемориальный город и знаменитые тории в море.',
    tradeoff:
      'Дополнительная смена отеля и два насыщенных дня. На Окинаве минус ночь; в Киото 1 ноября будет только позднее заселение.',
    stays:
      'Наха 3 · Онна 2 · Осака 4 · Хиросима 1 · Киото 4 · Фудзи 1 · Токио 4',
    changes: [
      '27 октября — Осака, 28-го Наруто; 29-го USJ и 30-го Нара.',
      '31 октября — Хиросима, 1 ноября — Миядзима и вечерний Киото.',
      'Проездной 29 октября — 2 ноября заменяет отдельные билеты JR к USJ, в Нару и переезд в Киото.',
    ],
    costs,
    days,
  };
}

function hakone(): TripVariant {
  let costs = remove(
    baseCosts(),
    'h-fuji',
    't-shinkansen',
    't-mishima',
    't-fuji-local',
    't-tokyo',
    'p-yurari',
    'p-small',
  );
  costs.push({
    ...newLine(
      'v-hakone-hotel',
      'hotel',
      'Hakone Pax Yoshino · номер со своим санузлом',
      '5 → 6 ноября',
      yen(45000),
      yen(60000),
      'Резерв ¥45–60 тыс. на двух взрослых с ужином и завтраком. На Trip.com выбирать номер с собственной ванной и тариф «Включены завтрак и ужин для 2 гостей»; более дешёвые варианты бывают только с завтраком. Карточка и даты проверены 8 сентября, итог перед оплатой уточнить. Частную купальню за доплату не считали.',
      'https://ru.trip.com/hotels/hakone-hotel-detail-705914/hakone-pax-yoshino/?checkin=2026-11-05&checkout=2026-11-06&adult=2&crn=1&curr=RUB',
    ),
    sourceUrl: 'https://www.pax-yoshino.com/reservation/',
    jpy: '¥45 000–60 000',
    from: '2026-11-05',
    to: '2026-11-06',
    nights: 1,
  });
  costs.push(
    newLine(
      'v-odawara',
      'transport',
      'Киото → Одавара · Hikari / Kodama',
      '5 ноября',
      yen(24200),
      yen(24200),
      'Два места обычного класса по стандартному тарифу Smart EX. Подобрать поезд с остановкой в Odawara.',
      'https://smart-ex.jp/en/product/plan/service/pdf/service_fares_reserved.pdf',
      '¥24 200',
    ),
  );
  costs.push(
    newLine(
      'v-hakone-pass',
      'transport',
      'Hakone Freepass от Odawara · 2 дня',
      '5–6 ноября',
      yen(12000),
      yen(12000),
      'Только зона Хаконе: горный поезд, фуникулёр, канатная дорога, подходящие автобусы и прогулочный корабль. Шаттл рёкана отдельно.',
      'https://odakyu-global.com/passes/hakone-freepass/',
      '¥12 000',
    ),
  );
  costs.push(
    newLine(
      'v-hakone-tokyo',
      'transport',
      'Хаконе → Синдзюку · основа + Romancecar',
      '6 ноября',
      yen(4120),
      yen(4120),
      'За двоих: базовый участок Odawara → Shinjuku ¥1 820 + ticketless доплата Romancecar ¥2 300. Участок внутри Хаконе уже в Freepass. При покупке у посредника итог сверить.',
      'https://odakyu-global.com/passes/hakone-freepass/',
      '¥4 120',
    ),
  );
  costs.push(
    newLine(
      'v-hakone-shuttle',
      'transport',
      'Шаттл Hakone-Yumoto ↔ Pax Yoshino',
      '5–6 ноября',
      yen(800),
      yen(800),
      'По ¥200 на человека в одну сторону; два проезда на двоих. Можно пройти пешком, если удобно с багажом.',
      'https://www.pax-yoshino.com/en/',
      '¥800',
    ),
  );
  update(costs, 'd-food', {
    low: 48000,
    high: 48000,
    note: 'Из прежнего бюджета 50 000 ₽ вычтено 2 000 ₽ на включённые ужин и завтрак рёкана. Это поправка резерва, а не цена питания в рёкане; при тарифе без еды вернуть 2 000 ₽.',
  });
  const days = commonDays();
  replace(
    days,
    '2026-11-05',
    day(
      '2026-11-05',
      'Киото → Хаконе',
      'Рёкан и онсэн без спешки',
      'Hakone Pax Yoshino · ужин и завтрак',
      kyoto,
      'Ранний переезд, спокойный вечер',
      'Этот вариант заменяет Кавагутико на Хаконе. Фудзи можно увидеть со стороны Овакудани / озера Аси при хорошей погоде, но вид не гарантирован. На ужин прибыть к часу, назначенному рёканом.',
      [
        place(
          '08:00–11:30',
          'Киото → Одавара → Hakone-Yumoto',
          'Hakone Yumoto Station',
          'До Kyoto Station, подходящий Hikari / Kodama до Odawara, затем местный поезд по Hakone Freepass.',
          'Около 3–3,5 часа с подходами',
          'transit',
          'travel',
          ref('Билеты Smart EX', 'https://smart-ex.jp/en/'),
        ),
        place(
          '12:00–14:00',
          'Обед и улочки Hakone-Yumoto',
          'Hakone Yumoto Shopping Street',
          'Прогуляться вдоль реки, пообедать. Тяжёлые вещи — на хранение по согласованию с рёканом.',
          'Пешком у станции',
          'walking',
          'rest',
        ),
        place(
          '14:30–15:30',
          'Заезд в Pax Yoshino',
          pax,
          'Короткий платный шаттл или пешком. Уточнить время ужина и правила купален.',
          'От станции около 5 минут на шаттле + ожидание',
          'transit',
          'travel',
          ref('Категории номеров', 'https://www.pax-yoshino.com/en/'),
        ),
        place(
          '16:00–18:00',
          'Онсэн и отдых',
          pax,
          'Общие купальни рёкана. Если нужна личная купальня, проверить наличие, бронь и отдельную плату.',
          'Внутри рёкана',
          'none',
          'main',
        ),
        place(
          '18:00–20:00',
          'Ужин в рёкане',
          pax,
          'Точное время назначит рёкан. Ужин входит только в выбранный план с двумя приёмами пищи.',
          'В рёкане',
          'none',
          'rest',
        ),
      ],
    ),
  );
  replace(
    days,
    '2026-11-06',
    day(
      '2026-11-06',
      'Хаконе → Токио',
      'Горный круг Хаконе и вечерний Токио',
      'Horidome Villa',
      pax,
      'Плотный день с несколькими пересадками',
      'После выселения хранение багажа согласовать с рёканом. Ветер может остановить канатную дорогу и корабль: тогда сократить круг и поехать в Токио раньше. Времена ориентировочные; музей под открытым небом в этот день не добавляем.',
      [
        place(
          '07:30–09:00',
          'Завтрак, выселение и багаж',
          'Hakone Yumoto Station',
          'Позавтракать, оставить вещи в рёкане по согласованию; короткий шаттл к станции.',
          'Рёкан → станция',
          'transit',
          'travel',
        ),
        place(
          '09:00–11:15',
          'Gora → Sounzan → Овакудани',
          'Owakudani Hakone',
          'Горный поезд, фуникулёр и канатная дорога по Freepass. Вид на Фудзи при ясном небе.',
          'Заложено время на пересадки и очереди',
          'transit',
        ),
        place(
          '11:15–12:15',
          'Вулканическая долина и перекус',
          'Owakudani Hakone',
          'Короткая прогулка по открытой части. Закрытые зоны не входят; специальные тропы не бронируем.',
          'У станции канатной дороги',
          'none',
          'main',
        ),
        place(
          '12:15–14:00',
          'Togendai и корабль по озеру Аси',
          'Moto Hakone Port',
          'Спуститься на канатной дороге, затем подходящий Hakone Sightseeing Cruise по Freepass. Учесть ожидание посадки.',
          'Канатная дорога + корабль',
          'transit',
        ),
        place(
          '14:00–14:45',
          'Берег и святилище Хаконе',
          'Hakone Shrine',
          'Короткая прогулка, без очереди на отдельную фотографию у водных тории. Если корабль задержался, этот пункт пропустить.',
          'От пристани около 15–20 минут',
          'walking',
          'optional',
        ),
        place(
          '14:45–16:45',
          'Автобус, багаж и станция',
          'Hakone Yumoto Station',
          'Вернуться на автобусе, забрать вещи в рёкане и снова к станции. На автобусном участке бывают пробки.',
          'Заложено до двух часов с подходами к рёкану',
          'transit',
          'travel',
        ),
        place(
          '17:15–20:15',
          'Romancecar в Токио и отель',
          tokyo,
          'Подобрать поезд после возвращения за багажом. Синдзюку → Horidome на метро; ужин в городе.',
          'Поезд около 1,5 часа + 40–60 минут до отеля',
          'transit',
          'travel',
          ref(
            'Odakyu: проезд и доплаты',
            'https://odakyu-global.com/passes/hakone-freepass/',
          ),
        ),
      ],
    ),
  );
  return {
    id: 'hakone',
    title: 'Хаконе и ночь в рёкане',
    tag: 'Доплата за отдых',
    summary:
      'Один отель становится отдельным впечатлением: онсэн, японский ужин и горное озеро.',
    tradeoff:
      'Кавагутико исключено. Хаконе даёт другой ракурс Фудзи, а не гарантированный вид из номера. Нужен подходящий план рёкана на ваши даты.',
    stays: 'Наха 3 · Онна 3 · Осака 4 · Киото 4 · Хаконе 1 · Токио 4',
    changes: [
      'Окинава и Киото остаются полностью на прежних датах.',
      '5 ноября — ранний переезд в Хаконе, рёкан и онсэн.',
      '6 ноября — горный круг и Токио; включённую еду не считаем второй раз.',
    ],
    costs,
    days,
  };
}

export const tripVariants: TripVariant[] = [
  nightBus(),
  koyasan(),
  kamakura(),
  hiroshima(),
  hakone(),
].map(refreshVariant);
