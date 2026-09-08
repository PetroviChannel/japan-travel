import type { CostLine, TripVariant } from './variant-data';

export const priceCheckedAt = '2026-09-08';
export const rateSource =
  'https://www.cbr.ru/currency_base/daily/?UniDbQuery.Posted=True&UniDbQuery.To=08.09.2026';
const yen = (value: number) => Math.round(value * 0.552789);
const jpy = (value: number) => `¥${value.toLocaleString('ru-RU')}`;

type HotelQuote = {
  id: string;
  from: string;
  to: string;
  total: number;
  room: string;
  terms: string;
  stage?: 'room-list';
  title?: string;
  url?: string;
};

// Trip.com, 8 September 2026. Whole-stay totals from the guest-details page,
// before entering personal data. Hanting is the rounded one-night room-list total.
export const hotelQuotes: HotelQuote[] = [
  {
    id: 'h-transit',
    from: '2026-10-21',
    to: '2026-10-22',
    total: 3027,
    room: 'Queen, 26–28 м², собственный санузел, без курения.',
    terms:
      'Без питания. Бесплатная отмена до 20 октября 18:00. Округлённая цена карточки за одну ночь с налогами.',
    stage: 'room-list',
  },
  {
    id: 'h-naha',
    from: '2026-10-22',
    to: '2026-10-25',
    total: 12088.86,
    room: 'Small Double, 20 м², полуторная кровать, собственный санузел, без курения.',
    terms:
      'Без питания. Бесплатная отмена до 20 октября 23:59. Налоги включены.',
  },
  {
    id: 'h-onna',
    from: '2026-10-25',
    to: '2026-10-28',
    total: 12727.7,
    room: 'Twin B/C, 18 м², собственный санузел, без курения.',
    terms:
      'Без питания. Бесплатная отмена до 18 октября 23:59. Налоги включены.',
  },
  {
    id: 'h-onna',
    from: '2026-10-25',
    to: '2026-10-27',
    total: 9746.34,
    room: 'Twin B/C, 18 м², собственный санузел, без курения.',
    terms:
      'Без питания. Бесплатная отмена до 17 октября 23:59. Налоги включены.',
  },
  {
    id: 'h-osaka',
    from: '2026-10-28',
    to: '2026-11-01',
    total: 9939.21,
    room: 'Номер на 1–3 человек, 30 м², собственный санузел, без курения.',
    terms:
      'Цена всего номера для вашей пары. Тип кроватей назначает объект. Без питания, невозвратный тариф; уборка и НДС включены.',
  },
  {
    id: 'h-osaka',
    from: '2026-10-27',
    to: '2026-11-01',
    total: 12023.07,
    room: 'Номер на 1–3 человек, 30 м², собственный санузел, без курения.',
    terms:
      'Цена всего номера для вашей пары. Тип кроватей назначает объект. Без питания, невозвратный тариф; уборка и НДС включены.',
  },
  {
    id: 'h-osaka',
    from: '2026-10-27',
    to: '2026-10-31',
    total: 8781.03,
    room: 'Номер на 1–3 человек, 30 м², собственный санузел, без курения.',
    terms:
      'Цена всего номера для вашей пары. Тип кроватей назначает объект. Без питания, невозвратный тариф; уборка и НДС включены.',
  },
  {
    id: 'h-kyoto',
    from: '2026-11-01',
    to: '2026-11-05',
    total: 25528.9,
    room: 'Стандартный Twin, 17–19 м², собственный санузел, без курения.',
    terms:
      'Без питания, невозвратный тариф. Скидка для зарегистрированных пользователей уже учтена. Местный налог — в резерве сборов, отдельно от НДС.',
  },
  {
    id: 'h-kyoto',
    from: '2026-10-31',
    to: '2026-11-04',
    total: 35804.22,
    room: 'Стандартный Double, 17–19 м², собственный санузел, без курения. Прежний Twin на эти даты не показан.',
    terms:
      'Без питания, невозвратный тариф. Скидка для зарегистрированных пользователей уже учтена. Местный налог — в резерве сборов, отдельно от НДС.',
  },
  {
    id: 'h-fuji',
    from: '2026-11-05',
    to: '2026-11-06',
    total: 10664.15,
    room: 'Budget Double, 12 м², собственный санузел, без курения.',
    terms:
      'Завтрак для двоих и НДС включены. Невозвратный тариф. Онсэн Yurari оплачивается отдельно.',
  },
  {
    id: 'h-fuji',
    from: '2026-11-04',
    to: '2026-11-05',
    total: 10664.15,
    room: 'Budget Double, 12 м², собственный санузел, без курения.',
    terms:
      'Завтрак для двоих и НДС включены. Невозвратный тариф. Онсэн Yurari оплачивается отдельно.',
  },
  {
    id: 'h-tokyo',
    from: '2026-11-06',
    to: '2026-11-10',
    total: 30053.28,
    room: 'Small Double, 11 м², полуторная кровать, собственный санузел, без курения.',
    terms:
      'Без питания, невозвратный тариф. Показанные скидки и НДС уже учтены. Ширину общей кровати проверить перед оплатой.',
  },
  {
    id: 'h-tokyo',
    from: '2026-11-05',
    to: '2026-11-10',
    total: 38052.74,
    room: 'Small Double, 11 м², полуторная кровать, собственный санузел, без курения.',
    terms:
      'Без питания, невозвратный тариф. Показанные скидки и НДС уже учтены. Ширину общей кровати проверить перед оплатой.',
  },
  {
    id: 'v-hakone-hotel',
    from: '2026-11-05',
    to: '2026-11-06',
    total: 26371.81,
    room: 'West Building Japanese Hollywood Twin, 40 м², собственный санузел, без курения.',
    terms:
      'Ужин и завтрак для двоих включены. Бесплатная отмена до 1 ноября 23:59. НДС и онсэнный налог 167,10 ₽ уже в итоге; повторно не добавлять. Частная купальня за доплату не включена.',
  },
  {
    id: 'v-hiro-hotel',
    from: '2026-10-31',
    to: '2026-11-01',
    total: 10442.89,
    title: 'Hotel S-Plus Hiroshima Peace Park',
    url: 'https://ru.trip.com/hotels/hiroshima-hotel-detail-704392/hotel-s-plus-hiroshima-peace-park/?checkin=2026-10-31&checkout=2026-11-01&adult=2&crn=1&curr=RUB',
    room: 'Economy Twin, 17 м², собственный санузел, без курения.',
    terms:
      'Без питания. Бесплатная отмена до 29 октября 23:59. НДС включён; местный налог — в резерве сборов. Прежний Toyoko Inn недоступен на эти даты: отель заменён, путь в дневном плане исправлен.',
  },
];

const practical: Record<string, string> = {
  'h-transit':
    'Бесплатный аэропортовый шаттл заявлен, но время нужно согласовать; отдельный резерв на такси уже включён. Выход из аэропорта зависит от условий въезда.',
  'h-naha':
    'До Asahibashi около 1,5 км. Стойка до 21:00: заранее согласовать поздний заезд.',
  'h-onna':
    'Около 5 минут до Kariyushi Beach. Самостоятельный заезд; хранения вещей до/после проживания нет.',
  'h-osaka':
    'Самостоятельный заезд. До Kishinosato 900 м, до Tengachaya около 1 км.',
  'h-kyoto': 'До Gojo около 880 м; поздний заезд после Миядзимы согласовать.',
  'h-tokyo': 'Район Nihombashi, станции Kodemmacho / Ningyocho.',
};

const transportSources: Record<string, string> = {
  't-naha': 'https://www2025.yui-rail.co.jp/routemap/asahibashi/?t=fare',
  't-onna': 'https://www.okinawa-shuttle.co.jp/en/good-value/',
  't-kerama':
    'https://www.vill.tokashiki.okinawa.jp/soshiki/sitekanri/5/2/1365.html',
  't-aquarium':
    'https://www.okinawa-shuttle.co.jp/wp-content/themes/shuttle/images/new_pricetable-en-3.svg',
  't-kix': 'https://kensaku.nankai.co.jp/pc/U1',
  't-kyoto':
    'https://enjoy-osaka-kyoto-kobe.com/article/a/kyo-train-garaku-interior-design/',
  't-nara': 'https://kintetsu-faq.dga.jp/faq_detail.html?id=731',
  't-usj':
    'https://www.westjr.co.jp/press/article/items/240515_00_press_keihanshin_unchin.pdf',
  't-shinkansen':
    'https://smart-ex.jp/en/product/plan/service/pdf/service_fares_reserved.pdf',
  't-mishima': 'https://www.fujikyucitybus.com/highwaybus/kawaguchiko.html',
  't-fuji-local': 'https://bus.fujikyu.co.jp/en/fujitour/kawaguchiko/',
  't-tokyo':
    'https://bus.fujikyu.co.jp/en/highway/fujisan/shinjuku-kawaguchiko/',
  't-tokyo-local': 'https://www.tokyometro.jp/en/ticket/travel/index.html',
  't-narita':
    'https://www.keisei.co.jp/keisei/tetudou/skyliner/us/traffic/main_fares.php',
  't-osaka-local':
    'https://subway-tr.osakametro.co.jp/en/guide/page/enjoy-eco.php',
  't-kyoto-local': 'https://www.city.kyoto.lg.jp/kotsu/page/0000028378.html',
  'v-night': 'https://www.kintetsu-bus.co.jp/highway/routelist/20',
  'v-koyasan-pass':
    'https://www.nankai.co.jp/sites/default/files/imce/pdf/library/pdf/FMO/koyasan_ticket_price2026.pdf',
  'v-kamakura-pass': 'https://www.emot.jp/enokama.eng.terms.html',
  'v-hiro-pass':
    'https://www.westjr.co.jp/travel-information/en/tickets-passes/jrwest-rail-pass/kansai_hiroshima/',
  'v-hiro-local': 'https://www.chugoku-jrbus.co.jp/news/detail/1244',
  'v-odawara':
    'https://smart-ex.jp/en/product/plan/service/pdf/service_fares_reserved.pdf',
  'v-hakone-pass': 'https://odakyu-global.com/passes/hakone-freepass/',
  'v-hakone-tokyo': 'https://odakyu-global.com/passes/hakone-freepass/',
  'v-hakone-shuttle': 'https://www.pax-yoshino.com/en/',
};

const tariffYen: Record<string, number> = {
  't-naha': 580,
  't-onna': 5600,
  't-kerama': 14340,
  't-aquarium': 4800,
  't-kyoto': 820,
  't-nara': 2720,
  't-usj': 800,
  't-shinkansen': 22220,
  't-mishima': 5400,
  't-tokyo': 4400,
  'v-koyasan-pass': 7960,
  'v-kamakura-pass': 3280,
  'v-hiro-pass': 34000,
  'v-odawara': 24200,
  'v-hakone-pass': 12000,
  'v-hakone-tokyo': 4120,
  'v-hakone-shuttle': 1600,
};

export function refreshVariant(v: TripVariant): TripVariant {
  const edit = (id: string, patch: Partial<CostLine>) => {
    const row = v.costs.find((c) => c.id === id);
    if (row) Object.assign(row, patch);
  };
  for (const row of v.costs) {
    if (row.category === 'hotel') {
      const q = hotelQuotes.find(
        (q) => q.id === row.id && q.from === row.from && q.to === row.to,
      );
      if (!q)
        throw new Error(
          `Hotel dates have no refreshed quote: ${row.id} ${row.from}`,
        );
      Object.assign(row, {
        low: q.total,
        high: Math.ceil(q.total * 1.1),
        kind: 'quote',
        checkedAt: priceCheckedAt,
        evidence: q.stage || 'checkout',
        note: `${q.room} ${q.terms} ${practical[row.id] || ''}`.trim(),
        jpy: undefined,
        ...(q.title ? { title: q.title, sourceUrl: undefined } : {}),
        ...(q.url ? { url: q.url } : {}),
      });
    }
    if (row.category === 'transport') {
      row.checkedAt = priceCheckedAt;
      row.evidence = row.kind === 'tariff' ? 'published' : 'estimate';
      if (transportSources[row.id]) row.sourceUrl = transportSources[row.id];
      const value = tariffYen[row.id];
      if (value)
        Object.assign(row, {
          low: yen(value),
          high: yen(value),
          kind: 'tariff',
          evidence: 'published',
          jpy: jpy(value),
        });
    }
  }

  const early = ['koyasan', 'kamakura', 'hiroshima'].includes(v.id);
  const domestic = early ? 10300 : 10272;
  edit('f-moscow', {
    low: 82118,
    high: 90330,
    checkedAt: priceCheckedAt,
    evidence: 'checkout',
    note: '20.10 22:00 SVO → 22.10 19:30 OKA, JD608 / HX129 / UO824. Через Ханчжоу и Гонконг, 39 ч 30 мин, самостоятельная пересадка в Гонконге. Итог Trip.com: 78 672 ₽ + 3 446 ₽ за ручную кладь на UO824 для двоих = 82 118 ₽ при СБП. Ручная кладь и личная вещь вместе до 7 кг на человека. Сдаваемый багаж есть только на первых двух сегментах; на всём пути туда не заложен.',
  });
  edit('f-home', {
    low: 74662,
    high: 82129,
    checkedAt: priceCheckedAt,
    evidence: 'checkout',
    note: '10.11 21:55 NRT → 12.11 07:00 SVO, QR807 / QR337. Доха 21 ч 20 мин; вся дорога 39 ч 05 мин. Итог на двоих при СБП: багаж по 25 кг и ручная кладь с личной вещью вместе до 7 кг включены. Обычный тариф без студенческих условий. Отель в Дохе не включён.',
  });
  edit('f-osaka', {
    title: 'Наха → Осака · Peach MM212',
    date: `${early ? '27' : '28'} октября · 12:20–14:15`,
    low: domestic,
    high: Math.ceil(domestic * 1.1),
    kind: 'quote',
    checkedAt: priceCheckedAt,
    evidence: 'checkout',
    note: `Проверен именно ${early ? '27' : '28'} октября: Наха D → KIX T2, 12:20–14:15. Итог Trip.com при СБП на двух взрослых; ручная кладь с личной вещью вместе до 7 кг на человека, без сдаваемого багажа. Невозвратный, без изменений. Автобус из Онны 07:45 → аэропорт 09:45 оставляет 2 ч 35 мин до вылета.`,
  });

  edit('t-aquarium', {
    note: 'Kariyushi Beach ↔ Churaumi: ¥1 200 × 4 поездки = ¥4 800 на двоих. Вход в океанариум отдельно. Опубликованный тариф, места в автобусе не закреплены.',
  });
  edit('t-kix', {
    low: 1382,
    high: 1382,
    kind: 'budget',
    evidence: 'estimate',
    jpy: '¥2 500 — резерв',
    note: 'Airport Express KIX → Tengachaya: ¥970 × 2 = ¥1 940. В итог заложено ¥2 500 с запасом на городской подъезд; его повторно не считать. T2 → Aeroplaza — бесплатный шаттл, далее поезд без Rapi:t. От Tengachaya до апартаментов около 1 км.',
  });
  edit('t-narita', {
    low: 1658,
    high: 1658,
    jpy: '¥3 000 — резерв',
    note: 'Резерв за двоих с подводящим участком. Проверенный обычный Keisei Main Line из Nihombashi — ¥1 140 на человека; не Skyliner и не SKY ACCESS. Маршрут от отеля и расписание выбрать перед выездом; подвоз повторно в городском транспорте не считать.',
  });
  edit('t-fuji-local', {
    low: v.id === 'night-bus' ? 2000 : yen(4000),
    high: v.id === 'night-bus' ? 3000 : yen(5000),
    note: 'Местные автобусы к озеру и Yurari. Проездной Red / Green / Blue: ¥1 500 на человека за день или ¥2 000 за два дня; выбрать вместо оплаты тех же поездок. Шаттл Yurari бесплатен только при подтверждении времени и места; запас на непокрытый участок оставлен. Камеры хранения в ночном варианте считаются отдельно.',
  });
  edit('t-tokyo-local', {
    low: yen(6000),
    high: yen(6000),
    jpy: '¥6 000 — резерв',
    note: '¥4 000 за два Tokyo Subway Ticket 72h + ¥2 000 на JR / участки вне проездного. Активация утром 7 ноября. Аэропорт отдельно. Дополнительные поездки 5–6 ноября в варианте Камакуры — в отдельной строке.',
  });
  edit('t-kyoto-local', {
    note: `¥800 на человека в день × 4 дня. В насыщенный день можно вместо отдельных поездок купить Subway & Bus Day Pass за ¥1 100; не складывать оба способа. ${v.id === 'hiroshima' ? '2 ноября проездной JR ещё действует: за покрытые JR-участки Арасиямы повторно не платить.' : 'Межгород оплачивается отдельно.'}`,
  });
  edit('v-hakone-shuttle', {
    note: '¥200 × 4 поездки × 2 человека. Учтены заселение, утренний выезд и возвращение за багажом с повторным выездом к станции. Если часть пути пройти пешком, расходы уменьшатся.',
  });
  edit('v-hakone-tokyo', {
    high: yen(4220),
    jpy: '¥4 120–4 220',
    note: 'На двоих: Odawara → Shinjuku ¥1 820 + ticketless Romancecar ¥2 300. С бумажной доплатой итог ¥4 220. Yumoto → Odawara уже в Freepass. Без Romancecar можно сэкономить ¥2 300, но ехать дольше.',
  });
  edit('v-hiro-local', {
    note: 'Резерв на шкафчики и непокрытые трамваи между станцией и отелем у Парка мира. Meipuru-pu входит в JR Pass; его повторно не покупать. После 18 июля 2026 действует обновлённый маршрут автобуса.',
  });
  edit('t-mishima', {
    note: 'Обычный тариф ¥2 700 на человека, актуальный после 1 мая 2026. Веб-тариф ¥2 500 — возможная экономия ¥400 на двоих; в итог пока не вычиталась. Наличие ноябрьских мест проверять при открытии продаж.',
  });
  edit('t-tokyo', {
    note: 'Kawaguchiko → Shinjuku: ¥2 200 на человека. Веб-тариф ¥2 000 может сэкономить ¥400 на двоих, скидка пока не вычиталась. Продажи за месяц; для поездок с октября бронирование переводится на FujiyamaConnect.',
  });

  const narutoDate = v.costs.find((c) => c.id === 't-naruto')!.date;
  v.costs = v.costs.filter((c) => !['t-naruto', 'p-naruto'].includes(c.id));
  v.costs.push({
    id: 't-naruto-combo',
    category: 'transport',
    title: 'Наруто · автобус туда-обратно + вход Light',
    date: narutoDate,
    low: yen(12800),
    high: yen(15600),
    kind: 'tariff',
    checkedAt: priceCheckedAt,
    evidence: 'published',
    jpy: '¥12 800; запасной вариант ¥15 600',
    note: 'Единый пакет JR Bus по ¥6 400 на человека: JR Osaka / OCAT ↔ Nijigen no Mori и NARUTO Light. Автобус и вход уже вместе в этой строке. Пакет действует два дня; продаётся в кассах JR Osaka / OCAT и Rakuten Travel. Наличие на вашу дату не проверено. Нижняя сумма — пакет; верхняя — отдельные автобус ¥7 400 + вход до ¥8 200 на двоих, если пакет недоступен.',
    url: 'https://timetable.nishinihonjrbus.co.jp/faretable/5-1-D.html',
  });
  edit('t-reserve', {
    low: 3215,
    high: 3215,
    note: 'Остаток первоначального запаса 4 500 ₽ после выделения 1 285 ₽ на Ханчжоу. Такси в Нахе, смена планов и непредвиденные подвозы; не дублирует аэропортовые билеты и городские резервы.',
  });
  v.costs.push({
    id: 't-hgh',
    category: 'transport',
    title: 'Ханчжоу · аэропорт ↔ транзитный отель',
    date: '21–22 октября',
    low: 1285,
    high: 1542,
    kind: 'budget',
    checkedAt: priceCheckedAt,
    evidence: 'estimate',
    note: 'Резерв 100–120 CNY за одну машину на двоих, две поездки. Бесплатный шаттл отеля по времени ещё не согласован. 1 285 ₽ выделены из общего запаса, повторного счёта нет. Это бюджет, а не фиксированная цена такси.',
    url: 'https://www.hzairport.com/mobile/guide/taxi.html',
  });
  edit('d-tax', {
    checkedAt: priceCheckedAt,
    evidence: 'estimate',
    note: `Резерв 2 500 ₽ на местные гостиничные сборы. Киото: ориентир ${v.id === 'kamakura' ? '¥3 200' : '¥1 600'} на двоих за 4 ночи по стоимости без питания и НДС; точную базу подтвердит отель. ${v.id === 'hiroshima' ? 'Хиросима: возможны ещё ¥400 на двоих.' : ''} ${v.id === 'hakone' ? 'Онсэнный налог Pax Yoshino уже включён в цену номера.' : ''} Сбор из ваучера повторно не платить.`,
    sourceUrl:
      'https://www.city.kyoto.lg.jp/gyozai/cmsfiles/contents/0000236/236952/A4tirashi.pdf',
  });
  if (v.id === 'kamakura') {
    v.tag = 'Море и храмы';
    v.tradeoff =
      'Окинава короче на ночь. Дополнительная ночь Токио нужна для выезда к морю. Киото 31 октября — 4 ноября сейчас стоит 35 804 ₽: ранние даты заметно дороже заезда 1 ноября.';
  }
  return v;
}
