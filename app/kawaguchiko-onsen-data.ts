import type {
  OnsenMapHotel,
  OnsenMapBath,
  OnsenMapPair,
} from './kawaguchiko-onsen-map';

export const kawaYenRate = 0.552789;
export const kawaBooking = (
  id: number,
  slug: string,
  checkIn = '2026-11-05',
  checkOut = '2026-11-06',
) =>
  `https://ru.trip.com/hotels/fujikawaguchiko-hotel-detail-${id}/${slug}/?checkin=${checkIn}&checkout=${checkOut}&adult=2&crn=1&curr=RUB`;

export const kawaHotels: OnsenMapHotel[] = [
  {
    id: 'royal',
    name: 'Royal Hotel Kawaguchiko',
    query: 'Royal Hotel Kawaguchiko 6713-22 Funatsu',
    priceRub: 15530.08,
    priceLabel: '5–6 ноября 2026 · ночь на двоих · без питания · налог включён',
    bookingUrl: kawaBooking(706299, 'fuji-royal-hotel-kawaguchiko'),
    summary:
      'На ваши даты — японский Run of House, 10–15 м², в тарифе прямо указаны 3 футона. Комнату назначают при заезде; вид и собственный санузел не гарантированы описанием. Это отель с японскими комнатами, не старинный деревянный рёкан. Общий термальный Kaiun no Yu уже включён в проживание.',
  },
  {
    id: 'yamagishi',
    name: 'Yamagishi Ryokan',
    query: 'Yamagishi Ryokan Kawaguchiko',
    priceRub: 17426.7,
    priceLabel: '5–6 ноября 2026 · ночь на двоих · без питания · налог включён',
    bookingUrl: kawaBooking(704687, 'yamagisi-ryokan'),
    summary:
      'Run of House с 6 футонами по описанию категории, собственная ванная; цена на двоих. Размер и вид определяются при заезде. Японский интерьер обновлённый, без обещания старины. Есть свой общий термальный онсэн для проживающих: посещать другой — по желанию. Близко к станции и южному берегу.',
  },
  {
    id: 'kashiwaya',
    name: 'Kashiwaya · только 6–7 ноября',
    query: 'Wafu Guesthouse Kashiwaya Kawaguchiko',
    priceRub: 6735.45,
    priceLabel: 'ДРУГАЯ НОЧЬ: 6–7 ноября 2026 · двое · лёгкий завтрак',
    bookingUrl: kawaBooking(
      5931691,
      'wafu-guesthouse-kashiwaya',
      '2026-11-06',
      '2026-11-07',
    ),
    summary:
      'Лучше для атмосферы: японский гостевой дом старше 60 лет, эпоха Сёва. Отдельная японская комната 12,5 татами / 20 м², общие туалеты и душевые. На 5–6 ноября Trip.com номера не предлагает. Эта цена проверена только на 6–7 ноября: перенос ночи требует изменить даты Киото и Токио, в текущий маршрут он не внесён.',
  },
];

export const kawaBaths: OnsenMapBath[] = [
  {
    id: 'kaiun',
    name: 'Kaiun no Yu · Royal Hotel',
    query: 'Royal Hotel Kawaguchiko 6713-22 Funatsu',
    entryYen: 1000,
    description:
      'Настоящий термальный онсэн у центральной набережной: общие внутренние и садовые открытые купальни. Сторонних гостей принимают за плату; проживающим в Royal вход бесплатный. Вид на Фудзи из воды не обещан.',
    extrasLabel:
      'Для непроживающих: дневной вход на 2 часа, итог со своими полотенцами. Маленькое купить ¥350, банное арендовать ¥500 за человека; два комплекта +¥1700 ≈ 940 ₽. Будний купон может снизить вход до ¥900/чел, в расчёт скидку не включаем. Гостям Royal эти дневные доплаты автоматически не начисляются: полотенца и гостевые часы — по условиям отеля.',
    hours:
      'Для дневных посетителей часы меняются: уточнить дату по +81 555-73-2655. Проживающим в Royal часы посещения сообщит стойка; дневной билет покупать не нужно.',
    sourceUrl: 'https://www.fuji-royalhotel.jp/onsen.php',
  },
  {
    id: 'mifujien',
    name: 'Mifujien · онсэн с видом',
    query: 'Hotel Mifujien 207 Azagawa Kawaguchiko',
    entryYen: 1200,
    description:
      'Общие термальные купальни на 7-м этаже с видом на Кавагутико и Фудзи. Можно прийти без проживания; отсутствие свободных номеров не означает запрет дневного входа.',
    extrasLabel:
      'Прокатное полотенце включено. Вход оплачивается на месте. Для дневных посетителей нет гостиничного шаттла и комнаты отдыха. Вид Фудзи зависит от погоды.',
    hours:
      'Дневной приём 13:00–20:00, купание до 21:00. Бывают закрытия и ограничения: календарь на ноябрь ещё не опубликован, уточнить 5 или 6 ноября по +81 555-72-1044.',
    sourceUrl: 'https://www.mifujien.co.jp/onsen/',
  },
  {
    id: 'yurari',
    name: 'Yurari · поездка на шаттле',
    query: 'Fuji Chobo no Yu Yurari Narusawa 8532-5',
    entryYen: 1400,
    description:
      'Отдельный дневной комплекс с природной термальной водой и видом на Фудзи. Это Нарусава, не пешая прогулка у озера. Добавлен как запасной вариант, если близкие купальни не принимают.',
    extrasLabel:
      'Будний дневной тариф, маленькое и банное полотенца включены. Бесплатный шаттл от станции только по брони минимум за час: 11:00, 13:00, 15:00, 18:00; назад 12:30, 14:30, 17:30, 20:00, запись у стойки. Если мест нет, платный автобус/такси в итог не включены.',
    hours:
      'Будни 10:00–21:00, последний вход 20:00. После заселения удобнее заранее согласованный рейс; в 18:00 вид Фудзи уже не рассчитываем увидеть.',
    sourceUrl: 'https://www.fuji-yurari.jp/charge-plan.html',
  },
];

const walk = (
  hotelId: string,
  bathId: string,
  walkKm: number,
  walkMinutes: number,
): OnsenMapPair => ({
  hotelId,
  bathId,
  walkKm,
  walkMinutes,
  travelLabel:
    'Туда и обратно пешком: проезд ¥0; расстояние и время указаны в одну сторону.',
  transportYenForTwo: 0,
  mode: 'walking',
  distanceNote:
    'Пеший маршрут Google Maps проверен 8 сентября 2026; время без остановок, для плана округляйте вверх.',
});
const shuttle = (hotelId: string, stationWalk: string): OnsenMapPair => ({
  hotelId,
  bathId: 'yurari',
  walkKm: null,
  walkMinutes: null,
  mode: 'transit',
  transportYenForTwo: 0,
  travelLabel: `До станции ${stationWalk}, затем около 20–30 минут на заранее забронированном бесплатном шаттле. Назад также шаттл + пешком. Ожидание отдельно.`,
  distanceNote:
    'Далеко от берега; пешком весь путь не планируем. Нулевая цена дороги действует только при подтверждённых бесплатных местах в обе стороны. Google Maps может показать платные рейсы вместо шаттла.',
});
export const kawaPairs: OnsenMapPair[] = [
  {
    ...walk('royal', 'kaiun', 0, 0),
    entryYenForTwo: 0,
    travelLabel: 'В том же отеле, после заселения никуда ехать не нужно.',
    distanceNote:
      'Для гостей Royal вход уже включён в проживание; отдельно дневной билет не покупать.',
  },
  walk('royal', 'mifujien', 2, 28),
  shuttle('royal', 'около 20 минут пешком'),
  walk('yamagishi', 'kaiun', 0.75, 10),
  walk('yamagishi', 'mifujien', 1.3, 18),
  shuttle('yamagishi', 'около 10–12 минут пешком'),
  walk('kashiwaya', 'kaiun', 1.3, 17),
  walk('kashiwaya', 'mifujien', 2, 26),
  shuttle('kashiwaya', 'около 5 минут пешком'),
];
