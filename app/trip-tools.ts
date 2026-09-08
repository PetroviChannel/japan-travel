import { purchases } from './trip-data';
import { routeDays, mapDirections, mapSearch } from './route-data';
import { tripVariants, costTotal } from './variant-data';
import {
  summarize,
  validatePurchase,
  type SavedPurchase,
} from './purchase-state';
type Tool = {
  name: string;
  title: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => unknown | Promise<unknown>;
};
type ModelDocument = Document & {
  modelContext?: {
    registerTool: (
      tool: Tool,
      options: { signal: AbortSignal },
    ) => void | Promise<void>;
  };
};
export function registerTripTools(
  read: () => Record<string, SavedPurchase>,
  save: (r: SavedPurchase) => Promise<SavedPurchase>,
) {
  const context = (document as ModelDocument).modelContext;
  if (!context?.registerTool) return;
  const lifecycle = new AbortController();
  const tools: Tool[] = [
    {
      name: 'read_trip_alternatives',
      title: 'Сравнить пять вариантов поездки',
      description:
        'Читает расчётные сметы альтернатив, источники и маршруты. Без variant возвращает сравнение. С variant — всю смету и дни, с date — один маршрут. Не меняет основной план и не проверяет наличие у продавцов.',
      inputSchema: {
        type: 'object',
        properties: {
          variant: { type: 'string', enum: tripVariants.map((v) => v.id) },
          date: { type: 'string', enum: routeDays.map((d) => d.date) },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute(input) {
        if (!input || typeof input !== 'object' || Array.isArray(input))
          throw new Error('Ожидается объект');
        const v = input as Record<string, unknown>;
        if (Object.keys(v).some((k) => !['variant', 'date'].includes(k)))
          throw new Error('Неизвестное поле');
        if (v.variant === undefined) {
          if (v.date !== undefined) throw new Error('Для даты укажите вариант');
          return {
            people: 2,
            currency: 'RUB',
            priceStatus: 'estimated, not live availability',
            variants: tripVariants.map((r) => ({
              id: r.id,
              title: r.title,
              total: costTotal(r.costs),
              tradeoff: r.tradeoff,
            })),
          };
        }
        const variant = tripVariants.find((r) => r.id === v.variant);
        if (!variant) throw new Error('Неизвестный вариант');
        if (v.date === undefined)
          return { ...variant, total: costTotal(variant.costs) };
        const day = variant.days.find((d) => d.date === v.date);
        if (!day) throw new Error('Нет маршрута на эту дату');
        return {
          ...day,
          timezone: 'Asia/Tokyo',
          stops: day.stops.map((s, i) => ({
            ...s,
            map: mapSearch(s.query),
            directions:
              s.mode === 'none'
                ? null
                : mapDirections(
                    i ? day.stops[i - 1].query : day.origin,
                    s.query,
                    s.mode,
                  ),
          })),
        };
      },
    },
    {
      name: 'read_daily_route',
      title: 'Прочитать маршрут и тайминги',
      description:
        'Без даты возвращает список дней поездки. С датой возвращает маршрут, плановое время, опубликованные расписания и ссылки Google Maps. Не проверяет движение транспорта в реальном времени.',
      inputSchema: {
        type: 'object',
        properties: {
          date: { type: 'string', enum: routeDays.map((d) => d.date) },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute(input) {
        if (!input || typeof input !== 'object' || Array.isArray(input))
          throw new Error('Ожидается объект с датой или пустой объект');
        const value = input as Record<string, unknown>;
        if (Object.keys(value).some((k) => k !== 'date'))
          throw new Error('Неизвестное поле');
        if (value.date === undefined)
          return {
            days: routeDays.map((d) => ({
              date: d.date,
              city: d.city,
              title: d.title,
            })),
          };
        const day = routeDays.find((d) => d.date === value.date);
        if (!day) throw new Error('Нет маршрута на эту дату');
        return {
          ...day,
          timezone: 'Asia/Tokyo',
          stops: day.stops.map((s, i) => ({
            ...s,
            map: mapSearch(s.query),
            directions:
              s.mode === 'none'
                ? null
                : mapDirections(
                    i === 0 ? day.origin : day.stops[i - 1].query,
                    s.query,
                    s.mode,
                  ),
          })),
        };
      },
    },
    {
      name: 'read_trip_budget',
      title: 'Прочитать бюджет Японии',
      description:
        'Читает сохранённые суммы, ручные отметки об оплате и ссылки. Не проверяет цены продавцов.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute(input) {
        if (
          !input ||
          typeof input !== 'object' ||
          Array.isArray(input) ||
          Object.keys(input).length
        )
          throw new Error('Ожидается пустой объект');
        const values = read();
        return {
          currency: 'RUB',
          people: 2,
          summary: summarize(Object.values(values)),
          purchases: purchases.map((p) => ({
            ...values[p.id],
            title: p.title,
            url: values[p.id].customUrl || p.link || null,
          })),
        };
      },
    },
    {
      name: 'update_purchase_record',
      title: 'Изменить запись о расходе',
      description:
        'Сохраняет цену, ручную отметку об оплате, промокод или заметку в этой поездке. Не бронирует и не оплачивает билеты или отели.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          paid: { type: 'boolean' },
          plan: { type: 'number', minimum: 0, maximum: 10000000 },
          actual: { type: ['number', 'null'], minimum: 0, maximum: 10000000 },
          coupon: { type: 'string', maxLength: 100 },
          note: { type: 'string', maxLength: 2000 },
          customUrl: { type: 'string', maxLength: 2000 },
        },
        required: ['id'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      async execute(input) {
        if (!input || typeof input !== 'object' || Array.isArray(input))
          throw new Error('Неверные данные');
        const value = input as Record<string, unknown>;
        if (
          Object.keys(value).some(
            (k) =>
              ![
                'id',
                'paid',
                'plan',
                'actual',
                'coupon',
                'note',
                'customUrl',
              ].includes(k),
          )
        )
          throw new Error('Неизвестное поле');
        const current = read();
        if (typeof value.id !== 'string' || !current[value.id])
          throw new Error('Покупка не найдена');
        const result = await save({
          ...validatePurchase({ ...current[value.id], ...value }),
          updatedAt: current[value.id].updatedAt,
        });
        return { purchase: result, summary: summarize(Object.values(read())) };
      },
    },
  ];
  for (const tool of tools) {
    try {
      void Promise.resolve(
        context.registerTool(tool, { signal: lifecycle.signal }),
      ).catch((e) => console.warn('Trip tool registration failed', e));
    } catch (e) {
      console.warn('Trip tool registration failed', e);
    }
  }
  return () => lifecycle.abort();
}
