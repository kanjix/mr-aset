import { site } from "./config";
import type { Locale } from "./i18n/config";

const tz = site.timezone;
const intlLocale: Record<Locale, string> = { ru: "ru-RU", kk: "kk-KZ" };

export function fmtDateTime(iso: string, locale: Locale = "ru") {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    timeZone: tz,
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function fmtShortDate(iso: string, locale: Locale = "ru") {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    timeZone: tz,
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

export function firstName(fullName: string | null | undefined, fallback: string) {
  return (fullName ?? "").trim().split(/\s+/)[0] || fallback;
}
