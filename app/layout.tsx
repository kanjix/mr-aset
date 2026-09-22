import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Marck_Script } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/I18nProvider";
import { getI18n } from "@/lib/i18n/server";

// cyrillic-ext нужен для казахских букв: Ә, Ғ, Қ, Ң, Ө, Ү, Ұ, Һ
const plex = IBM_Plex_Sans({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});

// Рукописный шрифт: только для «пометок учителя» и примера на главной.
const marck = Marck_Script({
  subsets: ["latin", "cyrillic"],
  weight: "400",
  variable: "--font-marck",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: { default: t.meta.siteTitle, template: "%s | Математика" },
    description: t.meta.description,
    appleWebApp: { capable: true, title: "Математика", statusBarStyle: "default" },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fcfdff",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale } = await getI18n();

  return (
    <html lang={locale} className={`${plex.variable} ${marck.variable}`}>
      <body className="min-h-dvh bg-paper text-ink">
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
