import { test } from 'node:test';
import assert from 'node:assert/strict';
import { baseRouteDays } from '../app/base-route-days';
import { purchases, legacyPurchases } from '../app/trip-data';
import { routeDays } from '../app/route-data';
import { bookedHotels } from '../app/main-bookings';
import {
  mainKawaHotels,
  mainKawaBaths,
  mainKawaPairs,
  kawaYenRate,
} from '../app/kawaguchiko-onsen-data';
import { onsenVisitCost } from '../app/kawaguchiko-onsen-cost';

test('main route keeps all dates and every booking link points to an existing budget slot', () => {
  assert.equal(baseRouteDays.length, 20);
  assert.equal(new Set(baseRouteDays.map((d) => d.date)).size, 20);
  assert.equal(new Set(purchases.map((p) => p.id)).size, purchases.length);
  baseRouteDays.forEach((day, index) => {
    assert.equal(
      Date.parse(day.date),
      Date.parse('2026-10-22') + index * 86400000,
    );
    for (const stop of day.stops) {
      for (const id of stop.purchaseIds ?? [])
        assert.ok(
          purchases.some((p) => p.id === id),
          `${day.date}: ${id}`,
        );
    }
  });
});

test('main Fuji night is Yamagishi with check-in before the included onsen', () => {
  const day = baseRouteDays.find((d) => d.date === '2026-11-05')!;
  assert.match(day.hotel, /Yamagishi/);
  const checkin = day.stops.findIndex((s) => s.purchaseIds?.includes('h-fuji'));
  const onsen = day.stops.findIndex((s) => s.purchaseIds?.includes('p-yurari'));
  assert.ok(checkin >= 0 && onsen > checkin);
  assert.equal(day.stops[checkin].query, day.stops[onsen].query);
  assert.match(
    baseRouteDays.find((d) => d.date === '2026-11-06')!.origin,
    /Yamagishi/,
  );
  const hotel = purchases.find((p) => p.id === 'h-fuji')!;
  const url = new URL(hotel.link!);
  assert.equal(url.searchParams.get('checkin'), '2026-11-05');
  assert.equal(url.searchParams.get('checkout'), '2026-11-06');
  assert.equal(url.searchParams.get('adult'), '2');
  assert.equal(purchases.find((p) => p.id === 'p-yurari')!.price, 0);
  const bath = mainKawaBaths.find((b) => b.id === 'yamagishi-onsen')!;
  const cost = onsenVisitCost(
    mainKawaHotels[0].priceRub,
    bath.entryYen,
    mainKawaPairs.find((p) => p.bathId === bath.id),
    kawaYenRate,
  );
  assert.equal(cost.totalRub, hotel.price);
});

test('main Okinawa uses Chatan and replaces the aquarium with Yomitan', () => {
  for (const date of ['2026-10-25', '2026-10-26', '2026-10-27']) {
    assert.match(baseRouteDays.find((d) => d.date === date)!.hotel, /Luana/);
  }
  const yomitan = baseRouteDays.find((d) => d.date === '2026-10-26')!;
  assert.ok(yomitan.stops.some((s) => /Zakimi/i.test(s.query)));
  assert.ok(yomitan.stops.some((s) => /Yachimun/i.test(s.query)));
  assert.equal(purchases.find((p) => p.id === 'p-churaumi')!.price, 0);
  const visible = JSON.stringify(
    baseRouteDays.map(({ title, hotel, origin, note, stops }) => ({
      title,
      hotel,
      origin,
      note,
      stops: stops.map(({ title, query, detail }) => ({
        title,
        query,
        detail,
      })),
    })),
  );
  assert.doesNotMatch(
    visible,
    /Toyoko Inn Fuji|Fuji Yurari|Kalakaua|Churaumi|Terrace|MIEGUSUKU|nippori/i,
  );
});

test('confirmed hotel identities and links change without changing original budget amounts', () => {
  const expected = [
    [
      'h-transit',
      bookedHotels.transit,
      '109847341',
      '2026-10-21',
      '2026-10-22',
      3026.69,
    ],
    [
      'h-naha',
      bookedHotels.naha,
      '3053374',
      '2026-10-22',
      '2026-10-25',
      12097.56,
    ],
    [
      'h-onna',
      bookedHotels.chatan,
      '13911923',
      '2026-10-25',
      '2026-10-28',
      17790.3,
    ],
    [
      'h-osaka',
      bookedHotels.osaka,
      '124190940',
      '2026-10-28',
      '2026-11-01',
      9939.34,
    ],
  ] as const;
  for (const [id, hotel, hotelId, from, to, price] of expected) {
    const purchase = purchases.find((p) => p.id === id)!;
    assert.equal(purchase.title, hotel.title);
    assert.equal(purchase.price, price);
    const url = new URL(purchase.link!);
    assert.equal(url.searchParams.get('hotelId'), hotelId);
    assert.equal(url.searchParams.get('checkIn'), from);
    assert.equal(url.searchParams.get('checkOut'), to);
    assert.equal(url.searchParams.get('adult'), '2');
    assert.equal(url.searchParams.get('crn'), '1');
  }
  assert.equal(
    Math.round(purchases.reduce((sum, p) => sum + p.price, 0) * 100),
    43143811,
  );
  assert.match(
    legacyPurchases.find((p) => p.id === 'h-naha')!.title,
    /MIEGUSUKU/,
  );
  assert.match(
    routeDays.find((d) => d.date === '2026-10-29')!.origin,
    /nippori/,
  );
});

test('confirmed arrivals and hotel departures propagate into the main daily maps', () => {
  const arrival = baseRouteDays.find((d) => d.date === '2026-10-22')!;
  assert.equal(arrival.stops[0].time, '18:05–19:15');
  assert.match(arrival.stops[0].detail, /UO844/);
  assert.equal(
    arrival.stops.find((s) => s.purchaseIds?.includes('h-naha'))!.query,
    bookedHotels.naha.query,
  );
  assert.equal(
    baseRouteDays.find((d) => d.date === '2026-10-25')!.origin,
    bookedHotels.naha.query,
  );
  assert.equal(
    baseRouteDays.find((d) => d.date === '2026-10-28')!.origin,
    bookedHotels.chatan.query,
  );
  for (const date of ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01'])
    assert.equal(
      baseRouteDays.find((d) => d.date === date)!.origin,
      bookedHotels.osaka.query,
    );
  assert.match(
    baseRouteDays.find((d) => d.date === '2026-11-01')!.stops[0].detail,
    /до 10:00/,
  );
  assert.match(purchases.find((p) => p.id === 'f-moscow')!.note, /38 ч 05 мин/);
  assert.doesNotMatch(
    purchases.find((p) => p.id === 'f-osaka')!.note,
    /без сдаваемого багажа/,
  );
});

test('Warner is scheduled on its quoted open date without a duplicate subway budget', () => {
  const visits = baseRouteDays.flatMap((d) =>
    d.stops
      .filter((s) => s.purchaseIds?.includes('p-warner'))
      .map((s) => ({ date: d.date, stop: s })),
  );
  assert.equal(visits.length, 1);
  assert.equal(visits[0].date, '2026-11-08');
  assert.match(visits[0].stop.time, /^10:00/);
  assert.equal(
    purchases.find((p) => p.id === 'p-warner')!.price,
    Math.round(13200 * kawaYenRate),
  );
  assert.equal(
    purchases.filter(
      (p) =>
        p.category === 'transport' &&
        p.city === 'Токио' &&
        /72 часа/.test(p.title),
    ).length,
    1,
  );
  assert.equal(purchases.find((p) => p.id === 'p-sky')!.date, '9 ноября');
  assert.ok(
    baseRouteDays
      .find((d) => d.date === '2026-11-09')!
      .stops.some((s) => s.purchaseIds?.includes('p-sky')),
  );
});
