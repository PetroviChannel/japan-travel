import { updateFujiDay } from './main-fuji-days';
import { updateTokyoDay } from './main-tokyo-days';
import { routeDays, type RouteDay, type RouteStop } from './route-data';
import { bookedHotels, updateBookedDay } from './main-bookings';

const chatanHotel = bookedHotels.chatan.query;
const chatanGateway = 'Chatan Gateway Okinawa';
const chatanBusSource = {
  label: 'Chatan Gateway: расписание и билеты',
  url: 'https://chatan-gateway.com/en/',
};
const yomitanBusSource = {
  label: 'Ёмитан: автобусы и пешие подходы',
  url: 'https://www.yomitan-kankou.jp/access/bus_route/',
};

function mainOkinawaDay(day: RouteDay): RouteDay | undefined {
  if (day.date === '2026-10-25') {
    return {
      ...day,
      city: 'Наха → Чатан',
      title: 'Вторая база: Американская деревня и море',
      hotel: 'Luana Uakoko Resort Hotel · 25–28 октября',
      pace: 'Переезд, заселение и вечер в American Village',
      note: 'Живём в Luana Uakoko Resort Hotel, 1-chome-6-23 Kuwae, Chatan. Вечером гуляем по American Village. Заезд 15:00–21:00, выезд 28 октября до 10:00; хранение чемоданов до заселения согласовать отдельно. Автобусные часы — опубликованное расписание, подходы от нового отеля и остальные интервалы проверить по карте.',
      walk: [
        'Mihama American Village Chatan Okinawa',
        'Depot Island Chatan Okinawa',
        'Sunset Beach Chatan Okinawa',
      ],
      stops: [
        {
          time: '09:00–10:00',
          title: 'Завтрак, сборы и выселение',
          query: day.origin,
          detail:
            'Собрать пляжные вещи, получить инструкцию заезда в Luana Uakoko. Выселиться из UENOKURA до 12:00 с запасом на дорогу к автобусу; чемоданы остаются с вами.',
          leg: 'В отеле Нахи и рядом',
          mode: 'none',
          kind: 'rest',
          duration: '60 мин',
        },
        {
          time: 'К 11:45 · выход по карте',
          title: 'К остановке Kokusai-dori Iriguchi',
          query: 'Kokusai Dori Iriguchi Tokyo Bus Naha',
          detail:
            'Нужна остановка TK05 в сторону Chatan Gateway. Уточнить сторону посадки на схеме перевозчика и прийти с запасом; багаж можно поместить в отсек автобуса.',
          leg: 'UENOKURA → Kokusai-dori Iriguchi: маршрут проверить по карте',
          mode: 'walking',
          kind: 'travel',
          duration: 'По выбранному маршруту',
          source: chatanBusSource,
        },
        {
          time: '12:00–12:45',
          title: 'Прямой автобус TK05 в Чатан',
          query: chatanGateway,
          detail:
            'Переезд от южного входа Кокусай-дори до Chatan Gateway. В плане ¥2000 на двух взрослых; дорожные задержки возможны.',
          leg: 'Наха → Чатан: по расписанию 45 мин',
          mode: 'transit',
          kind: 'travel',
          duration: '45 мин',
          purchaseIds: ['t-onna'],
          source: chatanBusSource,
          published: true,
        },
        {
          time: '13:00–14:15',
          title: 'Обед в районе Михама',
          query: 'Mihama American Village Chatan Okinawa',
          detail:
            'Выбрать кафе с местом для чемоданов, пообедать и переждать до заезда. Основную прогулку по деревне оставляем на вечер после сдачи вещей.',
          leg: 'Рядом с автобусной остановкой',
          mode: 'walking',
          kind: 'rest',
          duration: '75 мин',
        },
        {
          time: '14:15–15:30',
          title: 'Пройти к Luana Uakoko и заселиться',
          query: chatanHotel,
          detail:
            'Забронирован один номер на двоих, без питания. Построить путь к Luana Uakoko, 1-chome-6-23 Kuwae; заезд с 15:00 до 21:00, оставить чемоданы и отдохнуть. Фактическая сумма сохранена во вкладке «Покупки».',
          leg: 'Chatan Gateway → Luana Uakoko: по карте',
          mode: 'walking',
          kind: 'travel',
          duration: '75 мин с запасом',
          purchaseIds: ['h-onna'],
        },
        {
          time: '16:00–17:00',
          title: 'Американская деревня',
          query: 'Mihama American Village Chatan Okinawa',
          detail:
            'Магазины, яркие улицы и небольшие кафе. От Luana Uakoko построить пеший маршрут к комплексу; гуляем без багажа.',
          leg: 'Luana Uakoko → American Village: по карте',
          mode: 'walking',
          kind: 'main',
          duration: '60 мин',
        },
        {
          time: '17:00–18:30',
          title: 'Depot Island, набережная и Sunset Beach',
          query: 'Depot Island Chatan Okinawa',
          detail:
            'Продолжить к прибрежным улочкам, пройти к Sunset Beach и выбрать место на ужин. Пляжный отдых запланирован отдельно 27 октября, сегодня — прогулка у воды.',
          leg: 'По району Михама пешком',
          mode: 'walking',
          kind: 'main',
          duration: '90 мин',
        },
      ] satisfies RouteStop[],
    };
  }
  if (day.date === '2026-10-26') {
    return {
      ...day,
      city: 'Чатан / Ёмитан',
      title: 'Дзакими и деревня керамики Ятимун-но-Сато',
      hotel: bookedHotels.chatan.title,
      origin: chatanHotel,
      pace: 'Культура Окинавы · около 6–8 км пешком за день',
      note: 'Едем автобусом №29 через Kina: сначала замок, затем мастерские, которые открываются позже. Замок → Ятимун: 2,8 км / 39 минут по Google Maps, в плане 50 минут. На автобусы заложен резерв ¥3200 на двоих, точный тариф ещё не проверен. Вход в замок и прогулка по деревне бесплатны; музей, мастер-классы и покупки отдельно. Часы автобусов взяты из опубликованной таблицы перевозчика с 16.10.2023 — перед октябрём 2026 перепроверить. У №29 редкие рейсы; №28 идёт другим путём.',
      walk: ['Zakimi Castle Ruins Okinawa', 'Yachimun no Sato Okinawa'],
      stops: [
        {
          time: 'К 08:30 · выход по карте',
          title: 'К остановке Chatan на шоссе 58',
          query: 'Chatan via Kadeno Goya Bus Stop Okinawa',
          detail:
            'Построить подход от Luana Uakoko к остановке Chatan в направлении Kadena / Goya. Нужен автобус №29 через Kina в сторону Yomitan. Время выхода подобрать по карте, чтобы быть на остановке к 08:30; проверить более удобную посадку, если она есть.',
          leg: 'Luana Uakoko → остановка Chatan: по карте',
          mode: 'walking',
          kind: 'travel',
          duration: 'По выбранному маршруту',
          source: yomitanBusSource,
        },
        {
          time: '08:38–09:05',
          title: 'Автобус №29 до Zakimi',
          query: 'Zakimi Bus Stop Yomitan Okinawa',
          detail:
            'Выйти на остановке Zakimi (座喜味), от неё около 12–15 минут пешком вверх к замку. Это опубликованный будний рейс; накануне проверить движение и время.',
          leg: 'Chatan → Zakimi',
          mode: 'transit',
          kind: 'travel',
          duration: '27 мин по таблице',
          purchaseIds: ['t-aquarium'],
          source: {
            label: '№29: будни в сторону Ёмитана',
            url: 'https://daiichibus.co.jp/ryukyubus/wp-content/uploads/2023/10/29-timetable-weekday-down.pdf',
          },
          published: true,
        },
        {
          time: '09:20–10:10',
          title: 'Замок Дзакими: стены и виды',
          query: 'Zakimi Castle Ruins Okinawa',
          detail:
            'Каменные стены и арочные ворота рюкюского замка, прогулка по территории с видом на Ёмитан. Вход свободный. Соседний музей не включён в программу.',
          leg: 'От остановки Zakimi 12–15 мин пешком',
          mode: 'walking',
          kind: 'main',
          duration: '50 мин',
          purchaseIds: ['p-churaumi'],
          source: {
            label: 'Дзакими: муниципальная страница',
            url: 'https://www.vill.yomitan.okinawa.jp/soshiki/bunka_shinko/gyomu/shisetsu/1415.html',
          },
        },
        {
          time: '10:10–11:00',
          title: 'Пешком к деревне керамики',
          query: 'Yachimun no Sato Okinawa',
          detail:
            'По Google Maps 2,8 км и 39 минут; оставляем 50 минут на спокойный путь. Есть спуски и участки вдоль дороги, идти по построенному маршруту. В сильную жару можно заменить этот участок коротким такси из общего резерва.',
          leg: 'Дзакими → Ятимун-но-Сато: 2,8 км',
          mode: 'walking',
          kind: 'travel',
          duration: '50 мин',
        },
        {
          time: '11:00–12:15',
          title: 'Ятимун-но-Сато: мастерские и печи',
          query: 'Yachimun no Sato Okinawa',
          detail:
            'Деревня окинавской керамики: открытые галереи, посуда ручной работы и виды на традиционные печи. У мастерских разные часы и выходные; вход на прогулку свободный. Мастер-класс не забронирован и в смету не включён.',
          leg: 'По деревне пешком',
          mode: 'walking',
          kind: 'main',
          duration: '75 мин',
          source: {
            label: 'Ятимун: мастерские и режим работы',
            url: 'https://www.yomitan-kankou.jp/tourist/watch/1611319504/',
          },
        },
        {
          time: '12:15–13:00',
          title: 'Обед рядом с мастерскими',
          query: 'Yachimun no Sato Okinawa',
          detail:
            'Выбрать открытое кафе без долгого ожидания или перекусить взятой с собой едой. Закончить к 13:00, чтобы не пропустить автобус.',
          leg: 'В районе деревни',
          mode: 'walking',
          kind: 'rest',
          duration: '45 мин',
        },
        {
          time: '13:00–13:20',
          title: 'К остановке Oyashi (親志)',
          query: 'Oyashi Bus Stop Yomitan Okinawa',
          detail:
            'От деревни примерно 10–15 минут пешком. Нужна сторона в направлении Нахи. Прийти к 13:20 и дождаться №29.',
          leg: 'Ятимун-но-Сато → Oyashi',
          mode: 'walking',
          kind: 'travel',
          duration: '20 мин с запасом',
          source: yomitanBusSource,
        },
        {
          time: '13:34–14:03',
          title: 'Автобус №29 обратно в Чатан',
          query: 'Chatan Bus Stop Okinawa',
          detail:
            'Возвращаемся в Чатан, затем в Luana Uakoko. По опубликованной таблице следующий №29 от Oyashi только в 16:34, поэтому обед и прогулку не затягиваем; при пропуске проверить другие маршруты в Bus Navi.',
          leg: 'Oyashi → Chatan',
          mode: 'transit',
          kind: 'travel',
          duration: '29 мин по таблице',
          source: {
            label: '№29: будни в сторону Нахи',
            url: 'https://daiichibus.co.jp/ryukyubus/wp-content/uploads/2023/10/29-timetable-weekday-up.pdf',
          },
          published: true,
        },
        {
          time: 'После автобуса · до 16:00',
          title: 'Отдохнуть в отеле',
          query: chatanHotel,
          detail:
            'После пешей части дня вернуться в номер, оставить покупки и отдохнуть. Вечер остаётся свободным для моря.',
          leg: 'Остановка Chatan → Luana Uakoko: по карте',
          mode: 'walking',
          kind: 'rest',
          duration: 'По времени прибытия в отель',
        },
        {
          time: '16:00–18:00',
          title: 'Море и вечер у Американской деревни',
          query: 'Sunset Beach Chatan Okinawa',
          detail:
            'Неспешная прогулка к Sunset Beach, набережной Depot Island и кафе. Если устали, сократить прогулку и отдохнуть в отеле.',
          leg: 'Luana Uakoko → Михама: по карте',
          mode: 'walking',
          kind: 'rest',
          duration: '2 часа',
        },
      ] satisfies RouteStop[],
    };
  }
  if (day.date === '2026-10-27') {
    return {
      ...day,
      city: 'Чатан',
      title: 'Пляж Араха и вечер в Американской деревне',
      hotel: bookedHotels.chatan.title,
      origin: chatanHotel,
      pace: 'Море и прогулки пешком',
      note: 'Пляж Араха, отдых в отеле, Sunset Beach и вечерняя Михама. Подходы от Luana Uakoko проверить по карте и при необходимости выбрать транспорт. Купальный сезон Арахи продолжается по октябрь, точные часы и разрешение на купание зависят от погоды. К вечеру проверить бронь LIM-A на завтра и рейс Peach.',
      walk: [
        'Araha Beach Chatan Okinawa',
        'Sunset Beach Chatan Okinawa',
        'Mihama American Village Chatan Okinawa',
      ],
      stops: [
        {
          time: '09:00–10:00',
          title: 'Завтрак и сборы на пляж',
          query: chatanHotel,
          detail:
            'Неспешное утро. Взять воду, полотенца и защиту от солнца; на пляж идём пешком.',
          leg: 'В отеле и рядом',
          mode: 'none',
          kind: 'rest',
          duration: '60 мин',
        },
        {
          time: '10:00–12:30',
          title: 'Пляж Араха',
          query: 'Araha Beach Chatan Okinawa',
          detail:
            'Главный пляжный блок дня: песок, море и парк. Купаться в открытой зоне под надзором спасателей. Шезлонги, душ, шкафчики и водные развлечения оплачиваются отдельно по выбранным услугам.',
          leg: 'Luana Uakoko → Араха: маршрут проверить по карте',
          mode: 'walking',
          kind: 'main',
          duration: '2 ч 30 мин',
          source: {
            label: 'Араха: сезон и услуги',
            url: 'https://chatantourism.com/en/spot/araha-beach/',
          },
        },
        {
          time: '12:30–15:30',
          title: 'Обед и отдых в отеле',
          query: chatanHotel,
          detail:
            'Поесть, вернуться в Luana Uakoko и отдохнуть от солнца. Дорогу обратно и запас времени проверить по карте.',
          leg: 'Араха → Luana Uakoko: по карте',
          mode: 'walking',
          kind: 'rest',
          duration: '3 часа',
        },
        {
          time: '16:00–17:00',
          title: 'Sunset Beach и прогулка у воды',
          query: 'Sunset Beach Chatan Okinawa',
          detail:
            'Пройти через район Михама к пляжу. Вечером планируем набережную и виды, без обязательного купания.',
          leg: 'Luana Uakoko → Sunset Beach: по карте',
          mode: 'walking',
          kind: 'main',
          duration: '60 мин',
        },
        {
          time: '17:00–19:00',
          title: 'American Village: ужин и огни Михамы',
          query: 'Mihama American Village Chatan Okinawa',
          detail:
            'Свободное время в любимой части района: кафе, магазины или набережная Depot Island. Затем вернуться в Luana Uakoko и собрать вещи перед перелётом.',
          leg: 'От Sunset Beach пешком по району',
          mode: 'walking',
          kind: 'rest',
          duration: '2 часа',
        },
      ] satisfies RouteStop[],
    };
  }
  if (day.date === '2026-10-28') {
    return {
      ...day,
      city: 'Чатан → Осака',
      origin: chatanHotel,
      note: 'В аэропорт едем LIM-A из Chatan Gateway по предварительной брони. Автобус 08:56–10:22 даёт запас до рейса 12:20, но время прибытия зависит от пробок. При изменении расписания рейса пересчитать выезд. Peach через Trip.com: регистрация в киоске или на стойке; приложение не поддерживает брони турагентов.',
      stops: [
        {
          time: 'К 08:35 · выход по карте',
          title: 'Выселиться и прийти в Chatan Gateway',
          query: chatanGateway,
          detail:
            'Выезд из Luana Uakoko до 10:00, но для автобуса нужно выйти раньше. Построить путь с чемоданами к Gateway и прибыть к 08:35. Утренний завтрак купить накануне.',
          leg: 'Luana Uakoko → Chatan Gateway: по карте',
          mode: 'walking',
          kind: 'travel',
          duration: 'По выбранному маршруту',
        },
        {
          time: '08:56–10:22',
          title: 'Автобус LIM-A в аэропорт Наха',
          query: 'Naha Airport Domestic Terminal',
          detail:
            'Заранее забронировать два места; ¥2000 на двоих учтены в переезде Наха → Чатан → аэропорт. Чемоданы размещаются в багажном отсеке.',
          leg: 'Chatan Gateway → аэропорт: по расписанию 1 ч 26 мин',
          mode: 'transit',
          kind: 'travel',
          duration: '1 ч 26 мин',
          purchaseIds: ['t-onna'],
          source: chatanBusSource,
          published: true,
        },
        ...day.stops.slice(2),
      ] satisfies RouteStop[],
    };
  }
}

// Separately priced alternatives retain their own dates and accommodation.
export const baseRouteDays: RouteDay[] = routeDays.map((day) =>
  updateBookedDay(mainOkinawaDay(day) ?? updateTokyoDay(updateFujiDay(day))),
);
