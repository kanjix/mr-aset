"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "./I18nProvider";
import { LOCALE_COOKIE, localeLabels, locales, type Locale } from "@/lib/i18n/config";

// Переключатель языка. Выбор хранится в cookie на год, поэтому сайт помнит язык.
export default function LangSwitch({ className = "" }: { className?: string }) {
  const router = useRouter();
  const { locale, t } = useI18n();

  function pick(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div
      role="group"
      aria-label={t.common.langLabel}
      className={`inline-flex rounded-md border border-rule bg-paper p-0.5 text-sm ${className}`}
    >
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => pick(l)}
          aria-pressed={l === locale}
          className={`rounded px-2.5 py-1 transition-colors ${
            l === locale ? "bg-pen text-white" : "text-muted hover:text-ink"
          }`}
        >
          {localeLabels[l]}
        </button>
      ))}
    </div>
  );
}
