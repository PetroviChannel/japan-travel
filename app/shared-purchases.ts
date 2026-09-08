import { cloudConfig } from './cloud-config';
import {
  loadLocalPurchases,
  saveLocalPurchase,
  makeBackup,
  parseBackup,
  mergeBackup,
  storageKey,
  type BudgetBackup,
} from './local-purchases';
import { validatePurchase, type SavedPurchase } from './purchase-state';
export type Connection = { room: string; secret: string };
export type Snapshot = {
  room: string | null;
  revision: number;
  purchases: Record<string, SavedPurchase>;
  conflict?: boolean;
};
export const sharedConnectionKey = 'tabi:japan-2026:connection-v1';
const connectionKey = sharedConnectionKey;
export const cloudReady = Boolean(
  cloudConfig.url && cloudConfig.publishableKey,
);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const secretPattern = /^[0-9a-f]{64}$/i;
function validConnection(value: unknown): value is Connection {
  if (!value || typeof value !== 'object') return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.room === 'string' &&
    uuid.test(c.room) &&
    typeof c.secret === 'string' &&
    secretPattern.test(c.secret)
  );
}
export function getConnection(): Connection | null {
  const raw = localStorage.getItem(connectionKey);
  if (!raw) return null;
  try {
    const c = JSON.parse(raw);
    if (validConnection(c)) return c;
  } catch {}
  throw new Error(
    'Не удалось прочитать подключение. Откройте личную ссылку поездки заново.',
  );
}
export function captureConnectionLink() {
  const url = new URL(window.location.href),
    hash = new URLSearchParams(url.hash.slice(1));
  if (!hash.has('trip') && !hash.has('key')) return;
  const c = { room: hash.get('trip'), secret: hash.get('key') };
  if (!validConnection(c))
    throw new Error(
      'Личная ссылка неполная. Скопируйте её заново на первом устройстве.',
    );
  return c;
}
export function connectionLink(c = getConnection()) {
  if (!c) throw new Error('Сначала создайте общий бюджет');
  const url = new URL(window.location.href);
  url.search = '?tab=purchases';
  url.hash = new URLSearchParams({ trip: c.room, key: c.secret }).toString();
  return url.toString();
}
function snapshot(value: unknown): Snapshot {
  if (!value || typeof value !== 'object')
    throw new Error('База вернула неверный ответ');
  const v = value as Record<string, unknown>;
  if (
    typeof v.room !== 'string' ||
    !uuid.test(v.room) ||
    typeof v.revision !== 'number' ||
    !Number.isInteger(v.revision) ||
    !v.purchases ||
    typeof v.purchases !== 'object' ||
    Array.isArray(v.purchases)
  )
    throw new Error('База вернула неверные данные');
  const parsed = parseBackup(
    JSON.stringify({
      version: 1,
      trip: 'japan-2026',
      purchases: Object.values(v.purchases),
    }),
  );
  return {
    room: v.room,
    revision: v.revision,
    purchases: Object.fromEntries(parsed.purchases.map((p) => [p.id, p])),
    conflict: v.conflict === true,
  };
}
async function rpc(name: string, args: object): Promise<Snapshot> {
  if (!cloudReady) throw new Error('Общая база ещё не подключена');
  const controller = new AbortController(),
    timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(cloudConfig.url + '/rest/v1/rpc/' + name, {
      method: 'POST',
      headers: {
        apikey: cloudConfig.publishableKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
      signal: controller.signal,
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      if (
        response.status === 401 ||
        response.status === 403 ||
        body.message === 'Access denied'
      )
        throw new Error(
          'Нет доступа к общему бюджету. Проверьте личную ссылку поездки.',
        );
      throw new Error(
        'База временно недоступна. Изменение не сохранено — повторите попытку.',
      );
    }
    return snapshot(await response.json());
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError')
      throw new Error(
        'Нет ответа от базы. Проверьте интернет и повторите попытку.',
      );
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}
function sameConnection(a: Connection | null, b: Connection | null) {
  return a?.room === b?.room && a?.secret === b?.secret;
}
function connectionChanged() {
  return new Error(
    'Подключение к общему бюджету изменилось. Проверьте выбранную поездку и повторите действие.',
  );
}
function requireConnection(c: Connection) {
  if (!sameConnection(c, getConnection())) throw connectionChanged();
}
function requireRoom(s: Snapshot, c: Connection) {
  if (s.room !== c.room) throw new Error('База вернула другую поездку');
}
function cache(s: Snapshot, c: Connection) {
  try {
    if (s.room !== c.room || !sameConnection(c, getConnection())) return;
    const next = {
      ...makeBackup(s.purchases),
      cloudRoom: s.room,
      cloudRevision: s.revision,
    };
    let previous: Record<string, unknown> | null = null;
    try {
      previous = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
    } catch {
      // A successful cloud read can repair a malformed local cache.
    }
    if (
      previous?.cloudRoom === s.room &&
      typeof previous.cloudRevision === 'number' &&
      Number.isSafeInteger(previous.cloudRevision) &&
      previous.cloudRevision >= s.revision
    )
      return;
    localStorage.setItem(storageKey, JSON.stringify(next));
  } catch {
    /* Cloud writes remain authoritative when the local cache is full. */
  }
}
export async function readPurchases(): Promise<Snapshot> {
  const incoming = captureConnectionLink(),
    previousConnection = incoming ? localStorage.getItem(connectionKey) : null;
  const c = incoming ?? getConnection();
  if (!c) return { room: null, revision: 0, purchases: loadLocalPurchases() };
  const result = await rpc('trip_read', { p_room: c.room, p_secret: c.secret });
  requireRoom(result, c);
  if (incoming) {
    const currentIncoming = captureConnectionLink();
    if (currentIncoming) {
      if (
        !sameConnection(incoming, currentIncoming) ||
        (localStorage.getItem(connectionKey) !== previousConnection &&
          !sameConnection(incoming, getConnection()))
      )
        throw connectionChanged();
      localStorage.setItem(connectionKey, JSON.stringify(incoming));
      const url = new URL(window.location.href);
      url.hash = '';
      window.history.replaceState(null, '', url);
    } else {
      // Another read may already have consumed this link. A delayed response
      // must never reconnect a device that has since disconnected or switched.
      requireConnection(incoming);
    }
  }
  cache(result, c);
  return result;
}
async function saveConnectedPurchase(
  input: SavedPurchase,
  c: Connection,
): Promise<Snapshot> {
  requireConnection(c);
  const result = await rpc('trip_save', {
    p_room: c.room,
    p_secret: c.secret,
    p_purchase: validatePurchase(input),
    p_expected_updated_at: input.updatedAt,
  });
  requireConnection(c);
  requireRoom(result, c);
  cache(result, c);
  return result;
}
export async function savePurchase(input: SavedPurchase): Promise<Snapshot> {
  const c = getConnection();
  if (c) return saveConnectedPurchase(input, c);
  const result = saveLocalPurchase(input);
  return { room: null, revision: 0, purchases: result.records };
}
export async function createSharedTrip(records: Record<string, SavedPurchase>) {
  const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)), (v) =>
    v.toString(16).padStart(2, '0'),
  ).join('');
  const result = await rpc('trip_create', {
    p_secret: secret,
    p_purchases: records,
  });
  localStorage.setItem(
    connectionKey,
    JSON.stringify({ room: result.room, secret }),
  );
  cache(result, { room: result.room!, secret });
  return result;
}
export function disconnectSharedTrip() {
  localStorage.removeItem(connectionKey);
}
export async function importSharedBackup(backup: BudgetBackup) {
  const checked = parseBackup(JSON.stringify(backup)),
    c = getConnection();
  if (!c) return mergeBackup(checked);
  requireConnection(c);
  let state = await rpc('trip_read', { p_room: c.room, p_secret: c.secret }),
    changed = 0;
  requireConnection(c);
  requireRoom(state, c);
  cache(state, c);
  for (const row of checked.purchases) {
    requireConnection(c);
    const current = state.purchases[row.id];
    if (row.updatedAt > (current?.updatedAt ?? 0)) {
      state = await saveConnectedPurchase(
        { ...row, updatedAt: current?.updatedAt ?? 0 },
        c,
      );
      if (state.conflict)
        throw new Error(
          'Покупка изменилась на другом телефоне. Часть записей уже перенесена; проверьте суммы и повторите импорт.',
        );
      changed++;
    }
  }
  return { records: state.purchases, changed };
}
