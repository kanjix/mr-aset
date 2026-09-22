import Link from "next/link";
import LangSwitch from "@/components/LangSwitch";
import { site } from "@/lib/config";
import { getI18n } from "@/lib/i18n/server";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export default async function Home() {
  const { t, locale } = await getI18n();
  const L = t.landing;

  // «О преподавателе»: можно задать одной строкой или отдельно для ru и kk
  const aboutSource: any = site.about;
  const aboutText: string =
    typeof aboutSource === "string" ? aboutSource : aboutSource?.[locale] ?? aboutSource?.ru ?? "";

  let loggedIn = false;
  if (hasSupabaseEnv()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      loggedIn = !!data.user;
    } catch {
      loggedIn = false;
    }
  }

  const contacts = [
    { label: "WhatsApp", value: L.write, href: site.whatsapp },
    { label: "Telegram", value: L.write, href: site.telegram },
    { label: L.phone, value: site.phone, href: `tel:${site.phone.replace(/[^+\d]/g, "")}` },
    { label: L.email, value: site.email, href: `mailto:${site.email}` },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-rule">
        <div
          aria-hidden
          className="notebook absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,#000_60%,transparent)]"
        />

        <div className="relative mx-auto max-w-5xl">
          {/* Красное поле, как в школьной тетради */}
          <span aria-hidden className="absolute inset-y-0 left-2 w-px bg-mark/50 md:left-0" />

          <header className="flex items-center justify-between gap-3 px-6 py-6">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              {site.brand}
            </Link>
            <nav className="flex items-center gap-2">
              <LangSwitch />
              {loggedIn ? (
                <Link href="/dashboard" className="btn btn-sm">
                  {L.openCabinet}
                </Link>
              ) : (
                <>
                  <Link href="/login" className="btn btn-ghost btn-sm hidden bg-paper sm:inline-flex">
                    {L.login}
                  </Link>
                  <Link href="/register" className="btn btn-sm">
                    {L.register}
                  </Link>
                </>
              )}
            </nav>
          </header>

          <div className="grid items-center gap-14 px-6 pb-24 pt-12 md:grid-cols-[1.1fr_1fr] md:pb-32 md:pt-20">
            <div>
              <h1 className="text-4xl font-medium leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
                {L.heroTitle1}
                <br />
                {L.heroTitle2}
              </h1>
              <p className="mt-6 max-w-md text-lg text-muted">{L.heroText}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {loggedIn ? (
                  <Link href="/dashboard" className="btn">
                    {L.openCabinet}
                  </Link>
                ) : (
                  <>
                    <Link href="/register" className="btn">
                      {L.register}
                    </Link>
                    <Link href="/login" className="btn btn-ghost bg-paper">
                      {L.login}
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Пример решения, как в тетради: синяя ручка и красная ручка учителя */}
            <div
              aria-hidden
              className="relative select-none font-hand text-3xl leading-[48px] text-pen sm:text-4xl md:justify-self-end"
            >
              <p>
                x<sup className="text-[0.6em]">2</sup> - 5x + 6 = 0
              </p>
              <p>(x - 2)(x - 3) = 0</p>
              <p className="relative w-fit">
                x = 2&nbsp;&nbsp;{L.or}&nbsp;&nbsp;x = 3
                <svg
                  viewBox="0 0 260 14"
                  preserveAspectRatio="none"
                  className="absolute -bottom-0.5 left-0 h-3 w-full text-mark"
                  fill="none"
                >
                  <path
                    d="M2 8 C 50 2, 110 12, 170 5 S 240 6, 258 4"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </p>

              <span className="absolute -bottom-14 right-0 -rotate-6 text-7xl leading-none text-mark">
                5
              </span>
              <svg
                viewBox="0 0 60 50"
                className="absolute -bottom-12 right-14 w-12 text-mark"
                fill="none"
              >
                <path
                  d="M6 28 L22 44 L54 6"
                  stroke="currentColor"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <h2 className="text-2xl font-medium tracking-tight md:text-3xl">{L.stepsTitle}</h2>
        <ol className="ruled mt-8">
          {L.steps.map((s, i) => (
            <li
              key={s.title}
              className="grid gap-x-8 gap-y-1 py-6 md:grid-cols-[3.5rem_16rem_1fr] md:items-baseline"
            >
              <span className="font-hand text-4xl leading-none text-pen">{i + 1}</span>
              <h3 className="text-lg font-medium">{s.title}</h3>
              <p className="max-w-prose text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16 md:pb-24">
        <h2 className="text-2xl font-medium tracking-tight md:text-3xl">{L.cabinetTitle}</h2>
        <p className="mt-3 max-w-prose text-muted">{L.cabinetIntro}</p>
        <dl className="ruled mt-8">
          {L.cabinet.map((c) => (
            <div key={c.title} className="grid gap-1 py-5 md:grid-cols-[18rem_1fr] md:gap-8">
              <dt className="font-medium">{c.title}</dt>
              <dd className="max-w-prose text-muted">{c.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16 md:pb-24">
        <h2 className="text-2xl font-medium tracking-tight md:text-3xl">{L.aboutTitle}</h2>
        <p className="mt-4 font-medium">{site.tutorName}</p>
        {(() => {
  const lines = aboutText.split("\n").map((l) => l.trim()).filter(Boolean);
  const [intro, ...rest] = lines;
  return (
    <>
      {intro && <p className="mt-2 max-w-prose leading-relaxed text-muted">{intro}</p>}
      {rest.length > 0 && (
        <ul className="ruled mt-6 max-w-prose">
          {rest.map((line, i) => {
            const cut = line.search(/[—-]\s/);
            if (cut > 0) {
              const title = line.slice(0, cut).trim();
              const text = line.slice(cut).replace(/^[—-]\s*/, "").trim();
              return (
                <li key={i} className="py-3">
                  <p className="font-medium">{title}</p>
                  <p className="text-muted">{text}</p>
                </li>
              );
            }
            return (
              <li key={i} className="py-3 font-medium">
                {line}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
})()}
      </section>

      <section className="border-t border-rule">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <h2 className="text-2xl font-medium tracking-tight md:text-3xl">{L.startTitle}</h2>
            <p className="mt-3 max-w-sm text-muted">{L.startText}</p>
            <div className="mt-6">
              <Link href={loggedIn ? "/dashboard" : "/register"} className="btn">
                {loggedIn ? L.openCabinet : L.register}
              </Link>
            </div>
          </div>

          <ul className="ruled self-start">
            {contacts.map((c) => (
              <li key={c.label}>
                <a
                  className="flex items-center justify-between gap-4 py-4 hover:text-pen"
                  href={c.href}
                >
                  <span className="font-medium">{c.label}</span>
                  <span className="text-muted">{c.value}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t border-rule">
        <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-muted">
          © {new Date().getFullYear()} {site.tutorName}
        </div>
      </footer>
    </>
  );
}
