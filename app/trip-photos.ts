import catalog from './photo-catalog.json';
import type { RouteDay, RouteStop } from './route-data';

export type PlacePhoto = {
  key: string;
  label: string;
  src: string;
  sourceUrl: string;
  author: string;
  license: string;
  licenseUrl: string;
  position?: string;
  width: number;
  height: number;
};
export const placePhotos: PlacePhoto[] = catalog;
export const photoByKey = (key: string) =>
  placePhotos.find((p) => p.key === key);
const matches: [RegExp, string][] = [
  [/warner.*studio.*tokyo/i, 'warner'],
  [/american village/i, 'american-village'],
  [/zakimi.*castle|zakimi.gusuku/i, 'zakimi'],
  [/shurijo|shureimon/i, 'shuri'],
  [/aharen/i, 'aharen'],
  [/emerald beach/i, 'emerald'],
  [/churaumi/i, 'churaumi'],
  [/kokusai/i, 'naha'],
  [/dotonbori/i, 'dotonbori'],
  [/universal studios/i, 'usj'],
  [/naruto boruto|shinobi zato/i, 'naruto'],
  [/nara park/i, 'nara'],
  [/todai-ji/i, 'todaiji'],
  [/kiyomizu/i, 'kiyomizu'],
  [/fushimi inari/i, 'fushimi'],
  [/arashiyama bamboo/i, 'arashiyama'],
  [/kinkaku/i, 'kinkakuji'],
  [/ninenzaka/i, 'gion'],
  [/okunoin/i, 'koyasan'],
  [/hiroshima peace memorial park/i, 'hiroshima'],
  [/itsukushima/i, 'miyajima'],
  [/oishi park|funatsu hama/i, 'fuji'],
  [/owakudani/i, 'owakudani'],
  [/hakone shrine|moto hakone port/i, 'hakone'],
  [/kotoku-in/i, 'kamakura'],
  [/enoshima island/i, 'enoshima'],
  [/senso-ji/i, 'sensoji'],
  [/shibuya scramble/i, 'shibuya'],
  [/shinjuku/i, 'shinjuku'],
  [/meiji jingu/i, 'meiji'],
  [/ueno park/i, 'ueno'],
];
export function photoForStop(s: RouteStop) {
  const match = matches.find(([re]) => re.test(s.query));
  return match ? photoByKey(match[1]) : undefined;
}
export function photoForDay(d: RouteDay) {
  const main = d.stops.filter((s) => s.kind === 'main');
  const exact = main.map(photoForStop).find(Boolean);
  if (exact) return exact;
  const city = d.city;
  const key = /Йомитан|Ёмитан/.test(city)
    ? 'zakimi'
    : /Тятан|Чатан|Американская деревня/.test(city)
      ? 'american-village'
      : /Наха/.test(city)
        ? 'naha'
        : /Онна/.test(city)
          ? 'onna'
          : /Хиросима/.test(city)
            ? 'hiroshima'
            : /Миядзима/.test(city)
              ? 'miyajima'
              : /Хаконе/.test(city)
                ? 'hakone'
                : /Фудзи|Кавагутико/.test(city)
                  ? 'fuji'
                  : /Киото/.test(city)
                    ? 'gion'
                    : /Камакура/.test(city)
                      ? 'kamakura'
                      : /Коясан/.test(city)
                        ? 'koyasan'
                        : /Осака/.test(city)
                          ? 'dotonbori'
                          : 'shibuya';
  return photoByKey(key) || d.stops.map(photoForStop).find(Boolean);
}
export const variantPhotoKeys: Record<string, string> = {
  'night-bus': 'fuji',
  koyasan: 'koyasan',
  kamakura: 'kamakura',
  hiroshima: 'miyajima',
  hakone: 'hakone',
};

export const storySeconds = 6;
export function storyDuration(day: RouteDay) {
  return day.stops.length * storySeconds;
}
export function nextRandomDay(
  length: number,
  current: number,
  random = Math.random(),
) {
  if (length < 2) return 0;
  const value = Math.min(
    length - 2,
    Math.floor(Math.max(0, random) * (length - 1)),
  );
  return value >= current ? value + 1 : value;
}
