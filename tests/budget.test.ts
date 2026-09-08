import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  defaultPurchases,
  loadLocalPurchases,
  saveLocalPurchase,
  makeBackup,
  parseBackup,
  mergeBackup,
} from '../app/local-purchases';
import { routeDays } from '../app/route-data';
import { tripVariants, costTotal } from '../app/variant-data';
import { placePhotos, photoForDay, nextRandomDay } from '../app/trip-photos';
class MemoryStorage implements Storage {
  data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
  clear() {
    this.data.clear();
  }
  key(i: number) {
    return [...this.data.keys()][i] ?? null;
  }
}
test('paid amounts survive reload and backup round trip', () => {
  const store = new MemoryStorage(),
    records = loadLocalPurchases(store),
    row = Object.values(records)[0];
  const saved = saveLocalPurchase(
    { ...row, paid: true, actual: 1234.56, note: 'Bought' },
    store,
  );
  assert.equal(loadLocalPurchases(store)[row.id].actual, 1234.56);
  assert.deepEqual(
    parseBackup(JSON.stringify(makeBackup(saved.records))).purchases,
    Object.values(saved.records),
  );
});
test('separate tabs editing different records do not discard each other', () => {
  const store = new MemoryStorage(),
    rows = Object.values(defaultPurchases());
  saveLocalPurchase({ ...rows[0], note: 'Phone one' }, store);
  saveLocalPurchase({ ...rows[1], note: 'Phone two' }, store);
  const result = loadLocalPurchases(store);
  assert.equal(result[rows[0].id].note, 'Phone one');
  assert.equal(result[rows[1].id].note, 'Phone two');
});
test('invalid import is rejected before storage writes', () => {
  const row = Object.values(defaultPurchases())[0];
  for (const bad of [
    { ...row, customUrl: 'javascript:alert(1)' },
    { ...row, plan: -1 },
    { ...row, paid: 'yes' },
    { ...row, id: '__proto__' },
  ])
    assert.throws(() =>
      parseBackup(
        JSON.stringify({ version: 1, trip: 'japan-2026', purchases: [bad] }),
      ),
    );
  assert.throws(() => parseBackup('{oops'));
  assert.throws(() =>
    parseBackup(
      JSON.stringify({ version: 1, trip: 'japan-2026', purchases: [row, row] }),
    ),
  );
});
test('older backup cannot replace a newer purchase', () => {
  const store = new MemoryStorage(),
    row = Object.values(defaultPurchases())[0];
  saveLocalPurchase({ ...row, note: 'New' }, store);
  const backup = makeBackup({
    [row.id]: { ...row, note: 'Old', updatedAt: 1 },
  });
  assert.equal(mergeBackup(backup, store).changed, 0);
  assert.equal(loadLocalPurchases(store)[row.id].note, 'New');
});
test('failed local storage never reports a successful save', () => {
  const store = new MemoryStorage();
  store.setItem = () => {
    throw new Error('Quota');
  };
  assert.throws(
    () => saveLocalPurchase(Object.values(defaultPurchases())[0], store),
    /Браузер не сохранил/,
  );
});
test('all six 20-day routes retain covers and real local image files', () => {
  assert.equal(placePhotos.length, 28);
  for (const p of placePhotos) {
    const bytes = readFileSync('public' + p.src);
    assert.equal(bytes[0], 255);
    assert.equal(bytes[1], 216);
    assert.ok(p.author && p.licenseUrl);
  }
  for (const days of [routeDays, ...tripVariants.map((v) => v.days)]) {
    assert.equal(days.length, 20);
    for (const d of days) assert.ok(photoForDay(d));
  }
  for (let current = 0; current < 20; current++)
    for (let sample = 0; sample <= 100; sample++) {
      const next = nextRandomDay(20, current, sample / 100);
      assert.ok(next >= 0 && next < 20 && next !== current);
    }
});
test('booking dates and trip totals preserved in Pages migration', () => {
  const lows = [401112.95, 423184.6, 434340.34, 441381.45, 430909.76];
  tripVariants.forEach((v, i) => {
    assert.equal(
      Math.round(costTotal(v.costs).low * 100),
      Math.round(lows[i] * 100),
    );
    for (const h of v.costs.filter((c) => c.category === 'hotel')) {
      const u = new URL(h.url!);
      assert.equal(u.hostname, 'ru.trip.com');
      assert.equal(u.searchParams.get('adult'), '2');
      assert.equal(
        u.searchParams.get('checkIn') || u.searchParams.get('checkin'),
        h.from,
      );
      assert.equal(
        u.searchParams.get('checkOut') || u.searchParams.get('checkout'),
        h.to,
      );
    }
  });
});
