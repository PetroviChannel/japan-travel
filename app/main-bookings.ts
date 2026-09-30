import type { RouteDay } from './route-data';

const hotelLink = (id: number, from: string, to: string) =>
  `https://ru.trip.com/hotels/detail/?hotelId=${id}&checkIn=${from}&checkOut=${to}&adult=2&crn=1&curr=RUB&locale=ru-RU`;

export const bookedHotels = {
  tokyo: {
    title: 'APA Hotel Ningyocho Ekikita',
    query:
      'APA Hotel Ningyocho Ekikita, 2-9-4 Nihonbashi Horidomecho, Chuo-ku, Tokyo',
    link: 'https://travel.yandex.ru/hotels/tokyo/apa-hotel-ningyocho-ekikita/?adults=2&checkinDate=2026-11-06&checkoutDate=2026-11-10&roomCount=1',
  },
  transit: {
    title: 'Hangzhou Xiaoshan International Airport Urba Hotel',
    query:
      'Hangzhou Xiaoshan International Airport Urba Hotel, Building 3 No.92 Xiangfei Road, Xiaoshan District, Hangzhou',
    link: hotelLink(109847341, '2026-10-21', '2026-10-22'),
  },
  naha: {
    title: 'Mr.KINJO in UENOKURA',
    query: 'Mr.KINJO in UENOKURA, 2 Chome-1-6 Tsuji, Naha, Okinawa',
    link: hotelLink(3053374, '2026-10-22', '2026-10-25'),
  },
  chatan: {
    title: 'Luana Uakoko Resort Hotel',
    query: 'Luana Uakoko Resort Hotel, 1-chome-6-23 Kuwae, Chatan, Okinawa',
    link: hotelLink(13911923, '2026-10-25', '2026-10-28'),
  },
  osaka: {
    title: 'AkiraHome Tsutenkaku',
    query:
      'AkiraHome Tsutenkaku, Ebisuhigashi 2-9-1 Grand Heights Hishitomi, Osaka',
    link: hotelLink(124190940, '2026-10-28', '2026-11-01'),
  },
  kyoto: {
    title: 'ATO Hotel Kyoto',
    query: 'ATO Hotel Kyoto, 78-3 Shinmaruta-cho, Sakyo-ku, Kyoto',
    link: hotelLink(9273053, '2026-11-01', '2026-11-05'),
  },
};

export const plannedFujiStay = {
  title: 'Villa House · Airbnb у озера Кавагутико',
  // The exact home address is disclosed by the host after booking.
  areaQuery: 'Kawaguchiko Excursion Boat Ensoleille',
  link: 'https://www.airbnb.ru/rooms/1709535480452656858?adults=2&check_in=2026-11-05&check_out=2026-11-06&guests=2',
};

// Apply confirmed stays only to the main itinerary; alternatives keep their hotels.
export function updateBookedDay(day: RouteDay): RouteDay {
  const replaceHotel = (text: string) =>
    text
      .replaceAll('Hotel Horidome Villa Tokyo', bookedHotels.tokyo.query)
      .replaceAll('Horidome Villa', bookedHotels.tokyo.title)
      .replaceAll('От Horidome', 'От APA Ningyocho')
      .replaceAll('До Horidome', 'До APA Ningyocho')
      .replaceAll('Mr.KINJO in MIEGUSUKU Naha Okinawa', bookedHotels.naha.query)
      .replaceAll(
        'nippori Osaka Nishitengachaya Guesthouse Osaka',
        bookedHotels.osaka.query,
      )
      .replaceAll('nippori', bookedHotels.osaka.title)
      .replaceAll('KIORI Exec Gojo Kyoto', bookedHotels.kyoto.query)
      .replaceAll('KIORI Exec Gojo', bookedHotels.kyoto.title)
      .replaceAll('KIORI', bookedHotels.kyoto.title);
  const next: RouteDay = {
    ...day,
    hotel: replaceHotel(day.hotel),
    origin: replaceHotel(day.origin),
    note: replaceHotel(day.note),
    stops: day.stops.map((stop) => ({
      ...stop,
      title: replaceHotel(stop.title),
      query: replaceHotel(stop.query),
      leg: replaceHotel(stop.leg),
      detail: replaceHotel(stop.detail),
    })),
  };
  if (day.date >= '2026-10-22' && day.date <= '2026-10-24')
    next.hotel = `${bookedHotels.naha.title} · 22–25 октября`;
  if (day.date === '2026-10-22') {
    next.note =
      'Рейс UO844 из Гонконга прибывает в Наху 22 октября в 18:05 по местному времени. После контроля едем в забронированный Mr.KINJO in UENOKURA; заезд 15:00–21:00. При задержке рейса согласовать поздний заезд.';
    next.stops[0] = {
      ...next.stops[0],
      time: '18:05–19:15',
      detail:
        'Купленный рейс UO844: Гонконг 14:25 → Наха 18:05. Паспортный контроль, получение багажа при наличии, выход в город. На выход заложено 70 минут; очереди могут изменить этот план.',
    };
    next.stops[1] = {
      ...next.stops[1],
      time: '19:15–20:15',
      detail:
        'Едем в Mr.KINJO in UENOKURA, 2 Chome-1-6 Tsuji. Построить маршрут от аэропорта к этому адресу; выбрать монорельс с пешим участком или такси. Один номер на двоих, без питания; выезд 25 октября до 12:00.',
      leg: 'Аэропорт → UENOKURA: плановый час с запасом',
      duration: '60 мин с запасом',
    };
    next.stops[2] = { ...next.stops[2], time: '20:15–21:00' };
  }
  if (day.date === '2026-10-23') {
    next.stops[0] = {
      ...next.stops[0],
      detail:
        'От UENOKURA построить путь к удобной станции Yui Rail и ехать до Shuri. От станции Shuri до парка ещё около 15 минут пешком.',
      leg: 'UENOKURA → Shuri: время проверить по карте',
    };
  }
  if (day.date === '2026-10-28') {
    const index = next.stops.findIndex((s) =>
      s.purchaseIds?.includes('h-osaka'),
    );
    next.stops[index] = {
      ...next.stops[index],
      detail:
        'Из терминала Кансай доехать к AkiraHome Tsutenkaku, Ebisuhigashi 2-9-1, Grand Heights Hishitomi. Построить маршрут по карте и следовать инструкции заселения из брони. Один номер на двоих, без питания; заезд после 15:00, выезд 1 ноября до 10:00.',
    };
    next.stops.at(-1)!.leg = 'AkiraHome → Дотонбори: выбрать маршрут по карте';
  }
  if (day.date === '2026-10-29') {
    next.stops[0] = {
      ...next.stops[0],
      detail:
        'От AkiraHome построить маршрут через JR к Universal City и прибыть к воротам за час до открытия. Завтрак до входа; время дороги проверить на выбранное утро.',
      duration: 'По выбранному маршруту',
    };
    next.stops.at(-1)!.leg =
      'Universal City → AkiraHome: по выбранному маршруту';
  }
  if (day.date === '2026-10-30' || day.date === '2026-10-31')
    next.stops[0].leg = 'От AkiraHome: время дороги проверить по карте';
  if (day.date === '2026-10-24') {
    next.stops[0] = {
      ...next.stops[0],
      time: 'К 08:40 · выход по карте',
      detail:
        'Выйти из UENOKURA с запасом к регистрации на паром. Построить дорогу к нужному причалу Tomari по адресу в билете; выбрать пеший маршрут или такси. Взять наличные, воду и пляжные вещи.',
      leg: 'UENOKURA → Tomari: время проверить по карте',
      duration: 'По выбранному маршруту',
    };
  }
  if (day.date === '2026-11-01') {
    next.note = `Выселиться из AkiraHome Tsutenkaku до 10:00. ${next.note}`;
    next.stops[0] = {
      ...next.stops[0],
      time: '08:30–10:00',
      title: 'Завтрак, сборы и выселение',
      query: bookedHotels.osaka.query,
      detail:
        'Позавтракать, собрать вещи и выселиться из AkiraHome до 10:00. Хранение багажа после выезда возможно только по подтверждённой договорённости.',
      leg: 'AkiraHome и рядом',
      mode: 'none',
      duration: '1 ч 30 мин',
    };
    next.stops[1] = {
      ...next.stops[1],
      title: 'Переезд в Киото',
      leg: 'AkiraHome → Киото: время дороги проверить по карте',
    };
    next.stops[2] = {
      ...next.stops[2],
      time: '14:00–16:30',
      title: 'Обед и заселение в ATO Hotel',
      query: bookedHotels.kyoto.query,
      detail:
        'Забронирован ATO Hotel Kyoto, 78-3 Shinmaruta-cho, Sakyo-ku. Один Double 11 м² с двуспальной кроватью, для двух взрослых, без питания, некурящий. Заезд после 16:00; раннее хранение багажа согласовать отдельно. Sanjo Keihan и Sanjo рядом с отелем. Выезд 5 ноября до 11:00.',
      leg: 'Kawaramachi → ATO Hotel: построить путь по карте',
      duration: 'Обед и ожидание заезда с 16:00',
    };
    next.stops[3] = {
      ...next.stops[3],
      time: '16:45–18:30',
      detail:
        'После заселения пройти к Камогаве и Понтотё, поужинать в центре. Большой маршрут по Гиону остаётся на 4 ноября.',
      leg: 'От ATO Hotel к Камогаве и Понтотё пешком по карте',
      mode: 'walking',
      duration: '1 ч 45 мин',
    };
  }
  if (day.date >= '2026-11-01' && day.date <= '2026-11-04')
    next.hotel = `${bookedHotels.kyoto.title} · 1–5 ноября`;
  if (day.date === '2026-11-02')
    next.stops[0] = {
      ...next.stops[0],
      detail:
        'От Sanjo Keihan по линии Tozai до Nijo, затем JR Sagano Line до Saga-Arashiyama. Подходы и отправления проверить по карте; заложить запас к открытию Тэнрюдзи.',
      leg: 'ATO Hotel → Sanjo Keihan → Nijo → Saga-Arashiyama',
      duration: '60 мин с запасом; сверить маршрут',
    };
  if (day.date === '2026-11-03') {
    next.stops[0] = {
      ...next.stops[0],
      title: 'Доехать к Фусими Инари',
      query: 'Fushimi Inari Station Kyoto',
      detail:
        'От ближайшей станции Sanjo по Keihan до Fushimi-inari, затем пешком к святилищу. Выбрать поезд, который останавливается на Fushimi-inari; время выхода проверить на утро праздника.',
      leg: 'ATO Hotel → Sanjo → Fushimi-inari',
      duration: '45 мин с запасом; сверить отправление',
    };
    next.stops[1].leg = 'От Fushimi-inari пешком к входу по карте';
    next.stops[2].leg = 'Fushimi-inari → Sanjo → ATO Hotel';
    next.stops[3].leg = 'Sanjo Keihan → Nijojo-mae по Tozai, затем пешком';
  }
  if (day.date === '2026-11-04')
    next.stops[0] = {
      ...next.stops[0],
      detail:
        'От ATO Hotel выбрать путь через Sanjo и Kiyomizu-Gojo либо подходящий автобус, затем пешком в гору к Киёмидзу. На выбранное утро сверить маршрут; оставлен час с запасом.',
      leg: 'ATO Hotel → Киёмидзу: транспорт и подъём по карте',
    };
  if (day.date >= '2026-11-06' && day.date <= '2026-11-10') {
    next.hotel = `${bookedHotels.tokyo.title} · забронирован 6–10 ноября · 27 000 ₽`;
  }
  if (day.date === '2026-11-06') {
    const arrival = next.stops.find((stop) =>
      stop.purchaseIds?.includes('h-tokyo'),
    );
    if (arrival) {
      arrival.query = bookedHotels.tokyo.query;
      arrival.detail =
        'Из Синдзюку по Toei Shinjuku Line до Bakuro-yokoyama, затем пешком около 10–15 минут к забронированному APA Hotel Ningyocho Ekikita, 2-9-4 Nihonbashi Horidomecho. Сверить выход и путь по карте с чемоданами. Бронь 6–10 ноября на двоих за 27 000 ₽; стандартный заезд с 15:00, выезд до 10:00. Сегодня заселение и ужин, основные прогулки в Токио — 7–9 ноября.';
      arrival.leg = 'Синдзюку → Bakuro-yokoyama → APA Ningyocho';
    }
  }
  return next;
}
