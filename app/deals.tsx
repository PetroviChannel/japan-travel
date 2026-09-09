'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { SavedPurchase } from './purchase-state';
const rub = (n: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(n);
const Link = ({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) => (
  <a href={url} target="_blank" rel="noopener noreferrer">
    {children} ↗
  </a>
);
export default function Deals({
  records,
  disabled,
  save,
}: {
  records: Record<string, SavedPurchase>;
  disabled: boolean;
  save: (r: SavedPurchase) => Promise<SavedPurchase>;
}) {
  const [expired, setExpired] = useState(false),
    [message, setMessage] = useState('');
  useEffect(
    () => setExpired(Date.now() > Date.parse('2026-09-10T23:59:59+03:00')),
    [],
  );
  const food = async (plan: number) => {
    setMessage('');
    try {
      await save({ ...records['d-food'], plan });
      setMessage('Бюджет питания сохранён');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Не удалось сохранить');
    }
  };
  return (
    <>
      <div className="section-intro">
        <h2>Бюджетнее, но с удовольствием</h2>
        <p>
          Киото и Окинава остаются. Здесь — сравнение цен и небольшие решения,
          которые влияют на сумму.
        </p>
      </div>
      <div className="savings-grid">
        <section className="saving-card featured">
          <p className="eyebrow">Еда · на двоих</p>
          <h3>−15 000 ₽ без смены маршрута</h3>
          <p>
            50 000 ₽ вместо 65 000 ₽: простые завтраки, сетевые кафе,
            супермаркеты. Получается около 2 500 ₽ в день на двоих; для
            ресторанов остаётся меньше свободы.
          </p>
          <div className="editor-buttons">
            <Button
              disabled={
                disabled ||
                records['d-food'].paid ||
                records['d-food'].actual !== null
              }
              onClick={() => void food(50000)}
            >
              План 50 000 ₽
            </Button>
            <Button
              variant="outline"
              disabled={
                disabled ||
                records['d-food'].paid ||
                records['d-food'].actual !== null
              }
              onClick={() => void food(65000)}
            >
              Свободнее: 65 000 ₽
            </Button>
          </div>
          <p className="form-hint">
            Сейчас: {rub(records['d-food'].actual ?? records['d-food'].plan)}.
            Оплаченную сумму меняйте в карточке еды.
          </p>
          <p role="status">{message}</p>
        </section>
        <section className="saving-card">
          <p className="eyebrow">Что уже экономит</p>
          <h3>Апартаменты и обычные поезда</h3>
          <p>
            nippori в Осаке — 9 939 ₽ за четыре ночи с уборкой. Между Осакой и
            Киото — Hankyu, в Нариту — обычный поезд. JR Pass и Express Pass не
            добавлены.
          </p>
          <p>
            Shibuya Sky заложен днём. Отказ от него уберёт ещё около 3 000 ₽, а
            прогулка по Сибуе останется.
          </p>
        </section>
      </div>
      <section className="comparison">
        <div className="section-intro">
          <h2>Trip.com или российский сервис?</h2>
          <p>
            Проверка 8 сентября 2026. Два взрослых, один номер, указанные даты.
            У двух проверенных отелей выигрывает Trip.com. Это не проверка всех
            отелей на всех сайтах.
          </p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Отель / сервис</TableHead>
              <TableHead>Без нового промокода</TableHead>
              <TableHead>Со скидкой, если применится</TableHead>
              <TableHead>Перейти</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <strong>Horidome Villa · Токио</strong>
                <small>6–10 ноября · 4 ночи · Trip.com</small>
              </TableCell>
              <TableCell className="winner">29 723 ₽</TableCell>
              <TableCell>Уже дешевле сравнения</TableCell>
              <TableCell>
                <Link url="https://ru.trip.com/hotels/detail/?cityId=228&hotelId=686321&checkIn=2026-11-06&checkOut=2026-11-10&adult=2&crn=1&curr=RUB">
                  Trip.com
                </Link>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                Horidome Villa · Яндекс Путешествия
                <small>Semi-double · скидка 5% уже включена</small>
              </TableCell>
              <TableCell>32 192 ₽</TableCell>
              <TableCell>Кешбэк Плюса — баллы, не скидка к оплате</TableCell>
              <TableCell>
                <Link url="https://travel.yandex.ru/hotels/tokyo/hotel-horidome-villa/?checkinDate=2026-11-06&checkoutDate=2026-11-10&adults=2">
                  Яндекс
                </Link>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                Horidome Villa · Островок
                <small>Semi-double 11 м² · невозвратный</small>
              </TableCell>
              <TableCell>35 212 ₽</TableCell>
              <TableCell>
                {expired ? 'Промокод истёк' : '32 747 ₽ с ТЕПЛО · расчёт'}
              </TableCell>
              <TableCell>
                <Link url="https://ostrovok.ru/hotel/japan/tokyo/mid7403113/hotel_horidome_villa/?dates=06.11.2026-10.11.2026&guests=2">
                  Островок
                </Link>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <strong>KIORI Exec Gojo · Киото</strong>
                <small>1–5 ноября · 4 ночи · Trip.com</small>
              </TableCell>
              <TableCell className="winner">25 544 ₽</TableCell>
              <TableCell>Местный налог проверить отдельно</TableCell>
              <TableCell>
                <Link url="https://ru.trip.com/hotels/detail/?cityId=734&hotelId=131589475&checkIn=2026-11-01&checkOut=2026-11-05&adult=2&crn=1&curr=RUB">
                  Trip.com
                </Link>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                KIORI Exec Gojo · Островок
                <small>В ссылке старое название WBF</small>
              </TableCell>
              <TableCell>30 746 ₽ + ¥1 600</TableCell>
              <TableCell>
                {expired
                  ? 'Промокод истёк'
                  : '28 594 ₽ + ¥1 600 с ТЕПЛО · расчёт'}
              </TableCell>
              <TableCell>
                <Link url="https://ostrovok.ru/hotel/japan/kyoto/mid9172051/hotel_wbf_kyoto_horikawa_gojo/?dates=01.11.2026-05.11.2026&guests=2">
                  Островок
                </Link>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <p className="form-hint">
          У KIORI описания комнат отличаются: 17–19 м² на Trip.com и 23 м² на
          Островке. Сравнение не полностью равнозначно. У Horidome небольшая
          кровать semi-double: на другом сервисе указано 110–120 см. До оплаты
          проверьте, подходит ли вам размер.
        </p>
      </section>
      <div className="savings-grid">
        <section className="saving-card">
          <p className="eyebrow">Промокоды · условия проверки</p>
          <h3>
            {expired
              ? 'Акция Островка завершилась'
              : 'Островок — до 10 сентября'}
          </h3>
          <p>
            <strong>ТЕПЛО</strong> — 7%; <strong>МОРЕ</strong> — 2 000 ₽ от 25
            000 ₽; <strong>ГОРЫ</strong> — 1 000 ₽ от 10 000 ₽;{' '}
            <strong>МЕЧТА</strong> — 5 000 ₽ от 50 000 ₽.
          </p>
          <p>
            На оплате к этим бронированиям коды не применялись. Нужны вход в
            аккаунт и подходящие условия тарифа. Скидки не суммируем; в бюджет
            не вычитаем до подтверждения.
          </p>
          <Link url="https://blog.ostrovok.ru/promokody-ostrovka/">
            Актуальные коды Островка
          </Link>
        </section>
        <section className="saving-card">
          <p className="eyebrow">Ещё где проверить</p>
          <h3>Персональная скидка может помочь</h3>
          <p>
            <Link url="https://www.onetwotrip.com/ru/loyalty/promocode/">
              OneTwoTrip
            </Link>{' '}
            — персональные промокоды после входа. Подтверждённого общего кода на
            Японию не найдено.
          </p>
          <p>
            <Link url="https://travel.yandex.ru/wow/promo/offers/">
              Акции Яндекс Путешествий
            </Link>{' '}
            — сравнивайте итог к оплате. Баллы и трипкоины не уменьшают
            стоимость этой поездки автоматически.
          </p>
          <p>
            Для{' '}
            <Link url="https://ostrovok.ru/hotel/japan/naha/mid9964076/mrkinjo_in_miegusuku/?dates=22.10.2026-25.10.2026&guests=2">
              Mr.KINJO
            </Link>{' '}
            и{' '}
            <Link url="https://ostrovok.ru/hotel/japan/osaka/mid13635135/nippori_osaka_nishitengachaya_guesthousexi_tian_xia_cha_wu_ahatomento/?dates=28.10.2026-01.11.2026&guests=2">
              nippori
            </Link>{' '}
            есть страницы Островка. Финальная цена на эти даты не подтверждена.
          </p>
        </section>
      </div>
      <section className="method-note">
        <h3>Где доплата действительно чувствуется</h3>
        <p>
          <Link url="https://ru.trip.com/hotels/naha-hotel-detail-711296/smile-hotel-okinawa-naha/?checkin=2026-10-22&checkout=2026-10-25&adult=2&crn=1&curr=RUB">
            Smile Hotel Okinawa Naha
          </Link>{' '}
          — 15 431 ₽ за 22–25 октября, примерно +3 333 ₽. Удобнее для парома:
          рядом с портом Tomari. Тариф и свободный номер перепроверьте.
        </p>
        <p>
          Обратно проверялся вариант Qatar на 10 ноября за 83 728 ₽ на двоих: в
          пути около 27 ч 50 мин вместо 39 ч 05 мин. Доплата около 9 066 ₽, цена
          была в выдаче, не на последнем шаге. Это кандидат на доплату за более
          короткую дорогу.
        </p>
        <p>
          Не стоит менять центральнее расположенный Киото ради неподтверждённой
          экономии в 2–3 тысячи: дорога может её съесть. Главный потенциал
          большой экономии остаётся в международных рейсах при сдвиге дат;
          промокоды на отели не сократят весь бюджет вдвое.
        </p>
      </section>
      <section className="method-note">
        <h3>Можно ли всё купить через Trip.com?</h3>
        <p>
          Перелёты, отели, Universal, Warner Bros., Shibuya Sky и часть
          железнодорожных билетов — да, при наличии нужной даты и тарифа. Ссылка
          на достопримечательность ведёт к выбору билета, а не к уже подобранной
          корзине.
        </p>
        <p>
          Паром Токасики — у перевозчика; Наруто — по официальной ссылке; онсэн,
          храмы и обычный городской транспорт часто удобнее оплачивать на месте.
          В карточке можно сохранить ссылку другого продавца и реальную сумму
          покупки.
        </p>
      </section>
    </>
  );
}
