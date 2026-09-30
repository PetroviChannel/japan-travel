import { Bike, ExternalLink } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { mapDirections } from './route-data';
import { plannedFujiStay } from './main-bookings';

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
        <strong>Villa House на Airbnb: дом у озера</strong>
        <span>Предстоит купить · заезд после 16:00 · утром велосипеды</span>
      </summary>
      <div className="fuji-lakeside-body">
        <p>
          <b>Целый дом на одну ночь для двоих.</b> Две спальни, пять односпальных
          кроватей, одна ванная, кухня, стиральная машина и джакузи. По описанию
          хозяина до озера около минуты, до причала и канатной дороги около двух
          минут. Заезд после <b>16:00</b>, выезд до <b>10:00</b>.
        </p>
        <p>
          30 сентября на выбранные даты Airbnb показал итог <b>¥23 000</b> —
          примерно <b>12 335,48 ₽</b> по курсу ЦБ 0,536325 ₽/¥. Рублёвое списание,
          состав сборов и условия отмены проверить перед оплатой. Бронь ещё
          предстоит купить; в исходном бюджете сохранён прежний резерв
          17 426,70 ₽, личный план можно уточнить во вкладке «Покупки».
        </p>
        <div className="fuji-links">
          <Link href={plannedFujiStay.link}>Villa House · 5–6 ноября · 2 гостя</Link>
          <Link href="https://www.cbr.ru/currency_base/daily/?UniDbQuery.Posted=True&UniDbQuery.To=30.09.2026">
            Курс ЦБ на 30 сентября
          </Link>
        </div>
        <p className="fuji-small">
          Точный адрес и инструкция входа появятся после бронирования.
          Ориентир на карте — район причала, а не подтверждённый адрес дома.
          Термальный онсэн и бесплатный трансфер в карточке не подтверждены.
          Джакузи не считаем включённым посещением онсэна.
        </p>
        <div className="fuji-plan-grid">
          <section>
            <h4>5 ноября · заселение и спокойный вечер</h4>
            <ol className="fuji-mini-plan">
              <li>
                <b>14:50–15:30</b>
                <span>
                  Прибытие автобуса из Мисимы на станцию Кавагутико. Путь к
                  дому уточнить после бронирования; раннюю сдачу багажа
                  согласовать с хозяином либо выбрать хранение у станции.
                </span>
              </li>
              <li>
                <b>15:30–16:00</b>
                <span>Перекус, продукты для кухни и ожидание заезда.</span>
              </li>
              <li>
                <b>16:00–16:30</b>
                <span>Заселение по инструкции хозяина, чемоданы в доме.</span>
              </li>
              <li>
                <b>16:30–17:30</b>
                <span>Набережная без вещей или отдых после дороги.</span>
              </li>
              <li>
                <b>18:00–19:30</b>
                <span>Ужин поблизости или на кухне Villa House.</span>
              </li>
            </ol>
            <p className="fuji-small">
              Онсэн Mifujien — по желанию вместо вечерней прогулки. Прежний
              тариф ¥1200 с человека, на двоих ¥2400 с прокатными полотенцами;
              в бюджете отдельный резерв 1500 ₽. Дневной вход, цену и дорогу
              от дома подтвердить заранее.
            </p>
            <div className="fuji-links">
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
                <span>Завтрак отдельно и выселение по инструкции хозяина.</span>
              </li>
              <li>
                <b>08:45–09:15</b>
                <span>
                  К станции с запасом по точному адресу; чемоданы в
                  Soranoshita с 09:00.
                </span>
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
                  Забрать багаж, перекусить, посадка в автобус до Токио.
                  13:00 — ориентир до покупки билета.
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
          <h4>Велосипеды и хранение багажа</h4>
          <p>
            <b>Резерв 2000 ₽</b>: два обычных велосипеда на три часа ¥2400 +
            два чемодана на день ¥1000 ≈ 1879 ₽ по прежнему курсу расчёта.
            Междугородние билеты и еда учтены отдельно. В Fuji Kanko
            предварительной брони нет; Soranoshita принимает бронь, но два
            обычных велосипеда на день стоят ¥6000 без хранения.
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
            Airbnb в бюджете
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
