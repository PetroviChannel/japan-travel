import { Bike, ExternalLink } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { mapDirections, mapSearch } from './route-data';
import KawaguchikoOnsenMap from './kawaguchiko-onsen-map';
import {
  kawaHotels,
  kawaBaths,
  kawaPairs,
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
        <span className="eyebrow">Кавагутико · 5–6 ноября · двое взрослых</span>
        <strong>Татами, футоны и онсэны на карте</strong>
        <span>Выбрать жильё → сравнить расстояние и стоимость купален</span>
      </summary>
      <div className="fuji-lakeside-body">
        <p>
          <b>Остаёмся на Кавагутико, сохраняем озеро и велопрогулку.</b> На 5–6
          ноября бюджетный вариант — японский номер Royal за <b>15 530 ₽</b>,
          общий термальный онсэн уже включён. Более традиционный по атмосфере
          старый дом Kashiwaya стоит <b>6 735 ₽</b>, но это соседняя ночь{' '}
          <b>6–7 ноября</b>. Даты поездки ради него пока не меняем.
        </p>
        <p>
          <b>Для платного посещения с видом я бы выбрал Mifujien:</b> ¥1 200 с
          человека, прокатное полотенце включено. От Royal — 2 км / 28 минут
          пешком, от Yamagishi — 1,3 км / 18 минут. Сначала заселяемся,
          оставляем чемоданы и только потом идём в купальню.
        </p>
        <p className="fuji-small">
          Проверено 8 сентября 2026: цены номеров с экрана оформления Trip.com,
          один номер на двоих. В Royal и Yamagishi включён налог ¥300,
          оплачиваемый в отеле. Применённые скидки уже учтены; будущие Trip
          Coins не вычитаем. У Royal часть скидки доступна после входа в
          аккаунт. Цены и наличие могут измениться.
        </p>

        <KawaguchikoOnsenMap
          hotels={kawaHotels}
          baths={kawaBaths}
          pairs={kawaPairs}
          yenRate={kawaYenRate}
        />

        <details className="fuji-backup">
          <summary>Номера, фотографии, санузлы и отмена</summary>
          <p>
            <b>Royal · 15 530,08 ₽:</b> 15 363,02 ₽ онлайн + ¥300 в отеле. Run
            of House, 3 футона в описании категории, 10–15 м², двое гостей, без
            еды. Вид и собственный санузел уточнить именно для этого тарифа;
            характеристики других номеров не переносим. Заезд 15:00–19:00, выезд
            до 10:00. Отмена бесплатно до 28 октября 23:59 по времени отеля,
            затем полная стоимость онлайн.
          </p>
          <div className="fuji-links">
            <Link href="https://www.fuji-royalhotel.jp/rooms.php">
              Royal: фото японских комнат
            </Link>
            <Link href="https://www.fuji-royalhotel.jp/location.php">
              Шаттл Royal и место посадки
            </Link>
          </div>
          <p>
            <b>Yamagishi · 17 426,70 ₽:</b> 17 259,64 ₽ онлайн + ¥300 в отеле.
            Run of House, в категории 6 футонов, собственная ванная, двое
            гостей, без питания. Конкретную комнату назначают при заезде. Отмена
            бесплатно до 29 октября 12:00 по времени отеля, затем штраф 30%,
            50%, 100%. Заезд 15:00–21:00, выезд до 10:00. Собственный общий
            термальный онсэн уже есть, Mifujien — дополнительная прогулка по
            желанию.
          </p>
          <div className="fuji-links">
            <Link href="https://yamagisi.jp/guest_room.html">
              Yamagishi: комнаты и фотографии
            </Link>
            <Link href="https://www.yamagisi.jp/language.html">
              Расположение и купальни
            </Link>
          </div>
          <p>
            <b>Kashiwaya · 6 735,45 ₽ только 6–7 ноября:</b> японская комната
            12,5 татами / 20 м², тариф на двоих с лёгким завтраком. Название
            «для 5 человек» — вместимость, не пять гостей в расчёте. Старый
            японский гостевой дом с общими санузлами; стандарт рёкана с личной
            ванной здесь не обещан. Заезд 14:00–20:00, выезд до 10:00. Отмена
            бесплатно до 2 ноября 23:59, затем 20%, 50%, 100% по времени отеля.
            Утренний хлеб и кофе — простой завтрак, не кайсэки.
          </p>
          <div className="fuji-links">
            <Link href="https://gh-kashiwaya.com/index_en/">
              Kashiwaya: старый дом и фото
            </Link>
            <Link href="https://gh-kashiwaya.com/plan_en/">
              Японские комнаты и питание
            </Link>
            <Link href="https://gh-kashiwaya.com/facilities_en/">
              Общие удобства
            </Link>
          </div>
        </details>
        <details className="fuji-backup">
          <summary>
            Ещё два бюджетных адреса, но тариф на двоих пока не подтверждён
          </summary>
          <p>
            <b>Kawaguchiko Station Inn</b> — татами и футоны, общие санузлы,
            прямо напротив станции; официальный сайт разрешает хранение багажа
            до заезда и после выезда. На 5–6 ноября оформление Trip.com
            показывало 10 510 ₽, но тариф был на <b>трёх взрослых</b>. Эту сумму
            не выдаём за подтверждённую бронь на двоих и не включаем в
            сравнение. Вода собственной видовой купальни не подтверждена как
            термальная.
          </p>
          <div className="fuji-links">
            <Link href={kawaBooking(706382, 'kawaguchiko-station-inn')}>
              Station Inn на Trip.com
            </Link>
            <Link href="https://www.st-inn.com/en/room">
              Футоны и хранение вещей
            </Link>
            <Link href={mapSearch('Kawaguchiko Station Inn')}>На карте</Link>
          </div>
          <p>
            <b>Togawaso</b> — минсюку у Yagizaki Park, японские комнаты с
            футонами; туалеты и купальни общие, все комнаты на втором этаже без
            лифта. На проверке Trip.com временно не принимал брони. Подходит по
            формату, но без подтверждённой цены на вашу ночь.
          </p>
          <div className="fuji-links">
            <Link href={kawaBooking(706419, 'togawaso')}>
              Togawaso на Trip.com
            </Link>
            <Link href="https://katsuyama-minsyuku.com/togawaso/">
              Описание ассоциации минсюку
            </Link>
            <Link href={mapSearch('Togawaso Kodachi 939')}>На карте</Link>
          </div>
        </details>

        <div className="fuji-plan-grid">
          <section>
            <h4>5 ноября · заселиться, потом в онсэн</h4>
            <ol className="fuji-mini-plan">
              <li>
                <b>13:15–14:30</b>
                <span>
                  Прибытие из Мисимы и обед рядом со станцией. Автобус и поезд
                  пока плановые ориентиры.
                </span>
              </li>
              <li>
                <b>14:30–15:00</b>
                <span>
                  До Royal около 20 минут пешком. С большими чемоданами удобнее
                  согласованный бесплатный шаттл с 15:00; поездка около 5 минут.
                  Раннее хранение вещей не подтверждено.
                </span>
              </li>
              <li>
                <b>15:00–15:30</b>
                <span>
                  Заселение, чемоданы в номер. Уточнить, принимает ли сегодня
                  Mifujien дневных гостей.
                </span>
              </li>
              <li>
                <b>15:30–16:00</b>
                <span>
                  Если дневной вход подтверждён — прогулка 2 км до Mifujien без
                  багажа.
                </span>
              </li>
              <li>
                <b>16:00–17:00</b>
                <span>
                  Общий онсэн с видом, ¥2 400 на двоих. Альтернатива без
                  расходов и прогулки — включённый Kaiun в Royal.
                </span>
              </li>
              <li>
                <b>17:00–19:00</b>
                <span>
                  Вернуться, поужинать рядом с жильём. Питание Royal/Yamagishi в
                  проверенных бюджетных тарифах не включено.
                </span>
              </li>
            </ol>
            <p className="fuji-small">
              Для Yamagishi прогулка до Mifujien короче: около 18 минут.
              Kashiwaya остаётся вариантом на другую ночь; программу 5–6 ноября
              автоматически не сдвигает. Купальни общие и раздельные для мужчин
              и женщин.
            </p>
            <div className="fuji-links">
              <Link href="https://www.fuji-royalhotel.jp/assets/images/onsen/coupon_ja.pdf">
                Будний купон Kaiun
              </Link>
              <Link href="https://www.fuji-yurari.jp/access.html">
                Yurari: шаттл и запись
              </Link>
            </div>
            <p className="fuji-small">
              Fujiyama Onsen в подборку не включён: на проверке продолжалось
              закрытие без даты открытия.{' '}
              <Link href="https://www.fujiyamaonsen.jp/news/copy_of_maintenance.html">
                Официальное уведомление
              </Link>
            </p>
          </section>
          <section>
            <h4>
              <Bike size={19} aria-hidden="true" />6 ноября · велосипеды и Фудзи
            </h4>
            <ol className="fuji-mini-plan">
              <li>
                <b>08:00–08:45</b>
                <span>
                  Завтрак и сбор вещей. Для тарифа без еды — купить завтрак
                  накануне или позавтракать рядом.
                </span>
              </li>
              <li>
                <b>08:45–09:30</b>
                <span>
                  Выезд из Royal и около 20 минут пешком к станции либо
                  согласованный утренний шаттл. Багаж оставить в Soranoshita,
                  открывается в 09:00.
                </span>
              </li>
              <li>
                <b>09:30–12:00</b>
                <span>
                  Прокат → восточный берег → Ubuyagasaki → Nagasaki Park. При
                  хорошем темпе — Oishi Park. Из Oishi обратно не позднее 10:45;
                  велосипеды вернуть к 11:45, крайнее 12:00. До 12–14 км.
                </span>
              </li>
              <li>
                <b>12:00–13:00</b>
                <span>
                  Забрать чемоданы, перекусить и сесть на заранее купленный
                  автобус в Токио. 13:00 — плановый ориентир, не подтверждённый
                  рейс.
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
              В Google велосипедная навигация может быть недоступна —
              используйте точки и карту проката. У Ubuyagasaki — береговой обход
              тоннеля; на людных участках спешиваться. При задержке, ветре или
              дожде сократить маршрут.
            </p>
          </section>
        </div>
        <section className="fuji-rental">
          <h4>Велосипеды и багаж: расходы на двоих</h4>
          <p>
            Fuji Kanko Travel: три часа двух обычных велосипедов{' '}
            <b>¥2 400 ≈ 1 327 ₽</b>, электрических <b>¥3 600 ≈ 1 990 ₽</b>.
            Открытие 09:00, минимум два часа, предварительной брони нет.
            Soranoshita принимает бронь, но два обычных велосипеда на день стоят{' '}
            <b>¥6 000 ≈ 3 317 ₽</b>.
          </p>
          <p>
            Хранение двух чемоданов в Soranoshita: <b>¥1 000 ≈ 553 ₽</b> за
            день. Обычные велосипеды на три часа + хранение укладываются
            примерно в <b>1 879 ₽</b>; с электрическими — в 2 543 ₽. Это
            отдельные расходы, в суммы «жильё + онсэн» на карте они не включены.
          </p>
          <div className="fuji-links">
            <Link href="https://www.fujikanko-travel.jp/rental_cycle/">
              Тарифы Fuji Kanko
            </Link>
            <Link href="https://reserva.be/soranoshita">Бронь велосипедов</Link>
            <Link href="https://www.soranoshita.net/kawaguchiko/service/baggagestorage/">
              Хранение багажа
            </Link>
          </div>
        </section>
        <p>
          Выбор на карте меняет только сравнение. В сохранённой смете пока
          прежний Toyoko Inn и билет Yurari; после выбора жилья нужно заменить
          эти строки. Вход в Kaiun гостям Royal не добавлять второй раз.
          Межгород Киото → Кавагутико → Токио считается отдельно.
        </p>
        <div className="fuji-budget-actions">
          <Button variant="outline" onClick={() => onPurchase('h-fuji')}>
            Жильё в бюджете
          </Button>
          <Button variant="outline" onClick={() => onPurchase('t-fuji-local')}>
            Транспорт и велосипеды
          </Button>
        </div>
      </div>
    </details>
  );
}
