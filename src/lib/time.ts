import { appTimeZone } from "./constants";

// Москва живёт в UTC+3 круглый год (без перехода на летнее время)
const MOSCOW_OFFSET_MS = 3 * 60 * 60 * 1000;

/** Начало московских суток для даты, сдвинутой на dayOffset дней */
export function moscowDayStart(date: Date, dayOffset = 0): Date {
  const shifted = new Date(date.getTime() + MOSCOW_OFFSET_MS);
  const utcMidnight = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate() + dayOffset);
  return new Date(utcMidnight - MOSCOW_OFFSET_MS);
}

export function formatTime(d: Date) {
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: appTimeZone });
}

export function formatDay(d: Date) {
  return d.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", timeZone: appTimeZone });
}

export function formatDate(d: Date) {
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: appTimeZone });
}
