import test from 'node:test';
import assert from 'node:assert/strict';
import { onsenVisitCost } from '../app/kawaguchiko-onsen-cost';
import {
  kawaHotels,
  kawaBaths,
  kawaPairs,
  kawaYenRate,
} from '../app/kawaguchiko-onsen-data';

test('Royal guests are not charged day admission again; outsiders pay for two', () => {
  const royal = kawaHotels.find((h) => h.id === 'royal')!;
  const kaiun = kawaBaths.find((b) => b.id === 'kaiun')!;
  const resident = kawaPairs.find(
    (p) => p.hotelId === 'royal' && p.bathId === 'kaiun',
  )!;
  const guest = onsenVisitCost(
    royal.priceRub,
    kaiun.entryYen,
    resident,
    kawaYenRate,
  );
  assert.equal(guest.admissionYen, 0);
  assert.equal(guest.totalRub, royal.priceRub);
  const visitor = kawaPairs.find(
    (p) => p.hotelId === 'kashiwaya' && p.bathId === 'kaiun',
  )!;
  assert.equal(
    onsenVisitCost(6735.45, kaiun.entryYen, visitor, kawaYenRate).admissionYen,
    2000,
  );
});

test('missing fare or lodging is never presented as a complete cheap total', () => {
  assert.equal(
    onsenVisitCost(10000, 1200, undefined, kawaYenRate).totalRub,
    null,
  );
  assert.equal(
    onsenVisitCost(10000, 1200, { transportYenForTwo: null }, kawaYenRate)
      .totalRub,
    null,
  );
  const knownVisit = onsenVisitCost(
    null,
    1200,
    { transportYenForTwo: 0 },
    kawaYenRate,
  );
  assert.equal(knownVisit.totalRub, null);
  assert.equal(knownVisit.visitYen, 2400);
});

test('Kashiwaya cheap quote retains its different date in booking and visible label', () => {
  const hotel = kawaHotels.find((h) => h.id === 'kashiwaya')!;
  const url = new URL(hotel.bookingUrl);
  assert.equal(url.searchParams.get('checkin'), '2026-11-06');
  assert.equal(url.searchParams.get('checkout'), '2026-11-07');
  assert.match(hotel.priceLabel, /6–7 ноября/);
  assert.match(hotel.priceLabel, /ДРУГАЯ НОЧЬ/);
  for (const current of kawaHotels.filter((h) => h.id !== 'kashiwaya')) {
    assert.equal(
      new URL(current.bookingUrl).searchParams.get('checkin'),
      '2026-11-05',
    );
  }
});

test('each hotel has one distinct journey to every bath, with walking fares zero', () => {
  for (const hotel of kawaHotels)
    for (const bath of kawaBaths) {
      const pairs = kawaPairs.filter(
        (p) => p.hotelId === hotel.id && p.bathId === bath.id,
      );
      assert.equal(pairs.length, 1);
      if (pairs[0].mode === 'walking') {
        assert.equal(pairs[0].transportYenForTwo, 0);
        assert.notEqual(pairs[0].walkKm, null);
      }
    }
});
