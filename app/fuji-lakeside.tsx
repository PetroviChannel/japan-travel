import { Bike, ExternalLink } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { mapDirections } from './route-data';
import KawaguchikoOnsenMap from './kawaguchiko-onsen-map';
import {
  mainKawaHotels,
  mainKawaBaths,
  mainKawaPairs,
  kawaYenRate,
  kawaBooking,
} from './kawaguchiko-onsen-data';

function Link({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <ExternalLink size={13} aria-hidden="true" />
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
      if (!guideRef.current) return;
      guideRef.current.open = true;
      guideRef.current.querySelector('summary')?.focus({ preventScroll: true });
      guideRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <details className="fuji-lakeside" id="fuji-lakeside" ref={guideRef} open>
      <summary>
        <span className="eyebrow">
          Основной маршрут · Фудзикавагутико · 5–6 ноября
        </span>
        <strong>Yamagishi Ryokan: футоны, озеро и онсэн</strong>
        <span>Сначала заселение · купальни в рёкане · утром велосипеды</span>
      </summary>
      <div className="fuji-lakeside-body">
        <p>
          <b>Одна ночь на двоих — 17 426,70 ₽.</b> Японский номер Run of House с
          футонами на татами, собственная ванная и общие термальные купальни в
          рёкане. Интерьер обновлённый; конкретные размер и вид комнаты
          назначают при заезде. Питание в этой цене отсутствует.
        </p>
        <p>
          Автобус из Мисимы <b>13:20–14:50</b>, затем около 8–12 минут пешком со
          станции прямо в Yamagishi. Заезд с <b>15:00</b>: оставляем чемоданы в
          номере, гуляем по берегу и идём в свой онсэн. Бесплатный трансфер от
          станции можно согласовать по телефону рёкана.
        </p>
        <div className="fuji-links">
          <Link href={kawaBooking(704687, 'yamagisi-ryokan')}>
            Забронировать Yamagishi на Trip.com · 5–6 ноября
          </Link>
          <Link href="https://yamagisi.jp/guest_room.html">
            Комнаты и фотографии
          </Link>
          <Link href="https://yamagisi.jp/access.html">Дорога и трансфер</Link>
        </div>
        <p className="fuji-small">
          Цена проверена на оформлении Trip.com 8 сентября 2026: 17 259,64 ₽
          онлайн + ¥300 в рёкане, налог уже учтён в итоге. Бесплатная отмена до
          29 октября 12:00 по времени отеля; после — штраф по условиям тарифа.
          Номер и билеты ещё предстоит купить, цена и наличие меняются.
          Расписание автобуса проверено 9 сентября; перед покупкой сверить
          ноябрьский рейс.
        </p>
        <KawaguchikoOnsenMap
          hotels={mainKawaHotels}
          baths={mainKawaBaths}
          pairs={mainKawaPairs}
          yenRate={kawaYenRate}
        />
        <p>
          <b>Онсэн рядом — буквально в самом рёкане, без доплаты за вход.</b>{' '}
          Если захочется ещё одну купальню с видом на Фудзи, Mifujien в 1,3 км /
          примерно 18 минутах пешком. Вход ¥2400 ≈ 1327 ₽ на двоих с прокатными
          полотенцами. Этот визит по желанию: он заменяет время в купальнях
          Yamagishi, а не добавляется поверх полного вечера. Дневной приём
          Mifujien нужно подтвердить заранее.
        </p>
        <div className="fuji-plan-grid">
          <section>
            <h4>5 ноября · заселение и спокойный вечер</h4>
            <ol className="fuji-mini-plan">
              <li>
                <b>14:50–15:10</b>
                <span>
                  Со станции прямо в Yamagishi, пешком или согласованным
                  трансфером.
                </span>
              </li>
              <li>
                <b>15:10–15:40</b>
                <span>Заселение, чемоданы в номер.</span>
              </li>
              <li>
                <b>15:40–16:15</b>
                <span>Набережная Funatsu Hama без вещей.</span>
              </li>
              <li>
                <b>16:15–17:30</b>
                <span>Общий термальный онсэн в рёкане, вход включён.</span>
              </li>
              <li>
                <b>18:00–19:30</b>
                <span>Ужин поблизости и вечер в японском номере.</span>
              </li>
            </ol>
            <div className="fuji-links">
              <Link href="https://yamagisi.jp/hot_spring.html">
                Купальни Yamagishi
              </Link>
              <Link href="https://www.mifujien.co.jp/onsen/">
                Дневной вход Mifujien
              </Link>
            </div>
          </section>
          <section>
            <h4>
              <Bike size={19} aria-hidden="true" />6 ноября · велосипеды и Фудзи
            </h4>
            <ol className="fuji-mini-plan">
              <li>
                <b>08:00–08:45</b>
                <span>Завтрак отдельно и выселение.</span>
              </li>
              <li>
                <b>08:45–09:15</b>
                <span>Пешком к станции, чемоданы в Soranoshita с 09:00.</span>
              </li>
              <li>
                <b>09:15–12:00</b>
                <span>
                  Fuji Kanko → Ubuyagasaki → Nagasaki Park. Если успеваете —
                  Oishi Park; обратно через мост Ohashi. Велосипеды сдать к
                  11:45, запас до 12:00.
                </span>
              </li>
              <li>
                <b>12:00–13:00</b>
                <span>
                  Забрать багаж, перекусить, посадка в автобус до Токио. 13:00 —
                  ориентир до покупки билета.
                </span>
              </li>
            </ol>
            <div className="fuji-links">
              <Link
                href={mapDirections(
                  'Fuji Kanko Travel Kawaguchiko',
                  'Oishi Park Kawaguchiko',
                  'bicycling',
                  ['Ubuyagasaki Kawaguchiko', 'Nagasaki Park Kawaguchiko'],
                )}
              >
                Велоточки в Google Maps
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
              До 12–14 км, не полный круг вокруг озера. У Ubuyagasaki —
              береговой обход тоннеля. Если ветер, дождь или задержка проката,
              сократить маршрут. Велосипедная навигация Google может быть
              недоступна; используйте точки и карту проката.
            </p>
          </section>
        </div>
        <section className="fuji-rental">
          <h4>Что уже учтено в основном бюджете</h4>
          <p>
            Yamagishi с общим онсэном — <b>17 426,70 ₽</b>. Велосипеды и багаж —{' '}
            <b>резерв 2000 ₽</b>: два обычных велосипеда на три часа ¥2400 + два
            чемодана на день ¥1000 ≈ 1879 ₽. Итого эти расходы —{' '}
            <b>19 426,70 ₽</b> на двоих, без междугородних билетов и еды.
          </p>
          <p>
            Ещё <b>1500 ₽ по желанию</b> оставлено на Mifujien. Для двух
            электровелосипедов и багажа вместо обычных потребуется около 2543 ₽.
            В Fuji Kanko предварительной брони нет; Soranoshita принимает бронь,
            но два обычных велосипеда на день стоят ¥6000 без хранения.
          </p>
          <div className="fuji-links">
            <Link href="https://www.fujikanko-travel.jp/rental_cycle/">
              Тарифы проката
            </Link>
            <Link href="https://reserva.be/soranoshita">Прокат с бронью</Link>
            <Link href="https://www.soranoshita.net/kawaguchiko/service/baggagestorage/">
              Хранение багажа
            </Link>
          </div>
        </section>
        <div className="fuji-budget-actions">
          <Button variant="outline" onClick={() => onPurchase('h-fuji')}>
            Yamagishi в бюджете
          </Button>
          <Button variant="outline" onClick={() => onPurchase('t-fuji-local')}>
            Велосипеды и багаж
          </Button>
          <Button variant="outline" onClick={() => onPurchase('p-small')}>
            Mifujien по желанию
          </Button>
        </div>
      </div>
    </details>
  );
}
