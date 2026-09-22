"use client";

import { createContext, useContext } from "react";
import { dictionaries, type Dict } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";

const Ctx = createContext<{ locale: Locale; t: Dict }>({
  locale: "ru",
  t: dictionaries.ru,
});

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={{ locale, t: dictionaries[locale] }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return useContext(Ctx);
}

export function useT() {
  return useContext(Ctx).t;
}
