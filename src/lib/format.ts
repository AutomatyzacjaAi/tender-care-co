export const PLN = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  maximumFractionDigits: 0,
});

export const PLN_DETAILED = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  maximumFractionDigits: 2,
});

const DATE_LONG = new Intl.DateTimeFormat("pl-PL", {
  weekday: "short",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const DATE_SHORT = new Intl.DateTimeFormat("pl-PL", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
});

export function formatDateLong(iso: string): string {
  return DATE_LONG.format(new Date(iso));
}

export function formatDateShort(iso: string): string {
  return DATE_SHORT.format(new Date(iso));
}

export function eachDayBetween(startISO: string, endISO: string): string[] {
  if (!startISO || !endISO) return [];
  const start = new Date(startISO);
  const end = new Date(endISO);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return [];
  const out: string[] = [];
  const cur = new Date(start);
  cur.setHours(12, 0, 0, 0);
  while (cur <= end) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}
