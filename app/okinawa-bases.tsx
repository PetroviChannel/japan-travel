import { mapSearch, mapDirections } from './route-data';

const smile =
  'https://ru.trip.com/hotels/naha-hotel-detail-711296/smile-hotel-okinawanaha/?checkin=2026-10-22&checkout=2026-10-25&adult=2&crn=1&curr=RUB';
const terrace =
  'https://ru.trip.com/hotels/chatan-hotel-detail-81388816/terrace-resort-mihama/?checkin=2026-10-25&checkout=2026-10-28&adult=2&crn=1&curr=RUB';
const luana =
  'https://ru.trip.com/hotels/chatan-hotel-detail-13911923/luana-uakoko-resort-hotel/?checkin=2026-10-25&checkout=2026-10-28&adult=2&crn=1&curr=RUB';
const comfort =
  'https://ru.trip.com/hotels/chatan-hotel-detail-22158064/comfort-plus/?checkin=2026-10-25&checkout=2026-10-28&adult=2&crn=1&curr=RUB';
const monpa =
  'https://ru.trip.com/hotels/chatan-hotel-detail-2803849/condominium-hotel-monpa/?checkin=2026-10-25&checkout=2026-10-28&adult=2&crn=1&curr=RUB';
const gateway = 'https://chatan-gateway.com/en/';
const northBus = 'https://chatan-gateway.com/en/north-express/';
function Link({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children} ↗
    </a>
  );
}

export default function OkinawaBases() {
  return (
    <details className="okinawa-bases" id="okinawa-bases">
      <summary>
        <span className="eyebrow">Окинава без машины · выбор района</span>
        <strong>
          Наха + Чатан: больше прогулок, меньше зависимости от такси
        </strong>
        <span>
          Сравнить с Онной · цены жилья · Американская деревня по часам
        </span>
      </summary>
      <div className="okinawa-bases-body">
        <p>
          Для вашего сочетания пляжей, кафе и достопримечательностей удобнее
          жить 22–25 октября в Нахе у монорельса, затем 25–28 октября в Чатане.
          Онна остаётся более дешёвым вариантом среди проверенных ниже
          предложений. Это предложение к основному маршруту с вылетом 28
          октября: сохранённые покупки и пять альтернатив оно автоматически не
          меняет.
        </p>
        <section aria-labelledby="american-village-hotel-update">
          <h3 id="american-village-hotel-update">
            Ближе к Американской деревне: уточнение 8 сентября
          </h3>
          <p>
            Лучший целевой район — Mihama вокруг American Village, Sunset Beach
            и Chatan Gateway. Kuwae сразу за шоссе 58 — компромисс ради цены:
            пеший путь прокладывать через оборудованные переходы. Три ночи в
            Нахе — поздний прилёт, один день города и один день Токасики. На
            саму Наху можно выделить 1–2 полных дня: Сюри, Тамаудун, Цубоя,
            Макиси, Кокусай-дори, а при дополнительном времени — музей Окинавы и
            сад Фукусиэн. Остров 24 октября сохраняем.
          </p>
          <p className="okinawa-quote-note">
            25–28 октября 2026 · три ночи · один номер на двух взрослых · свой
            санузел. У Luana проверен итог на экране оформления; у Comfort Plus
            и Monpa — цены в списке номеров, окончательное оформление ещё не
            проверено. Цены могут измениться. Пути Luana и Terrace сверены в
            Google Maps; время для остальных отелей — ориентир.
          </p>
          <div className="okinawa-hotel-grid">
            <article>
              <span>Итог на экране оформления</span>
              <h4>Luana Uakoko Resort Hotel</h4>
              <strong>17 294,43 ₽</strong>
              <p>
                Бывший Emi Full Resort. Double, 23 м², кухня и стиральная
                машина. Оценка 8,6; чистота 9,0. Бесплатная отмена до 18 октября
                23:59. До входной части American Village 7–10 минут пешком; до
                прибрежных кафе ещё пройти по району. До Sunset Beach около 20
                минут: 1,4 км по альтернативному пути. Более короткий путь
                Google Maps помечает как частный или с ограниченным доступом.
              </p>
              <p>
                <b>Возвратный залог: ¥50 000 кредитной картой.</b> На экране
                оформления это около 28 012 ₽; срок возврата — 2–4 недели. Это
                не расход на проживание, но нужны дополнительные доступные
                деньги и кредитная карта, которую принимает отель.
              </p>
              <Link href={luana}>Номер и условия залога</Link>
              {' · '}
              <Link
                href={mapDirections(
                  'Luana Uakoko Resort Hotel Chatan',
                  'Mihama American Village Chatan',
                  'walking',
                )}
              >
                К American Village
              </Link>
              {' · '}
              <Link
                href={mapDirections(
                  'Luana Uakoko Resort Hotel Chatan',
                  'Sunset Beach Chatan',
                  'walking',
                )}
              >
                К пляжу: выбрать путь 1,4 км
              </Link>
            </article>
            <article>
              <span>Цена в списке номеров</span>
              <h4>Comfort Plus</h4>
              <strong>28 230 ₽</strong>
              <p>
                Double, 23 м², собственная ванная. Оценка 9,4; чистота 9,5.
                Бесплатная отмена до 24 октября 23:59. Ориентир: 10–15 минут до
                American Village, 15–20 минут до Sunset Beach.
              </p>
              <Link href={comfort}>Проверить итог и условия</Link>
            </article>
            <article>
              <span>Цена в списке номеров</span>
              <h4>Condominium Hotel Monpa</h4>
              <strong>38 796 ₽</strong>
              <p>
                Ocean Twin, 34 м², невозвратный тариф. Ориентир: 1–5 минут до
                American Village и 1–3 минуты до Sunset Beach. За расположение
                непосредственно у пляжа заметно доплачиваем.
              </p>
              <Link href={monpa}>Проверить итог и условия</Link>
            </article>
          </div>
          <p>
            До одной и той же входной точки American Village: Luana — 7–10 минут
            пешком, Terrace — 16–20 минут; до прибрежной части Depot Island идти
            дольше. Luana примерно на 496 ₽ дешевле Terrace Resort Mihama за 17
            790,30 ₽, но подходит только при приемлемых условиях залога. Terrace
            остаётся разумной рекомендацией по общей цене и близости пляжа
            Араха.
          </p>
        </section>
        <div className="okinawa-base-grid">
          <article>
            <span className="eyebrow">22–25 октября · город и острова</span>
            <h3>Наха: центр и монорельс</h3>
            <p>
              Kencho-mae удобна для автобусов и южного конца Кокусай-дори;
              Miebashi — для центра и порта Томари; Makishi — для рынков и
              восточной части улицы. Приоритет — станция и вечерние прогулки.
            </p>
            <p>
              Наминоуэ подходит для короткого купания и храма рядом. Городской
              пляж с дорожной эстакадой не стоит делать главным поводом для
              выбора отеля.
            </p>
            <Link href="https://visitokinawajapan.com/destinations/okinawa-main-island/southern-okinawa-main-island/naha/">
              Официальный путеводитель по Нахе
            </Link>
          </article>
          <article className="okinawa-base-recommended">
            <span className="eyebrow">25–28 октября · рекомендуемый район</span>
            <h3>Чатан: Михама и Араха</h3>
            <p>
              Американская деревня, Depot Island, кафе и набережные дают занятия
              на каждый вечер. Sunset Beach — рядом с Михамой, Араха — для более
              долгого пляжного отдыха.
            </p>
            <p>
              Terrace Resort Mihama расположен у Арахи: ориентир 5–10 минут до
              пляжа и 16–20 минут до входной части Американской деревни; до
              набережной Depot Island идти дольше. Это пешая прогулка, а не
              отель непосредственно внутри Village.
            </p>
            <Link href="https://visitokinawajapan.com/destinations/okinawa-main-island/central-okinawa-main-island/chatan/">
              Что посмотреть в Чатане
            </Link>
          </article>
          <article>
            <span className="eyebrow">25–28 октября · экономия и тишина</span>
            <h3>Север Онны: Kalakaua</h3>
            <p>
              Выбран из-за цены, близкого пляжа и примерно часа на автобусе до
              Churaumi. Это район Nakama/Kibougaoka на севере Онны: вечерний
              выбор меньше, чем в Чатане.
            </p>
            <p>
              К рейсу 12:20 нужен автобус Kariyushi 07:45 → аэропорт 09:45.
              Следующий прибывает 11:58 — слишком поздно. Южная Онна у Moon
              Beach — другой компромисс; Мотобу удобен прежде всего для севера
              острова.
            </p>
            <Link href="https://www.okinawa-shuttle.co.jp/en/timetable/">
              Расписание из Онны
            </Link>
          </article>
        </div>

        <h3>Сколько стоят три ночи на двоих</h3>
        <p className="okinawa-quote-note">
          Trip.com, проверка 8 сентября 2026: итог перед вводом данных гостя,
          один отдельный номер на двух взрослых, свой санузел, без питания,
          налоги включены. Показанные скидки уже учтены; будущие Trip Coins из
          оплаты не вычитаем. Цены могут измениться.
        </p>
        <div className="okinawa-hotel-grid">
          <article>
            <span>Наха · 22–25 октября</span>
            <h4>Mr.KINJO in MIEGUSUKU</h4>
            <strong>12 089 ₽</strong>
            <p>
              Текущий экономный вариант, 20 м². До Asahibashi около 1,5 км;
              стойка до 21:00 — поздний заезд требует согласования.
            </p>
            <Link href="https://ru.trip.com/hotels/naha-hotel-detail-62418188/mrkinjo-in-miegusuku/?checkin=2026-10-22&checkout=2026-10-25&adult=2&crn=1&curr=RUB">
              Номер на Trip.com
            </Link>
          </article>
          <article>
            <span>Наха · 22–25 октября</span>
            <h4>Smile Hotel Okinawanaha</h4>
            <strong>15 256 ₽</strong>
            <p>
              Double, 14 м², оценка 8,4. У порта Томари, около 10 минут до
              Miebashi и 15–20 минут до Кокусай-дори. Заезд показан до 06:00;
              бесплатная отмена до 20 октября 23:59.
            </p>
            <Link href={smile}>Номер на Trip.com</Link>
            {' · '}
            <Link href="https://smile-hotels.com/hotels/okinawanaha/">
              Как добраться
            </Link>
          </article>
          <article>
            <span>Онна · 25–28 октября</span>
            <h4>Beach Resort Hotel Kalakaua</h4>
            <strong>12 728 ₽</strong>
            <p>
              Twin B/C, 18 м². Текущий вариант у моря. Бесплатная отмена до 18
              октября 23:59; хранения вещей до заселения нет.
            </p>
            <Link href="https://ru.trip.com/hotels/onna-hotel-detail-39269056/beach-resort-hotel-kalakaua/?checkin=2026-10-25&checkout=2026-10-28&adult=2&crn=1&curr=RUB">
              Номер на Trip.com
            </Link>
          </article>
          <article className="okinawa-base-recommended">
            <span>Чатан · 25–28 октября</span>
            <h4>Terrace Resort Mihama</h4>
            <strong>17 790 ₽</strong>
            <p>
              Номер 27 м² с кухней, оценка 8,7; чистота 9,0. Бесплатная отмена
              до 18 октября 23:59. Получить код самостоятельного заселения;
              возможен шум дороги.
            </p>
            <Link href={terrace}>Номер на Trip.com</Link>
          </article>
        </div>
        <p>
          <strong>Жильё: 24 817 ₽ → 33 047 ₽ за все шесть ночей.</strong> Smile
          + Terrace стоят на 8 230 ₽ дороже проверенных Mr.KINJO + Kalakaua.
          Замена только Онны на Чатан добавляет 5 063 ₽. Центр не обязательно
          дешевле: Hotel Abest непосредственно на Кокусай-дори показал 25 115 ₽
          за 22–25 октября.{' '}
          <Link href="https://ru.trip.com/hotels/naha-hotel-detail-2199510/hotel-abest-naha-kokusaidori/?checkin=2026-10-22&checkout=2026-10-25&adult=2&crn=1&curr=RUB">
            Проверить Abest
          </Link>
        </p>

        <h3>Транспорт тоже входит в сравнение</h3>
        <div className="okinawa-hotel-grid">
          <article>
            <h4>Через Онну · около 5 749 ₽ на двоих</h4>
            <p>
              Наха → Онна → аэропорт: два Two-rides Ticket по ¥2 800, итого ¥5
              600. Онна → Churaumi → Онна: четыре поездки по ¥1 200, итого ¥4
              800. Всего ¥10 400; проездной действует при наличии свободных
              мест.
            </p>
            <Link href="https://www.okinawa-shuttle.co.jp/en/good-value/">
              Условия Two-rides Ticket
            </Link>
            {' · '}
            <Link href="https://www.okinawa-shuttle.co.jp/en/timetable/">
              Тарифная таблица
            </Link>
          </article>
          <article>
            <h4>Через Чатан · резерв около 7 518 ₽ на двоих</h4>
            <p>
              Наха → Чатан на TK05: ¥2 000. Чатан → аэропорт на LIM-A: ¥2 000.
              На автобус в Churaumi и обратно заложено ¥9 600: четыре поездки по
              ¥2 400. Всего ¥13 600; окончательную цену билетов в Churaumi
              сверить при открытии продаж за месяц.
            </p>
            <p>
              Terrace Resort Mihama и Luana Uakoko отсутствуют в списке отелей с
              50% скидкой на этот автобус. Не путать Terrace с MB GALLERY by The
              Terrace Hotels.
            </p>
            <Link href={gateway}>Транспорт из Чатана</Link>
            {' · '}
            <Link href={northBus}>Условия автобуса в Churaumi</Link>
            {' · '}
            <Link href="https://monpa.co.jp/en/">
              Подтверждение тарифа ¥2 400 в одну сторону
            </Link>
          </article>
        </div>
        <p>
          <strong>
            Smile + Terrace: ориентировочно +10 000 ₽ за жильё и перечисленные
            переезды на двоих.
          </strong>{' '}
          Если оставить Mr.KINJO и заменить только Онну — около +6 800 ₽. Вход в
          океанариум, паром на Токасики, питание, городской транспорт и общий
          резерв на такси считаются в остальных строках бюджета; повторно здесь
          их не прибавляем.
        </p>
        <p className="okinawa-quote-note">
          Пересчёт: ¥1 = 0,552789 ₽, курс для планирования от 8 сентября 2026.
          Экономию на такси заранее не обещаем.{' '}
          <Link href="https://www.cbr.ru/currency_base/daily/?UniDbQuery.Posted=True&UniDbQuery.To=08.09.2026">
            Источник курса
          </Link>
        </p>

        <h3>Как выглядят дни с Чатаном</h3>
        <p>
          22 октября — прилёт и заселение. 23 октября — Сюри, Тамаудун, Цубоя,
          Макиси и отдельная прогулка по Кокусай-дори 16:40–18:00. 24 октября —
          сохраняем Токасики и Aharen. Дальше:
        </p>
        <ol className="okinawa-mini-days">
          <li>
            <strong>25 октября · переезд и Американская деревня</strong>
            <p>
              10:00 выселиться → 12:00–12:45 TK05 от Kokusai-dori Iriguchi до
              Chatan Gateway → обед и путь к отелю → 15:00 заселение →
              16:00–18:00 American Village, Depot Island и набережная → ужин.
              Утреннее хранение багажа в Terrace не предполагаем.
            </p>
            <Link
              href={mapDirections(
                'Terrace Resort Mihama Chatan',
                'Depot Island Chatan Okinawa',
                'walking',
              )}
            >
              Пешком к Американской деревне
            </Link>
          </li>
          <li>
            <strong>26 октября · Churaumi</strong>
            <p>
              К 09:00 прийти в Chatan Gateway → 09:15–11:12 прямой автобус →
              11:30–14:00 океанариум → обед → 14:45–16:00 Emerald Beach и парк →
              16:55–18:54 обратно. До Gateway от Terrace заложить 30 минут
              пешком; место в автобусе купить заранее.
            </p>
            <Link href={northBus}>Автобус и покупка билетов</Link>
          </li>
          <li>
            <strong>27 октября · Араха и свободный вечер</strong>
            <p>
              10:00–13:00 пляж Араха → обед и отдых → 16:00–18:00 Sunset Beach и
              вечерняя Михама. По желанию вместо второй прогулки — кафе у
              набережной Sunabe. Купание зависит от погоды и работы пляжа.
            </p>
            <Link
              href={mapDirections(
                'Araha Beach Chatan',
                'Sunset Beach Chatan',
                'walking',
              )}
            >
              Прогулка между пляжами
            </Link>
          </li>
          <li>
            <strong>28 октября · в аэропорт</strong>
            <p>
              07:50 выселение → к 08:35 Chatan Gateway → 08:56–10:22 LIM-A в
              аэропорт → рейс 12:20. На случай дорожных задержек сохраняем
              резерв на такси.
            </p>
            <Link href={gateway}>Остановки и расписание</Link>
          </li>
        </ol>
        <p className="okinawa-quote-note">
          Часы автобусов — из опубликованных сейчас таблиц, остальные интервалы
          — план. Сверить перед поездкой. Для вариантов с вылетом 27 октября
          нужны отдельные цены на две ночи и другая программа последнего дня.
        </p>
        <div className="okinawa-map-links">
          <Link href={mapSearch('Mihama American Village Chatan Okinawa')}>
            Американская деревня на Google Maps
          </Link>
          <Link href="https://chatantourism.com/en/spot/araha-beach/">
            Пляж Араха
          </Link>
          <Link href="https://dormy-hotels.com/resort/hotels/okinawa/sunsetbeach/beach-and-pool/">
            Сезон Sunset Beach 2026
          </Link>
        </div>
      </div>
    </details>
  );
}
