import { mapSearch, mapDirections } from './route-data';

const terrace =
  'https://ru.trip.com/hotels/chatan-hotel-detail-81388816/terrace-resort-mihama/?checkin=2026-10-25&checkout=2026-10-28&adult=2&crn=1&curr=RUB';
const gateway = 'https://chatan-gateway.com/en/';
const yomitanBus = 'https://www.yomitan-kankou.jp/access/bus_route/';

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
        <span className="eyebrow">Основной маршрут · Окинава без машины</span>
        <strong>Наха → Американская деревня в Чатане</strong>
        <span>
          22–25 октября · город и острова; 25–28 октября · Михама и пляж Араха
        </span>
      </summary>
      <div className="okinawa-bases-body">
        <p>
          Первые три ночи — в Нахе, затем переезжаем в Чатан и живём рядом с
          Американской деревней. Дневные карты, остановки и переезды уже
          соответствуют этим двум базам. Отели и билеты ещё предстоит
          забронировать.
        </p>

        <div className="okinawa-base-grid">
          <article>
            <span className="eyebrow">22–25 октября · первая база</span>
            <h3>Наха: история, Кокусай-дори и Керама</h3>
            <p>
              Вечер прилёта оставляем для отдыха. 23 октября — Сюри, Тамаудун,
              улица керамики Цубоя, рынок Макиси и Кокусай-дори. 24 октября —
              катер на Токасики и пляж Aharen, вечером возвращаемся в Наху.
            </p>
            <p>
              Жильё в основном бюджете — Mr.KINJO in MIEGUSUKU. Поздний заезд
              согласовать до поездки. Городской пляж не занимает отдельный день:
              для моря оставлены Токасики и Чатан.
            </p>
            <Link href={mapSearch('Kokusai Dori Naha Okinawa')}>
              Кокусай-дори на карте
            </Link>
          </article>
          <article className="okinawa-base-recommended">
            <span className="eyebrow">25–28 октября · вторая база</span>
            <h3>Чатан: Михама, American Village и Араха</h3>
            <p>
              Вечерами гуляем по Американской деревне, Depot Island и
              набережной. До входной части American Village от Terrace 16–20
              минут пешком; до прибрежных кафе немного дальше. Пляж Араха —
              примерно в 5–10 минутах от отеля.
            </p>
            <p>
              На 26 октября — замок Дзакими и деревня керамики в Ёмитане. 27
              октября — пляжный день без дальних переездов. 28 октября выезжаем
              из Чатана прямо в аэропорт Нахи.
            </p>
            <Link href={mapSearch('Mihama American Village Chatan Okinawa')}>
              Американская деревня на карте
            </Link>
          </article>
        </div>

        <section aria-labelledby="american-village-hotel-update">
          <h3 id="american-village-hotel-update">
            Где останавливаемся: Terrace Resort Mihama
          </h3>
          <div className="okinawa-hotel-grid">
            <article className="okinawa-base-recommended">
              <span>25–28 октября 2026 · три ночи · двое взрослых</span>
              <h4>Terrace Resort Mihama</h4>
              <strong>17 790,30 ₽ за весь номер</strong>
              <p>
                27 м², кухня и собственный санузел, без питания. Оценка 8,7,
                чистота 9,0. Бесплатная отмена до 18 октября 23:59 по условиям
                проверенного тарифа. Возможен шум дороги. Для самостоятельного
                заселения заранее получить код и сверить время заезда.
              </p>
              <Link href={terrace}>Забронировать на Trip.com</Link>
              {' · '}
              <Link
                href={mapDirections(
                  'Terrace Resort Mihama Chatan',
                  'Mihama American Village Chatan',
                  'walking',
                )}
              >
                Пешком к American Village
              </Link>
              {' · '}
              <Link
                href={mapDirections(
                  'Terrace Resort Mihama Chatan',
                  'Araha Beach Chatan',
                  'walking',
                )}
              >
                Пешком к пляжу Араха
              </Link>
            </article>
          </div>
          <p className="okinawa-quote-note">
            Цена Trip.com проверена 8 сентября 2026, налоги и показанные скидки
            учтены. Это стоимость предложения, не оплаченная бронь; перед
            покупкой проверить окончательный итог и правила тарифа.
          </p>
        </section>

        <h3>Переезды на двоих: резерв около 3 980 ₽</h3>
        <div className="okinawa-hotel-grid">
          <article>
            <h4>Наха → Чатан → аэропорт · ¥4000</h4>
            <p>
              25 октября TK05: Kokusai-dori Iriguchi 12:00 → Chatan Gateway
              12:45. 28 октября LIM-A: Gateway 08:56 → аэропорт 10:22. По ¥1000
              с человека за каждый переезд. LIM-A бронируем заранее; оба
              автобуса принимают чемоданы в багажный отсек.
            </p>
            <Link href={gateway}>Остановки, расписание и бронь LIM-A</Link>
          </article>
          <article>
            <h4>Чатан ↔ Ёмитан · резерв ¥3200</h4>
            <p>
              26 октября автобус №29: остановка Chatan 08:38 → Zakimi 09:05.
              Обратно Oyashi 13:34 → Chatan 14:03. От Terrace до остановки около
              180 м. ¥3200 — запас на проезд двух взрослых туда-обратно, точный
              тариф ещё не проверен. Между замком и деревней 2,8 км пешком; вход
              свободный, сувениры и мастер-классы отдельно.
            </p>
            <Link href={yomitanBus}>Автобусы и пешие подходы в Ёмитане</Link>
          </article>
        </div>
        <p className="okinawa-quote-note">
          Расписания сверены 9 сентября 2026, перед поездкой проверить
          изменения. Для №29 доступна таблица перевозчика с 16.10.2023, часы на
          октябрь 2026 нужно подтвердить. Пересчёт для планирования: ¥1 =
          0,552789 ₽. Паром, поездки по Нахе и резерв на такси учтены в бюджете
          отдельно. Пешие прогулки по Чатану не требуют билетов.
        </p>

        <h3>Дни в Чатане</h3>
        <ol className="okinawa-mini-days">
          <li>
            <strong>25 октября · переезд и Американская деревня</strong>
            <p>
              После автобуса — обед с вещами, около 15:00 заселение. С 16:00
              American Village, затем Depot Island, Sunset Beach и ужин у моря.
              Раннее хранение багажа не предполагаем.
            </p>
          </li>
          <li>
            <strong>26 октября · Дзакими и Ятимун-но-Сато</strong>
            <p>
              Выйти из отеля в 08:15. 09:20–10:10 замок Дзакими, затем 50 минут
              пешком до деревни керамики. 11:00–12:15 мастерские, обед и к 13:20
              остановка Oyashi. После возвращения — отдых в отеле, с 16:00 море
              и Михама. За день около 6–8 км пешком.
            </p>
            <Link
              href={mapDirections(
                'Zakimi Castle Ruins Okinawa',
                'Yachimun no Sato Okinawa',
                'walking',
              )}
            >
              Замок → деревня: 2,8 км пешком
            </Link>
          </li>
          <li>
            <strong>27 октября · пляж Араха и вечерняя Михама</strong>
            <p>
              10:00–12:30 Араха, затем обед и отдых в отеле. С 16:00 Sunset
              Beach и любимые места American Village. Купание — по погоде и
              разрешению спасателей.
            </p>
            <Link href="https://chatantourism.com/en/spot/araha-beach/">
              Араха: сезон купания и услуги
            </Link>
          </li>
          <li>
            <strong>28 октября · перелёт в Осаку</strong>
            <p>
              07:50 выселение, к 08:35 прийти в Gateway с чемоданами. Автобус в
              аэропорт и регистрация на рейс 12:20. Точное время выезда
              пересчитать, если изменится выбранный рейс.
            </p>
          </li>
        </ol>
      </div>
    </details>
  );
}
