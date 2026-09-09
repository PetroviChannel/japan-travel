import { after, afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { cloudConfig } from '../app/cloud-config';
import {
  defaultPurchases,
  loadLocalPurchases,
  makeBackup,
  storageKey,
} from '../app/local-purchases';
import type { Connection, Snapshot } from '../app/shared-purchases';

const originalConfig = { ...cloudConfig };
cloudConfig.url = 'https://budget.example.invalid';
cloudConfig.publishableKey = 'test-public-key';
const {
  readPurchases,
  savePurchase,
  importSharedBackup,
  disconnectSharedTrip,
  getConnection,
  sharedConnectionKey,
} = await import('../app/shared-purchases');

class MemoryStorage implements Storage {
  data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  clear() {
    this.data.clear();
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }
}
const first: Connection = {
  room: '00000000-0000-0000-0000-000000000001',
  secret: 'a'.repeat(64),
};
const second: Connection = {
  room: '00000000-0000-0000-0000-000000000002',
  secret: 'b'.repeat(64),
};
const originalFetch = globalThis.fetch;
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
const originalStorage = Object.getOwnPropertyDescriptor(
  globalThis,
  'localStorage',
);
let storage: MemoryStorage;
let location: { href: string };
beforeEach(() => {
  storage = new MemoryStorage();
  location = { href: 'https://example.invalid/travel/?tab=purchases' };
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: storage,
  });
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      location,
      history: {
        replaceState(_state: unknown, _title: string, url: string | URL) {
          location.href = String(url);
        },
      },
    },
  });
  globalThis.fetch = async () => {
    throw new Error('Unexpected request: all test requests must be mocked');
  };
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalWindow)
    Object.defineProperty(globalThis, 'window', originalWindow);
  else Reflect.deleteProperty(globalThis, 'window');
  if (originalStorage)
    Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else Reflect.deleteProperty(globalThis, 'localStorage');
});
after(() => Object.assign(cloudConfig, originalConfig));

function connect(c = first) {
  storage.setItem(sharedConnectionKey, JSON.stringify(c));
}
function reply(s: Snapshot) {
  return new Response(JSON.stringify(s), { status: 200 });
}
function pendingResponse() {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function stored() {
  return JSON.parse(storage.getItem(storageKey)!);
}

test('cloud reads refresh only untouched defaults without writes or new lock timestamps', async () => {
  connect();
  const defaults = defaultPurchases(),
    [seed, edited, missing] = Object.values(defaults),
    records = {
      [seed.id]: { ...seed, plan: seed.plan + 1000 },
      [edited.id]: {
        ...edited,
        plan: edited.plan + 1000,
        paid: true,
        actual: 1200,
        note: 'Already booked',
        updatedAt: 123,
      },
    };
  const requests: string[] = [];
  globalThis.fetch = async (url) => {
    requests.push(String(url));
    return reply({ room: first.room, revision: 4, purchases: records });
  };
  const result = await readPurchases();
  assert.deepEqual(result.purchases[seed.id], seed);
  assert.deepEqual(result.purchases[edited.id], records[edited.id]);
  assert.deepEqual(result.purchases[missing.id], missing);
  assert.equal(result.revision, 4);
  assert.deepEqual(requests, [cloudConfig.url + '/rest/v1/rpc/trip_read']);
  assert.equal(result.purchases[seed.id].updatedAt, 0);
});

test('an old poll cannot replace a newer saved budget in the local fallback', async () => {
  connect();
  const records = defaultPurchases(),
    row = Object.values(records)[0];
  const newer = {
    ...records,
    [row.id]: { ...row, note: 'Saved', updatedAt: 20 },
  };
  const delayed = pendingResponse();
  globalThis.fetch = async (url) =>
    String(url).endsWith('/trip_read')
      ? delayed.promise
      : reply({ room: first.room, revision: 2, purchases: newer });
  const reading = readPurchases();
  await savePurchase({ ...row, note: 'Saved' });
  delayed.resolve(reply({ room: first.room, revision: 1, purchases: records }));
  await reading;
  assert.equal(loadLocalPurchases()[row.id].note, 'Saved');
  assert.equal(stored().cloudRoom, first.room);
  assert.equal(stored().cloudRevision, 2);
});

test('an unchanged newer snapshot advances cache revision and repairs malformed storage', async () => {
  connect();
  storage.setItem(storageKey, '{invalid');
  const records = defaultPurchases();
  let revision = 1;
  globalThis.fetch = async () =>
    reply({ room: first.room, revision, purchases: records });
  await readPurchases();
  revision = 2;
  await readPurchases();
  assert.equal(stored().cloudRevision, 2);
  assert.deepEqual(loadLocalPurchases(), records);
});

test('a delayed cloud read cannot overwrite edits made after disconnect', async () => {
  connect();
  const records = defaultPurchases(),
    row = Object.values(records)[0];
  storage.setItem(storageKey, JSON.stringify(makeBackup(records)));
  const delayed = pendingResponse();
  globalThis.fetch = async () => delayed.promise;
  const reading = readPurchases();
  disconnectSharedTrip();
  await savePurchase({ ...row, note: 'Local after disconnect' });
  delayed.resolve(reply({ room: first.room, revision: 9, purchases: records }));
  await reading;
  assert.equal(getConnection(), null);
  assert.equal(loadLocalPurchases()[row.id].note, 'Local after disconnect');
});

test('a response from the previous room cannot replace the new room cache', async () => {
  connect();
  const records = defaultPurchases(),
    row = Object.values(records)[0];
  const delayed = pendingResponse();
  globalThis.fetch = async () => delayed.promise;
  const reading = readPurchases();
  connect(second);
  const secondRecords = {
    ...records,
    [row.id]: { ...row, note: 'Second room' },
  };
  storage.setItem(
    storageKey,
    JSON.stringify({
      ...makeBackup(secondRecords),
      cloudRoom: second.room,
      cloudRevision: 1,
    }),
  );
  delayed.resolve(
    reply({ room: first.room, revision: 99, purchases: records }),
  );
  await reading;
  assert.equal(stored().cloudRoom, second.room);
  assert.equal(loadLocalPurchases()[row.id].note, 'Second room');
});

test('a personal link is persisted and removed from the URL only after a successful read', async () => {
  connect(second);
  location.href += `#trip=${first.room}&key=${first.secret}`;
  const linkedUrl = location.href;
  globalThis.fetch = async () =>
    new Response('{"message":"Access denied"}', { status: 403 });
  await assert.rejects(readPurchases(), /Нет доступа/);
  assert.deepEqual(getConnection(), second);
  assert.equal(location.href, linkedUrl);
  globalThis.fetch = async () =>
    reply({ room: first.room, revision: 1, purchases: defaultPurchases() });
  await readPurchases();
  assert.deepEqual(getConnection(), first);
  assert.equal(new URL(location.href).hash, '');
  assert.equal(stored().cloudRoom, first.room);
});

test('a duplicate delayed link read cannot reconnect a disconnected device', async () => {
  location.href += `#trip=${first.room}&key=${first.secret}`;
  const delayed = pendingResponse();
  let requests = 0;
  const state = {
    room: first.room,
    revision: 1,
    purchases: defaultPurchases(),
  };
  globalThis.fetch = async () =>
    ++requests === 1 ? delayed.promise : reply(state);
  const oldRead = readPurchases();
  await readPurchases();
  disconnectSharedTrip();
  delayed.resolve(reply(state));
  await assert.rejects(oldRead, /Подключение.*изменилось/);
  assert.equal(getConnection(), null);
});

test('import restores timestamp-zero defaults and missing rows while preserving newer cloud edits', async () => {
  connect();
  const records = defaultPurchases(),
    [untouched, newer, absent] = Object.values(records);
  records[newer.id] = { ...newer, note: 'New cloud edit', updatedAt: 200 };
  delete records[absent.id];
  const backup = makeBackup({
    [untouched.id]: { ...untouched, note: 'Restored default', updatedAt: 100 },
    [newer.id]: { ...newer, note: 'Old backup', updatedAt: 100 },
    [absent.id]: { ...absent, note: 'Restored missing', updatedAt: 100 },
  });
  const writes: Record<string, unknown>[] = [];
  let revision = 1;
  globalThis.fetch = async (url, init) => {
    const args = JSON.parse(String(init?.body));
    assert.equal(args.p_room, first.room);
    assert.equal(args.p_secret, first.secret);
    if (String(url).endsWith('/trip_save')) {
      writes.push(args);
      assert.equal(args.p_expected_updated_at, 0);
      records[args.p_purchase.id] = {
        ...args.p_purchase,
        updatedAt: 300 + revision,
      };
      revision++;
    }
    return reply({ room: first.room, revision, purchases: records });
  };
  const result = await importSharedBackup(backup);
  assert.equal(result.changed, 2);
  assert.equal(writes.length, 2);
  assert.equal(result.records[untouched.id].note, 'Restored default');
  assert.equal(result.records[newer.id].note, 'New cloud edit');
  assert.equal(result.records[absent.id].note, 'Restored missing');
});

for (const switchTo of [null, second]) {
  test(`import stops after ${switchTo ? 'switching rooms' : 'disconnecting'} during a save`, async () => {
    connect();
    const records = defaultPurchases(),
      [one, two] = Object.values(records);
    const backup = makeBackup({
      [one.id]: { ...one, note: 'Import one', updatedAt: 100 },
      [two.id]: { ...two, note: 'Import two', updatedAt: 100 },
    });
    let writes = 0;
    globalThis.fetch = async (url, init) => {
      const args = JSON.parse(String(init?.body));
      assert.equal(args.p_room, first.room);
      if (String(url).endsWith('/trip_save')) {
        writes++;
        if (switchTo) connect(switchTo);
        else disconnectSharedTrip();
        records[one.id] = { ...one, note: 'Import one', updatedAt: 200 };
      }
      return reply({
        room: first.room,
        revision: writes + 1,
        purchases: records,
      });
    };
    await assert.rejects(importSharedBackup(backup), /Подключение.*изменилось/);
    assert.equal(writes, 1);
    assert.deepEqual(getConnection(), switchTo);
    assert.equal(loadLocalPurchases()[one.id].note, '');
    assert.equal(loadLocalPurchases()[two.id].note, '');
  });
}

test('import rejects a switched connection after reading before issuing any saves', async () => {
  connect();
  const records = defaultPurchases(),
    row = Object.values(records)[0];
  let writes = 0;
  globalThis.fetch = async (url) => {
    if (String(url).endsWith('/trip_save')) writes++;
    connect(second);
    return reply({ room: first.room, revision: 1, purchases: records });
  };
  await assert.rejects(
    importSharedBackup(
      makeBackup({
        [row.id]: { ...row, note: 'Import', updatedAt: 100 },
      }),
    ),
    /Подключение.*изменилось/,
  );
  assert.equal(writes, 0);
  assert.equal(storage.getItem(storageKey), null);
});

test('import reports a concurrent edit without sending later rows', async () => {
  connect();
  const records = defaultPurchases(),
    [one, two] = Object.values(records);
  let writes = 0;
  globalThis.fetch = async (url) => {
    const conflict = String(url).endsWith('/trip_save');
    if (conflict) {
      writes++;
      records[one.id] = { ...one, note: 'Other phone', updatedAt: 200 };
    }
    return reply({
      room: first.room,
      revision: conflict ? 2 : 1,
      purchases: records,
      conflict,
    });
  };
  await assert.rejects(
    importSharedBackup(
      makeBackup({
        [one.id]: { ...one, note: 'Import one', updatedAt: 100 },
        [two.id]: { ...two, note: 'Import two', updatedAt: 100 },
      }),
    ),
    /Покупка изменилась/,
  );
  assert.equal(writes, 1);
  assert.equal(loadLocalPurchases()[one.id].note, 'Other phone');
  assert.equal(loadLocalPurchases()[two.id].note, '');
});
