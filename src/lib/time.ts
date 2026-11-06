// Wall-clock helpers.
//
// The app stores business-local times encoded as if they were UTC. That keeps
// date arithmetic trivial and avoids DST surprises. Formatting always uses
// `timeZone: "UTC"` so the stored wall clock renders exactly as entered.
// `nowWallClock` converts real "now" into the business timezone wall clock.

export const MS_MINUTE = 60_000;
export const MS_DAY = 86_400_000;

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter;
}

/** Current time in the business timezone, encoded as a wall-clock Date. */
export function nowWallClock(timeZone: string): Date {
  const parts = formatterFor(timeZone).formatToParts(new Date());
  const map: Record<string, string> = {};
  for (const part of parts) map[part.type] = part.value;
  const hour = map.hour === "24" ? "00" : map.hour;
  return new Date(
    Date.UTC(
      Number(map.year),
      Number(map.month) - 1,
      Number(map.day),
      Number(hour),
      Number(map.minute),
      Number(map.second),
    ),
  );
}

/** Parse a `YYYY-MM-DD` key. Returns null when malformed. */
export function parseDateKey(key: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return { y, m, d };
}

/** `YYYY-MM-DD` for a wall-clock Date (UTC components). */
export function dateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_DAY);
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * MS_MINUTE);
}

export function weekday(date: Date): number {
  return date.getUTCDay();
}

export function minutesSinceMidnight(date: Date): number {
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}

export function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function labelTime(date: Date): string {
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

export function labelDateLong(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(date);
}

export function labelDateShort(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function labelDateTime(date: Date): string {
  return `${labelDateLong(date)} · ${labelTime(date)} hs`;
}

export function weekdayShort(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", { weekday: "short", timeZone: "UTC" }).format(date);
}

/** Build a wall-clock Date from a date key and an hour/minute. */
export function wallClock(dateKeyValue: string, hour: number, minute: number): Date {
  const parts = parseDateKey(dateKeyValue);
  if (!parts) return new Date(NaN);
  return new Date(Date.UTC(parts.y, parts.m - 1, parts.d, hour, minute));
}

export const WEEKDAYS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const;
