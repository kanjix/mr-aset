import { site } from "@/lib/config";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.titles.support };
}

export default async function SupportPage() {
  const { t } = await getI18n();
  const S = t.support;

  const links = [
    { label: "WhatsApp", value: S.write, href: site.whatsapp },
    { label: "Telegram", value: S.write, href: site.telegram },
    { label: S.email, value: site.email, href: `mailto:${site.email}` },
  ];

  return (
    <>
      <h1 className="text-3xl font-medium tracking-tight">{t.titles.support}</h1>
      <p className="mt-3 max-w-prose text-muted">{S.text}</p>

      <ul className="ruled mt-8 max-w-md">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={l.href}
              className="flex items-center justify-between gap-4 py-4 hover:text-pen"
            >
              <span className="font-medium">{l.label}</span>
              <span className="text-muted">{l.value}</span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
