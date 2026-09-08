import { Bike, BedDouble, ExternalLink } from 'lucide-react';
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
const hotels = [
  {
    name: 'Royal Hotel Kawaguchiko',
    tag: 'Самый доступный из проверенных',
    total: 15100.65,
    online: 14932.43,
    rating: '8,5',
    room: 'Обновлённый Japanese-Western Twin, 17 м²: две кровати, собственные душ и туалет. Без питания; общий онсэн в отеле.',
    view: 'Южный берег у Oike Park. Вид на Фудзи или озеро в этом тарифе не обещан: за панорамой едем на северный берег.',
    access:
      'Около 20 минут пешком от станции. Бесплатный трансфер 15:00–18:00 согласовать заранее; утренний 8:30–10:00 удобен к прокату.',
    terms:
      'Отмена бесплатно до 28 октября 23:59 по времени отеля. Заезд 15:00–19:00. Скидки Trip.com уже учтены; горячая вода по правилам объекта не круглосуточно.',
    url: booking(706299, 'fuji-royal-hotel-kawaguchiko'),
    official: 'https://www.fuji-royalhotel.jp/en/rooms.php',
  },
  {
    name: 'Yamagishi Ryokan',
    tag: 'Японская ночь с завтраками',
    total: 19369.67,
    online: 19201.45,
    rating: '8,4',
    room: 'Japanese Room, 16 м², собственная ванная. Два завтрака и общий онсэн; ужин отдельно.',
    view: 'У юго-восточного берега. У выбранного номера вид не закреплён; Lake View — другая категория. Вид Фудзи над озером из этого номера не гарантирован.',
    access:
      'Около 8–12 минут пешком от станции: удобно с багажом и для утренней аренды. Есть бесплатная встреча по звонку.',
    terms:
      'Отмена бесплатно до 29 октября 23:59 по времени отеля. Заезд 15:00–21:00, выезд до 10:00. Для ужина в рёкане нужен отдельный подходящий тариф.',
    url: booking(704687, 'yamagisi-ryokan'),
    official: 'https://www.yamagisi.jp/language.html',
  },
  {
    name: 'Fuji Lake Hotel',
    tag: 'Доплата за озеро, простор и питание',
    total: 38697.44,
    online: 38529.22,
    rating: '9,4',
    room: 'Lake View Japanese-Western, западный корпус, 45 м², собственная ванная. Ужин и завтрак на двоих, общий онсэн.',
    view: 'Вид на озеро, без вида на Фудзи из выбранного номера. Отель прямо предупреждает: из одного номера оба вида одновременно недоступны. Частного онсэна в этом тарифе нет.',
    access:
      'Около 10–15 минут пешком от станции, бесплатный трансфер по звонку. Заезд с 15:00; удобно провести весь вечер в отеле.',
    terms:
      'Отмена бесплатно до 21 октября 23:59, затем полная стоимость номера. Ужин-буфет 18:00–21:00, последний вход 19:30; свой сеанс уточнить при заселении.',
    url: booking(704371, 'fuji-lake-hotel'),
    official: 'https://www.fujilake.co.jp/english/',
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
        <strong>Рёкан у озера + утро на велосипедах</strong>
        <span>Выбрать жильё, посмотреть доплату и план отдыха</span>
      </summary>
      <div className="fuji-lakeside-body">
        <p>
          База — озеро Кавагутико. У южного берега удобно жить без машины, а за
          видом на Фудзи через воду отправляемся на северный берег. Для экономии
          я бы выбрал Royal; для более традиционного проживания с завтраками —
          Yamagishi.
        </p>
        <p className="fuji-small">
          Цены проверены 8 сентября 2026 на экране оформления Trip.com: один
          номер на двоих, 5–6 ноября. Во все итоги ниже уже включён местный
          налог ¥300 (около 168 ₽), оплачиваемый в отеле. Скидки, показанные на
          оформлении, уже вычтены; новые промокоды и будущие Trip Coins повторно
          не считаем. Наличие и цена могут измениться.
        </p>
        <div className="fuji-hotel-grid">
          {hotels.map((h) => (
            <article key={h.name}>
              <span className="eyebrow">{h.tag}</span>
              <h4>
                <BedDouble size={18} aria-hidden="true" />
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
                Это сравнение с прежней котировкой 10 664 ₽, а не изменение
                вашей сметы.
              </p>
            </article>
          ))}
        </div>
        <details className="fuji-backup">
          <summary>
            Если хочется Фудзи и озеро прямо из японского номера
          </summary>
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
              Этот вариант заменяет поездку в Yurari и позднее заселение в
              программе ниже.
            </p>
            <ol className="fuji-mini-plan">
              <li>
                <b>13:15–14:00</b>
                <span>
                  Прибытие из Мисимы, обед у станции. Межгород остаётся по
                  основному плану.
                </span>
              </li>
              <li>
                <b>14:00–15:00</b>
                <span>
                  Доехать или дойти до отеля, оставить вещи по согласованию и
                  немного погулять у озера.
                </span>
              </li>
              <li>
                <b>15:00–16:00</b>
                <span>
                  Заселение, чай, отдых и вид из номера, если он предусмотрен
                  тарифом.
                </span>
              </li>
              <li>
                <b>16:00–17:30</b>
                <span>
                  Онсэн своего отеля. Короткую прогулку и фотографии лучше
                  закончить до 16:30.
                </span>
              </li>
              <li>
                <b>18:00–19:30</b>
                <span>
                  Ужин: у Fuji Lake включён, у двух бюджетных тарифов — кафе или
                  отдельная покупка.
                </span>
              </li>
            </ol>
            <p className="fuji-small">
              При выборе этого вечера отдельный Yurari не нужен: можно убрать
              примерно 1 550 ₽ за вход на двоих, если он ещё не оплачен. Заявка
              на шаттл не отправлена. Онсэн в рёкане обычно общий и раздельный
              для мужчин и женщин.
            </p>
          </section>
          <section>
            <h4>
              <Bike size={19} aria-hidden="true" />6 ноября · Фудзи с берега
              озера
            </h4>
            <p>
              <b>09:15–12:00, ориентир 12–14 км.</b> Прокат у станции →
              восточный берег → Ubuyagasaki → Nagasaki Park → Oishi Park →
              северный берег → мост Ohashi → прокат. Подробные остановки
              добавлены в программу 6 ноября.
            </p>
            <p>
              Из Oishi выехать обратно к 10:45–11:00; цель — сдать велосипеды в
              11:45, крайнее время 12:00. При ветре, задержке выдачи или
              усталости разворот у Nagasaki Park.
            </p>
            <div className="fuji-links">
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
