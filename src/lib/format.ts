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
  if (!iso) return "";
  return DATE_LONG.format(new Date(iso));
}

export function formatDateShort(iso: string): string {
  if (!iso) return "";
  return DATE_SHORT.format(new Date(iso));
}

/** Add `n` days (0-based: 0 = same day) to an ISO date string. */
export function addDaysISO(startISO: string, n: number): string {
  if (!startISO) return "";
  const d = new Date(startISO);
  if (isNaN(d.getTime())) return "";
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
