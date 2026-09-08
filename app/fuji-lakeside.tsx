import { Bike, Moon, ExternalLink } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { mapDirections, mapSearch } from './route-data';

const booking = (id: number, slug: string) =>
  `https://ru.trip.com/hotels/fujikawaguchiko-hotel-detail-${id}/${slug}/?checkin=2026-11-05&checkout=2026-11-06&adult=2&crn=1&curr=RUB`;
const rub = (value: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
const privateOnsenHotels = [
  {
    name: 'Susukinohara Ichinoyu',
    tag: 'Личный открытый онсэн + питание · дешевле на 13 573 ₽',
    total: 28525.93,
    couponTotal: 27425.93,
    room: 'Main Building Japanese-style Twin with Open-air Bath. На Trip.com: «Номер в японском стиле (две кровати, ванная снаружи, в главном здании)», 29 м². Ужин и завтрак для двоих включены.',
    bath: 'Своя открытая купальня с настоящей термальной водой, душ и туалет. Вода источника с циркуляцией; бронировать отдельный сеанс не нужно.',
    tradeoff:
      'Две односпальные кровати и современный японский интерьер. Футоны на полу для пары в этом тарифе не обещаны. Нет озера Кавагутико и гарантированного вида Фудзи.',
    access:
      'Киото → Одавара → Хаконе-Юмото. Затем автобус до Daigatake около 30 минут и 1 минута пешком. С чемоданами сначала в рёкан; до времени заезда хранение согласовать. На второй этаж — лестница, первый этаж можно запросить без гарантии.',
    terms:
      'Заезд 15:00–18:00, выезд до 10:00. Бесплатная отмена до 31 октября 23:59 по времени отеля, затем ступенчатый штраф. Без купона: 28 358,86 ₽ онлайн + ¥300 в отеле.',
    url: 'https://ru.trip.com/hotels/hakone-hotel-detail-8649664/susukinohara-ichinoyu/?checkin=2026-11-05&checkout=2026-11-06&adult=2&crn=1&curr=RUB',
    official:
      'https://www.ichinoyu.co.jp/facilities/susuki/susuki-room-honkan/honkan/',
    accessUrl: 'https://www.ichinoyu.co.jp/facilities/susuki/susuki-access/',
  },
  {
    name: 'Yoshiike Ryokan',
    tag: 'Сохранить татами и футоны · удобнее с чемоданами',
    total: 36518.43,
    couponTotal: 35418.43,
    room: 'Chisen no Ma: Annex Ikenotoh, сторона сада, японская комната 10 татами с широкой верандой. Trip.com: 38 м², 5 футонов — вместимость категории; расчёт на двоих. Тариф без питания.',
    bath: 'Собственная внутренняя ванна с настоящей термальной водой и туалет. Это закрытая купальня в комнате, не открытый ротэнбуро. Важно выбирать именно Chisen no Ma: у некоторых других категорий есть только душ.',
    tradeoff:
      'Японский интерьер, футоны на татами и сад сохраняются. Жертвуем открытой купальней, озером и включённым питанием. Старинный деревянный корпус этим тарифом не подтверждён.',
    access:
      'Киото → Одавара → Хаконе-Юмото, затем около 7 минут пешком в рёкан. Поезд Одавара → Хаконе-Юмото около 15 минут. До заезда хранение вещей согласовать; отдельная поездка в онсэн не нужна.',
    terms:
      'Заезд 14:00–17:00, выезд до 10:00. Бесплатная отмена до 22 октября 23:00 по времени отеля, затем полная стоимость онлайн. Без купона: 36 351,36 ₽ онлайн + ¥300 в отеле. Дешевле Ooya на 5 581 ₽ только по жилью; ужин и завтрак оплачиваются отдельно.',
    url: 'https://ru.trip.com/hotels/hakone-hotel-detail-1635606/yoshiike-ryokan/?checkin=2026-11-05&checkout=2026-11-06&adult=2&crn=1&curr=RUB',
    official: 'https://www.yoshiike.org/room/garden_specially_room.html',
    accessUrl: 'https://www.yoshiike.org/access/',
  },
];
const hotels = [
  {
    name: 'Kasuitei Ooya',
    tag: 'Для традиционной ночи у озера',
    total: 42099.08,
    online: 41931.89,
    rating: '9,2',
    room: 'Japanese Room with Cypress Bath, Lake View: татами и футоны на полу, собственный туалет и кипарисовая ванна. Trip.com указывает 22 м² и 6 футонов — это вместимость категории; цена рассчитана на двоих. Ужин и завтрак включены.',
    atmosphere:
      'Классический японский интерьер, низкий столик, юката и ужин в рёкане. Предприятие основано в 1923 году; нынешний корпус не подтверждён как сохранившийся старинный деревянный дом.',
    bath: 'Настоящий термальный онсэн — в общих купальнях рёкана. Собственная кипарисовая ванна в номере наполнена подогретой водой Фудзи: официальный сайт прямо отличает её от онсэна, хотя Trip.com ставит значок «частный горячий источник».',
    view: 'Из выбранного номера — озеро. Панораму Фудзи через озеро смотрим утром с северного берега. Это южный берег, рядом с набережной Funatsu Hama.',
    access:
      'Около 10 минут пешком от станции. Шаттл 14:00–19:00, обратно 08:00–10:00 — согласовать заранее. Раннее хранение чемоданов отдельно подтвердить; после заезда вещи остаются в номере.',
    terms:
      'Заезд 15:00–18:00, выезд до 10:00. Бесплатная отмена до 28 октября 23:59 по времени отеля, затем полная стоимость онлайн. На проверке это единственная доступная категория Ooya на Trip.com для этой ночи; более дешёвые обычные японские комнаты не предлагались.',
    url: booking(2559479, 'kasuitei-ooya'),
    official: 'https://www.kasuitei-ooya.co.jp/room',
  },
  {
    name: 'Yamagishi Ryokan',
    tag: 'Бюджетный компромисс по атмосфере',
    total: 19251.66,
    online: 19084.47,
    rating: '8,4',
    room: '«Номер, определяемый при заезде»: в выбранном тарифе явно указаны 6 футонов и собственная ванная комната. Номер на двоих с двумя завтраками; ужин не включён. Не выбирать соседние тарифы только по похожему названию.',
    atmosphere:
      'Японские комнаты с татами и футонами, но обновлённый современный интерьер. Для ощущения «под старину» подходит слабее Ooya. Конкретную комнату назначают при заезде; размер, оформление и вид не закреплены этим тарифом.',
    bath: 'Общий крытый и открытый термальный онсэн в рёкане: после заселения никуда ехать не нужно. Собственная ванная номера не означает частный онсэн.',
    view: 'Юго-восточный берег рядом с Ooya. У тарифа нет обещанного вида на озеро или Фудзи; Lake View — отдельная категория.',
    access:
      'Около 8–12 минут пешком от станции, есть бесплатная встреча по звонку. Хранение багажа до заселения — по предварительному согласованию, не автоматическая гарантия.',
    terms:
      'Отмена бесплатно до 29 октября 23:59 по времени отеля; затем ступенчатый штраф 30%, 50%, 100%. Заезд 15:00–21:00, выезд до 10:00. Для ужина в рёкане нужен отдельный тариф.',
    url: booking(704687, 'yamagisi-ryokan'),
    official: 'https://yamagisi.jp/guest_room.html',
  },
];
function Link({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children} <ExternalLink size={13} aria-hidden="true" />
    </a>
  );
}

export default function FujiLakeside({
  onPurchase,
}: {
  onPurchase: (id: string) => void;
}) {
  const guideRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (
      new URLSearchParams(window.location.search).get('section') !==
      'fuji-lakeside'
    )
      return;
    const frame = requestAnimationFrame(() => {
      const guide = guideRef.current;
      if (!guide) return;
      guide.open = true;
      guide.querySelector('summary')?.focus({ preventScroll: true });
      guide.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <details className="fuji-lakeside" id="fuji-lakeside" ref={guideRef} open>
      <summary>
        <span className="eyebrow">5–6 ноября · одна ночь · двое взрослых</span>
        <strong>Личный онсэн или ночь у озера: выбираем рёкан</strong>
        <span>
          Дешевле Ooya · точные номера · чемоданы, футоны и велосипеды
        </span>
      </summary>
      <div className="fuji-lakeside-body">
        <p>
          <b>
            Для личного онсэна дешевле Ooya — Susukinohara Ichinoyu в Хаконе за
            28 526 ₽ с ужином и завтраком.
          </b>{' '}
          Компромисс — кровати и современная обстановка. Если футоны на полу
          обязательны, Yoshiike за 36 518 ₽ сохраняет японскую комнату и
          настоящую термальную ванну, но без питания. Оба варианта требуют
          заменить остановку у Кавагутико на Хаконе.
        </p>
        <section
          className="fuji-rental"
          aria-labelledby="private-onsen-heading"
        >
          <h4 id="private-onsen-heading">Настоящий онсэн прямо в номере</h4>
          <p>
            <b>
              У Ooya кипарисовая ванна номера — с подогретой водой Фудзи, не с
              термальной.
            </b>{' '}
            Термальный онсэн там общий. «Собственная ванная», «ванна снаружи» и
            даже значок Trip.com «частный горячий источник» сами по себе не
            подтверждают воду источника. Для двух вариантов ниже тип воды
            проверен по официальным страницам конкретных категорий.
          </p>
          <p className="fuji-small">
            Trip.com, проверка 8 сентября 2026: 5–6 ноября, один номер, двое
            взрослых. Основная цена включает налог ¥300 (около 167 ₽) и
            показанные обычные скидки, но исключает условный купон новичка на 1
            100 ₽. С купоном — отдельная сумма ниже: он применялся при проверке,
            но право на первое бронирование зависит от аккаунта. На экране
            купона указан срок до 23 сентября 18:59. Наличие и стоимость могут
            измениться.
          </p>
        </section>
        <div className="fuji-hotel-grid">
          {privateOnsenHotels.map((h) => (
            <article key={h.name}>
              <span className="eyebrow">{h.tag}</span>
              <h4>
                <Moon size={18} aria-hidden="true" />
                {h.name}
              </h4>
              <strong className="fuji-price">
                {rub(h.total)}
                <small>/ ночь за двоих, с местным налогом</small>
              </strong>
              <p className="fuji-small">
                С купоном первого бронирования: {rub(h.couponTotal)}, если
                аккаунт подходит.
              </p>
              <p>{h.room}</p>
              <p>
                <b>Личная купальня:</b> {h.bath}
              </p>
              <p>
                <b>Чем жертвуем:</b> {h.tradeoff}
              </p>
              <details>
                <summary>Дорога с чемоданами и условия тарифа</summary>
                <p>{h.access}</p>
                <p>{h.terms}</p>
              </details>
              <div className="fuji-links">
                <Link href={h.url}>Выбрать этот номер на Trip.com</Link>
                <Link href={h.official}>
                  Фото и подтверждение термальной воды
                </Link>
                <Link href={h.accessUrl}>Дорога от станции</Link>
                <Link href={mapSearch(h.name + ' Hakone')}>На карте</Link>
              </div>
            </article>
          ))}
        </div>
        <p>
          <b>Как меняется поездка:</b> 5 ноября едем из Киото через Одавару
          сразу в рёкан, после заселения отдыхаем в своей купальне. 6 ноября —
          Хаконе и переезд в Токио. Велосипеды у Кавагутико в эту замену не
          входят: сохранить и озеро, и Хаконе за ту же ночь без дополнительных
          переездов не получится. Указанная экономия — только по стоимости жилья
          относительно прежней котировки Ooya 42 099 ₽. Межгород и местные
          автобусы для такой замены ещё нужно пересчитать. Основной маршрут и
          сохранённый бюджет остаются прежними до выбора варианта.
        </p>
        <details className="fuji-backup">
          <summary>Если обязательно оставить озеро и велосипеды</summary>
          <p>
            На 5–6 ноября более дешёвый доступный номер у Кавагутико с
            подтверждённым личным термальным онсэном пока не найден. У Fuji Lake
            Hotel есть Barrier-Free Corner Room с термальной внутренней ванной,
            но на проверке Trip.com не предлагал эту категорию. Она с кроватями,
            маленькой ванной без вида; совместное купание вдвоём не обещано.
          </p>
          <div className="fuji-links">
            <Link href={booking(704371, 'fuji-lake-hotel')}>
              Проверить Fuji Lake
            </Link>
            <Link href="https://www.fujilake.co.jp/rooms/cornerroom/">
              Corner Room: фото и описание
            </Link>
            <Link href="https://www.fujilake.co.jp/faq/">
              Какие ванны термальные
            </Link>
          </div>
          <p>
            Бюджетный способ сохранить озеро — Yamagishi ниже, но настоящий
            онсэн там общий. Ichinoyu Honkan в Хаконе ближе к атмосфере
            старинного дома, однако на эту ночь Trip.com показывал только
            комнаты без своей ванной: их низкую цену нельзя сравнивать с номером
            с личным онсэном.
          </p>
        </details>
        <h4>Остаться у Кавагутико: футоны и общий онсэн в рёкане</h4>
        <p>
          Ooya и Yamagishi рядом со станцией и озером: после Киото сначала едем
          с чемоданами в рёкан, гуляем уже после заселения. Утром — велосипеды с
          видом на Фудзи. Это план основной программы ниже; личная ванна этих
          номеров не равна собственному термальному онсэну.
        </p>
        <p className="fuji-small">
          Бронировать нужно конкретный японский номер с футонами: категории
          Japanese-Western и Twin у того же рёкана могут быть с кроватями. Фото
          комнаты и условия выбранного тарифа открываются по ссылкам ниже.
        </p>
        <p className="fuji-small">
          Цены проверены 8 сентября 2026 на экране оформления Trip.com: один
          номер на двоих, 5–6 ноября. Во все итоги ниже уже включён местный
          налог ¥300 (около 167 ₽), оплачиваемый в отеле. Скидки, показанные на
          оформлении, уже вычтены; новые промокоды и будущие Trip Coins повторно
          не считаем. Наличие и цена могут измениться.
        </p>
        <div className="fuji-hotel-grid">
          {hotels.map((h) => (
            <article key={h.name}>
              <span className="eyebrow">{h.tag}</span>
              <h4>
                <Moon size={18} aria-hidden="true" />
                {h.name}
              </h4>
              <strong className="fuji-price">
                {rub(h.total)} <small>/ ночь за двоих</small>
              </strong>
              <p className="fuji-small">
                {rub(h.online)} онлайн + ¥300 в отеле · Trip.com {h.rating}/10
              </p>
              <p>{h.room}</p>
              <p>
                <b>Атмосфера:</b> {h.atmosphere}
              </p>
              <p>
                <b>Купальни:</b> {h.bath}
              </p>
              <p>
                <b>Вид:</b> {h.view}
              </p>
              <details>
                <summary>Дорога, отмена и условия</summary>
                <p>{h.access}</p>
                <p>{h.terms}</p>
              </details>
              <div className="fuji-links">
                <Link href={h.url}>Номер и фото на Trip.com</Link>
                <Link href={mapSearch(h.name + ' Kawaguchiko')}>На карте</Link>
                <Link href={h.official}>Официальный сайт</Link>
              </div>
              <p className="fuji-small">
                Жильё дороже исходного Toyoko Inn на {rub(h.total - 10664.15)}.
                Если также убрать отдельный вход в Yurari, доплата составит{' '}
                <b>{rub(h.total - 10664.15 - 2800 * 0.552789)}</b>. Питание в
                этом сравнении не вычиталось. Сохранённая смета пока не
                меняется: номер ещё не выбран.
              </p>
            </article>
          ))}
        </div>
        <section className="fuji-rental">
          <h4>Если важен именно старинный деревянный дом</h4>
          <p>
            <b>Arai Ryokan · корпус Kiri, Сюдзэндзи</b> — подтверждённый
            деревянный корпус 1916 года, зарегистрированный памятник: японская
            комната 12 татами, футоны, собственный туалет и внутренняя ванна с
            проточной термальной водой. Здесь есть и общие онсэны. По атмосфере
            старинного дома этот вариант точнее соответствует запросу.
          </p>
          <p>
            <b>{rub(42968.42)} за двоих, 5–6 ноября</b>: проверенный тариф
            «Номер Делюкс — Вид на сад (kiri)», два завтрака, без ужина. Онлайн
            42 801,23 ₽ + ¥300 в отеле. Отмена бесплатно до 28 октября 23:59 по
            времени отеля, затем ступенчатый штраф. Цена проверена на оформлении
            Trip.com 8 сентября 2026; более дешёвый Katsura Twin с кроватями не
            подходит.
          </p>
          <p>
            <b>Это другая остановка, на полуострове Идзу.</b> От Мисимы поездом
            до Shuzenji около 30 минут, затем автобусом до Shuzenji Onsen около
            10 минут и 3 минуты пешком, плюс ожидание пересадок. Здесь не будет
            озера Кавагутико и запланированного велоутра с Фудзи. В текущую
            программу и смету этот вариант не включён; для него нужно отдельно
            пересчитать дорогу и заменить дни 5–6 ноября.
          </p>
          <div className="fuji-links">
            <Link href="https://ru.trip.com/hotels/izu-city-hotel-detail-704635/arai-ryokan/?checkin=2026-11-05&checkout=2026-11-06&adult=2&crn=1&curr=RUB">
              Arai: категория Kiri на Trip.com
            </Link>
            <Link href="https://www.489pro.com/asp/489/menu.asp?fn=room&id=22000058&lan=JPN&m_menu=1&pore=2">
              История, фото и устройство комнат
            </Link>
            <Link href="https://arairyokan.net/map.htm">Как добраться</Link>
          </div>
        </section>
        <details className="fuji-backup">
          <summary>
            Ещё традиционные рёканы: почему пока не в основной подборке
          </summary>
          <p>
            <b>Wakakusa no Yado Maruei</b> — японские комнаты 8 или 10 татами с
            футонами, собственной ванной и туалетом, общий онсэн в рёкане. На
            5–6 ноября Trip.com сейчас предлагает только категорию с двумя
            кроватями, поэтому её цену сюда не переносим. Шаттл от станции
            15:00–17:00, после 1 октября заезд с 15:00.{' '}
            <Link href={booking(1589847, 'maruei')}>
              Проверить японский номер
            </Link>{' '}
            ·{' '}
            <Link href="https://maruei55.com/guest_room.html">
              Фото категорий
            </Link>{' '}
            ·{' '}
            <Link href="https://maruei55.com/question.html">Шаттл и заезд</Link>
          </p>
          <p>
            <b>Hotel Mifujien</b> — подходящий кандидат на берегу Azagawa:
            категории 8 и 10 татами имеют собственную ванную и вид на Фудзи и
            озеро. У 12,5 татами в обзор попадает крыша.{' '}
            <b>На 5–6 ноября Trip.com сейчас не предлагает номер.</b>{' '}
            <Link href={booking(706371, 'kawaguchiko-onsen-hotel-mifujien')}>
              Проверить Mifujien
            </Link>{' '}
            ·{' '}
            <Link href="https://www.mifujien.co.jp/guestroom/">
              Виды по категориям
            </Link>
          </p>
          <p>
            <b>New Century</b> и <b>Asafuji</b> тоже стоит рассматривать ради
            панорамы, но на эти даты бронирование через Trip.com сейчас
            недоступно. Цены соседних дат в бюджет не переносим.{' '}
            <Link href={booking(1589904, 'hotel-new-century')}>
              New Century
            </Link>{' '}
            · <Link href={booking(1483192, 'hotel-asafuji')}>Asafuji</Link>
          </p>
        </details>
        <div className="fuji-plan-grid">
          <section>
            <h4>5 ноября · вечер в рёкане</h4>
            <p>
              В основной программе ниже уже стоит вечер в рёкане. На карте
              ориентир — Ooya; Yamagishi находится в том же районе.
            </p>
            <ol className="fuji-mini-plan">
              <li>
                <b>13:15–14:15</b>
                <span>
                  Прибытие из Мисимы, обед у станции. Межгород остаётся по
                  основному плану.
                </span>
              </li>
              <li>
                <b>14:15–15:00</b>
                <span>
                  Согласованный шаттл Ooya или около 10 минут пешком прямо в
                  рёкан. Если раннее хранение не подтвердили, приехать ближе к
                  15:00. Чемоданы не возим на экскурсии.
                </span>
              </li>
              <li>
                <b>15:00–15:45</b>
                <span>
                  Заселение, чай, отдых и вид из номера, если он предусмотрен
                  тарифом.
                </span>
              </li>
              <li>
                <b>15:45–17:30</b>
                <span>
                  До 16:20 короткая прогулка у воды без вещей, затем 16:30–17:30
                  — общий термальный онсэн своего рёкана.
                </span>
              </li>
              <li>
                <b>18:00–19:30</b>
                <span>
                  У Ooya в проверенном тарифе ужин включён; у Yamagishi — поесть
                  поблизости. Точное начало ужина назначает рёкан.
                </span>
              </li>
            </ol>
            <p className="fuji-small">
              Отдельный Yurari в эту программу не входит: можно убрать примерно
              1 550 ₽ за вход на двоих, если он ещё не оплачен. Заявка на шаттл
              не отправлена. Онсэн в рёкане обычно общий и раздельный для мужчин
              и женщин.
            </p>
          </section>
          <section>
            <h4>
              <Bike size={19} aria-hidden="true" />6 ноября · Фудзи с берега
              озера
            </h4>
            <p>
              <b>Прокат с 09:30, возврат до 12:00; до 12–14 км.</b> Прокат у
              станции → восточный берег → Ubuyagasaki → Nagasaki Park → Oishi
              Park → северный берег → мост Ohashi → прокат. Oishi —
              необязательное удлинение; спокойный вариант — развернуться у
              Nagasaki Park. Подробные остановки — в программе 6 ноября.
            </p>
            <p>
              Накануне попросить завтрак в 07:30 или 08:00: официальный план
              Ooya даёт время начала 07:30–08:30. Если назначат 08:30, выдача
              велосипеда — около 09:45. Из Oishi выехать обратно не позже 10:45;
              цель — сдать велосипеды в 11:45, крайнее время 12:00. При
              задержке, ветре или усталости — разворот у Nagasaki Park.
            </p>
            <div className="fuji-links">
              <Link href="https://www.hpdsp.net/kasuitei/hw/hwp3200/hww3201init.do?adultNum=2&dateUndecided=1&planCd=00843733&planListNumPlan=17_3_3&roomCount=1&roomCrack=200000&roomTypeCd=0084024&screenId=HWW3101&stayDay=&stayMonth=&stayYear=&yadNo=362130">
                Ooya: часы завтрака в официальном плане
              </Link>
              <Link
                href={mapDirections(
                  'Fuji Kanko Travel Kawaguchiko',
                  'Oishi Park Kawaguchiko',
                  'bicycling',
                  ['Ubuyagasaki Kawaguchiko', 'Nagasaki Park Kawaguchiko'],
                )}
              >
                Точки пути туда в Google Maps
              </Link>
              <Link
                href={mapDirections(
                  'Oishi Park Kawaguchiko',
                  'Fuji Kanko Travel Kawaguchiko',
                  'bicycling',
                  ['Kawaguchiko Ohashi Bridge'],
                )}
              >
                Обратно через мост
              </Link>
              <Link href="https://www.yamanashi-kankou.jp/zenryoku/en/cycling/course/008.html">
                Официальная карта веломаршрута
              </Link>
            </div>
            <p className="fuji-small">
              У Google Maps велосипедные маршруты могут быть недоступны:
              используйте точки вместе с официальной картой и советом проката. У
              Ubuyagasaki — береговой обход тоннеля. На людных участках ведите
              велосипед; не считайте весь берег отдельной велодорожкой. В дождь
              или сильный ветер — автобус к озеру вместо велосипеда.
            </p>
          </section>
        </div>
        <section className="fuji-rental">
          <h4>Прокат и бюджет на двоих</h4>
          <p>
            <b>Fuji Kanko Travel</b>, 3644-1 Funatsu, рядом со станцией:
            открывается в 09:00, предварительной брони нет. На три часа два
            обычных велосипеда — <b>¥2 400 ≈ 1 327 ₽</b>; два электрических —{' '}
            <b>¥3 600 ≈ 1 990 ₽</b>. Минимум два часа, наличие — по приезде.
            Время возврата считаем от фактической выдачи.
          </p>
          <p>
            <b>С бронью заранее:</b> Soranoshita у станции — два обычных
            велосипеда с шлемами на день <b>¥6 000 ≈ 3 317 ₽</b>, через RESERVA.
            Вернуть планируем до полудня; сумма залога уточняется в прокате.
            Наличие на ноябрь не проверено.
          </p>
          <div className="fuji-links">
            <Link href="https://www.fujikanko-travel.jp/rental_cycle/">
              Тарифы Fuji Kanko
            </Link>
            <Link href="https://reserva.be/soranoshita">Бронь Soranoshita</Link>
            <Link href={mapSearch('Fuji Kanko Travel 3644-1 Funatsu')}>
              Пункт проката
            </Link>
          </div>
          <p className="fuji-small">
            Курс для плана: ¥1 = 0,552789 ₽. В исходном резерве «Озеро,
            велосипеды и Yurari» 2 000 ₽: обычная аренда плюс хранение двух
            вещей один день в Soranoshita (¥500 за предмет, с 09:00) стоят
            вместе около 1 879 ₽. Для электро с багажом разумно заложить 2 700
            ₽, для брони Soranoshita с багажом — 4 000 ₽. До отеля пешком или
            бесплатным шаттлом; платный подвоз и дополнительный день хранения
            добавить отдельно. Межгород и питание считаются отдельно.{' '}
            <Link href="https://www.soranoshita.net/kawaguchiko/service/baggagestorage/">
              Хранение багажа
            </Link>{' '}
            Фестиваль и подсветка Momiji Corridor начнутся 7 ноября, после вашей
            ночёвки.{' '}
            <Link href="https://fujisan.ne.jp/news/6065/">Даты фестиваля</Link>
          </p>
        </section>
        <p>
          Выбор рёкана пока не заменяет сохранённый Toyoko Inn в общем бюджете.
          Когда выберете номер, внесите его итог и ссылку в покупку жилья;
          местный налог из этих котировок второй раз не добавляйте.
        </p>
        <div className="fuji-budget-actions">
          <Button variant="outline" onClick={() => onPurchase('h-fuji')}>
            Открыть жильё в бюджете
          </Button>
          <Button variant="outline" onClick={() => onPurchase('t-fuji-local')}>
            Открыть транспорт у озера
          </Button>
        </div>
      </div>
    </details>
  );
}
