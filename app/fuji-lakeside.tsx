import { Bike, ExternalLink } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { mapDirections } from './route-data';
import { plannedFujiStay } from './main-bookings';
import { baseRouteDays } from './base-route-days';

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
        <span>5 ноября: велосипеды и онсэн · 6 ноября: озеро до обеда</span>
      </summary>
      <div className="fuji-lakeside-body">
        <p>
          <b>Целый дом на одну ночь для двоих.</b> Две спальни, пять
          односпальных кроватей, одна ванная, кухня, стиральная машина и
          джакузи. По описанию хозяина до озера около минуты, до причала и
          канатной дороги около двух минут. Заезд после <b>16:00</b>, выезд до{' '}
          <b>10:00</b>.
        </p>
        <p>
          30 сентября Airbnb показал итог <b>¥23 000 ≈ 12 335,48 ₽</b> по курсу
          ЦБ 0,536325 ₽/¥. Рублёвое списание и условия отмены сверить перед
          оплатой. Бронь ещё предстоит купить; в исходном бюджете сохранён
          прежний резерв 17 426,70 ₽, личная сумма — во вкладке «Покупки».
        </p>
        <div className="fuji-links">
          <Link href={plannedFujiStay.link}>
            Villa House · 5–6 ноября · 2 гостя
          </Link>
          <Link href="https://www.cbr.ru/currency_base/daily/?UniDbQuery.Posted=True&UniDbQuery.To=30.09.2026">
            Курс ЦБ на 30 сентября
          </Link>
        </div>
        <p className="fuji-small">
          Точный адрес и инструкция входа после бронирования. Ориентир карты —
          район причала. Джакузи не считаем термальным онсэном; бесплатный
          трансфер не подтверждён.
        </p>
        <p>
          <b>Приезжаем к озеру утром, а не к заселению.</b> Целевой автобус
          Мисима 09:20 → Кавагутико 10:50. Стыковка по расписанию JR: Nozomi 232
          Киото 06:29 → Нагоя 07:03, затем Kodama 822 Нагоя 07:38 → Мисима
          08:54. Перед покупкой сверяем рейсы на ноябрь. Онсэн вечером — часть
          основной программы. На следующий день остаёмся у озера до обеда,
          выезжаем в Токио около 15:00. Поезд и автобус пока не куплены.
        </p>
        <div className="fuji-plan-grid">
          {['2026-11-05', '2026-11-06'].map((date) => {
            const day = baseRouteDays.find((item) => item.date === date)!;
            const stops =
              date === '2026-11-05'
                ? day.stops.filter((_, index) =>
                    [2, 3, 4, 5, 6, 7, 9, 11, 12].includes(index),
                  )
                : day.stops.slice(0, -1);
            return (
              <section key={date}>
                <h4>
                  <Bike size={19} aria-hidden="true" />
                  {date === '2026-11-05'
                    ? '5 ноября · озеро, велосипеды и вечерний онсэн'
                    : '6 ноября · ещё полдня у озера'}
                </h4>
                <ol className="fuji-mini-plan">
                  {stops.map((item) => (
                    <li key={item.title}>
                      <b>{item.time}</b>
                      <span>{item.title}</span>
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </div>
        <p>
          <b>Mifujien: 17:00–18:30 после велосипедов.</b> Раздельные купальни,
          внутренние и открытые бассейны. Вход ¥1200 с человека с полотенцем,
          двое ¥2400 ≈ 1287 ₽; отдельный резерв 1500 ₽. Приём дневных гостей
          13:00–20:00, купание до 21:00. Доступ именно 5 ноября подтвердить
          заранее: бывают закрытия. Вечером вид Фудзи не обещаем — панорамы
          смотрим днём.
        </p>
        <p className="fuji-small">
          Если Mifujien не принимает, сохраняем купание и выбираем Yurari с
          заранее подтверждённым шаттлом от станции около 18:00 и обратно около
          20:00; расписание, тариф и места уточнить. Ужин тогда позже. Fujiyama
          Onsen сейчас закрыт и запасным не считается.
        </p>
        <div className="fuji-links">
          <Link href="https://www.mifujien.co.jp/onsen/">
            Mifujien: дневной вход
          </Link>
          <Link href="https://www.fuji-yurari.jp/access.html">
            Yurari: запасной онсэн и шаттл
          </Link>
          <Link href="https://www.fujikyucitybus.com/highwaybus/kawaguchiko.html">
            Ранний автобус из Мисимы
          </Link>
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
          Полный круг вокруг озера не планируем. Oishi Park пропускаем при
          задержке, чтобы не спешить к возврату велосипедов. У Ubuyagasaki —
          береговой обход тоннеля. В дождь и сильный ветер — автобус вместо
          велосипеда; при улучшении погоды прокат можно перенести на утро 6
          ноября примерно 10:30–13:30 вместо прогулки.
        </p>
        <section className="fuji-rental">
          <h4>Велосипеды и хранение багажа</h4>
          <p>
            Два обычных велосипеда на три часа 5 ноября ¥2400 + два чемодана у
            проката ¥600 + хранение двух вещей 6 ноября ¥1000 ={' '}
            <b>¥4000 ≈ 2145 ₽</b>. Рекомендуемый резерв около 2200 ₽ вместо
            прежних 2000 ₽. Два обычных велосипеда на день ¥4000, два
            электрических на три часа ¥3600 — при продлении пересчитать резерв.
            Предварительной брони в Fuji Kanko нет, бесплатные шлемы есть.
            Междугородние билеты, еда и возможное такси отдельно.
          </p>
          <div className="fuji-links">
            <Link href="https://www.fujikanko-travel.jp/rental_cycle/">
              Тарифы проката
            </Link>
            <Link href="https://www.soranoshita.net/kawaguchiko/service/baggagestorage/">
              Хранение багажа 6 ноября
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
            Вечерний онсэн Mifujien
          </Button>
        </div>
      </div>
    </details>
  );
}
