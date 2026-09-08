import { purchases, type Purchase } from './trip-data';
export type SavedPurchase = {
  id: string;
  paid: boolean;
  plan: number;
  actual: number | null;
  coupon: string;
  note: string;
  customUrl: string;
  updatedAt: number;
};
export function initialState(p: Purchase): SavedPurchase {
  return {
    id: p.id,
    paid: false,
    plan: p.price,
    actual: null,
    coupon: '',
    note: '',
    customUrl: '',
    updatedAt: 0,
  };
}
export function validatePurchase(value: unknown): SavedPurchase {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Неверные данные покупки');
  const v = value as Record<string, unknown>;
  if (typeof v.id !== 'string' || !purchases.some((p) => p.id === v.id))
    throw new Error('Покупка не найдена');
  if (typeof v.paid !== 'boolean') throw new Error('Укажите статус покупки');
  function money(x: unknown): number {
    if (typeof x !== 'number' || !Number.isFinite(x) || x < 0 || x > 10000000)
      throw new Error('Сумма должна быть от 0 до 10 000 000 ₽');
    return Math.round(x * 100) / 100;
  }
  function text(x: unknown, max: number) {
    if (typeof x !== 'string' || x.length > max)
      throw new Error('Слишком длинная заметка или ссылка');
    return x.trim();
  }
  const customUrl = text(v.customUrl, 2000);
  if (customUrl) {
    let u: URL;
    try {
      u = new URL(customUrl);
    } catch {
      throw new Error('Введите полную ссылку на сайт');
    }
    if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password)
      throw new Error('Используйте обычную ссылку https://');
  }
  const plan = money(v.plan),
    actual = v.actual === null ? null : money(v.actual);
  return {
    id: v.id,
    paid: v.paid,
    plan,
    actual: v.paid && actual === null ? plan : actual,
    coupon: text(v.coupon, 100),
    note: text(v.note, 2000),
    customUrl,
    updatedAt: Date.now(),
  };
}
export function summarize(records: SavedPurchase[]) {
  const total = records.reduce((s, x) => s + (x.actual ?? x.plan), 0),
    planned = records.reduce((s, x) => s + x.plan, 0),
    paid = records.reduce((s, x) => s + (x.paid ? (x.actual ?? x.plan) : 0), 0);
  return {
    total,
    planned,
    paid,
    remaining: total - paid,
    count: records.filter((x) => x.paid).length,
  };
}
