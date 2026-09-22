export const locales = ["ru", "kk"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ru";
export const LOCALE_COOKIE = "lang";

// Подписи на переключателе языка
export const localeLabels: Record<Locale, string> = {
  ru: "Рус",
  kk: "Қаз",
};
