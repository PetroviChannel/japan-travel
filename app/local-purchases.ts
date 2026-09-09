import { purchases } from './trip-data';
import {
  mergeCurrentDefaults,
  validatePurchase,
  type SavedPurchase,
} from './purchase-state';
export const storageKey = 'tabi:japan-2026:budget-v1';
export const defaultPurchases = () => mergeCurrentDefaults({});
export type BudgetBackup = {
  version: 1;
  trip: 'japan-2026';
  exportedAt: string;
  purchases: SavedPurchase[];
};
export function parseBackup(text: string): BudgetBackup {
  if (text.length > 1000000)
    throw new Error('Файл слишком большой: максимум 1 МБ');
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Не удалось прочитать JSON-файл');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data))
    throw new Error('Неверный формат файла');
  const v = data as Record<string, unknown>;
  if (
    v.version !== 1 ||
    v.trip !== 'japan-2026' ||
    !Array.isArray(v.purchases) ||
    v.purchases.length > purchases.length
  )
    throw new Error('Это не резервная копия бюджета Японии');
  const ids = new Set<string>();
  const rows = v.purchases.map((raw: unknown) => {
    const row = validatePurchase(raw),
      original = raw as Record<string, unknown>;
    if (ids.has(row.id)) throw new Error('В файле повторяются покупки');
    ids.add(row.id);
    if (
      typeof original.updatedAt !== 'number' ||
      !Number.isFinite(original.updatedAt) ||
      original.updatedAt < 0 ||
      original.updatedAt > Date.now() + 86400000
    )
      throw new Error('Неверная дата изменения покупки');
    return { ...row, updatedAt: original.updatedAt };
  });
  return {
    version: 1,
    trip: 'japan-2026',
    exportedAt: typeof v.exportedAt === 'string' ? v.exportedAt : '',
    purchases: rows,
  };
}
export function makeBackup(
  records: Record<string, SavedPurchase>,
): BudgetBackup {
  return {
    version: 1,
    trip: 'japan-2026',
    exportedAt: new Date().toISOString(),
    purchases: Object.values(records),
  };
}
export function loadLocalPurchases(
  storage: Pick<Storage, 'getItem'> = localStorage,
) {
  const next = defaultPurchases(),
    raw = storage.getItem(storageKey);
  if (raw) for (const row of parseBackup(raw).purchases) next[row.id] = row;
  return mergeCurrentDefaults(next);
}
function persist(
  records: Record<string, SavedPurchase>,
  storage: Pick<Storage, 'setItem'>,
) {
  try {
    storage.setItem(storageKey, JSON.stringify(makeBackup(records)));
  } catch {
    throw new Error(
      'Браузер не сохранил изменения. Проверьте доступ к хранилищу или освободите место.',
    );
  }
}
export function saveLocalPurchase(
  input: SavedPurchase,
  storage: Storage = localStorage,
) {
  const purchase = validatePurchase(input),
    records = loadLocalPurchases(storage);
  records[purchase.id] = purchase;
  persist(records, storage);
  return { purchase, records };
}
export function mergeBackup(
  backup: BudgetBackup,
  storage: Storage = localStorage,
) {
  const checked = parseBackup(JSON.stringify(backup)),
    records = loadLocalPurchases(storage);
  let changed = 0;
  for (const row of checked.purchases)
    if (row.updatedAt > records[row.id].updatedAt) {
      records[row.id] = row;
      changed++;
    }
  persist(records, storage);
  return { records, changed };
}
