const amount = (n: number | null | undefined): n is number =>
  typeof n === 'number' && Number.isFinite(n) && n >= 0;

export function onsenVisitCost(
  hotelRub: number | null,
  adultEntryYen: number,
  pair:
    | { entryYenForTwo?: number; transportYenForTwo: number | null }
    | undefined,
  yenRate: number,
) {
  const admissionYen = amount(pair?.entryYenForTwo)
    ? pair.entryYenForTwo
    : amount(adultEntryYen)
      ? adultEntryYen * 2
      : null;
  const transportYen = amount(pair?.transportYenForTwo)
    ? pair.transportYenForTwo
    : null;
  const visitYen =
    admissionYen !== null && transportYen !== null
      ? admissionYen + transportYen
      : null;
  const visitRub =
    visitYen !== null && Number.isFinite(yenRate) && yenRate > 0
      ? visitYen * yenRate
      : null;
  const totalRub =
    visitRub !== null && amount(hotelRub) ? hotelRub + visitRub : null;
  return { admissionYen, transportYen, visitYen, visitRub, totalRub };
}
