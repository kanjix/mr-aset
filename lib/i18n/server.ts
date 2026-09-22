import { cookies } from "next/headers";
import { dictionaries } from "./dictionaries";
import { LOCALE_COOKIE, defaultLocale, type Locale } from "./config";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return value === "kk" || value === "ru" ? value : defaultLocale;
}

// Для серверных страниц: const { t, locale } = await getI18n();
export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}
