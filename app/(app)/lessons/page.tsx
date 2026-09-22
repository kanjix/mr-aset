import { redirect } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import { getProfile } from "@/lib/data";
import { fmtDateTime } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.titles.lessons };
}

export default async function LessonsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role === "admin") redirect("/admin/lessons");

  const { t, locale } = await getI18n();
  const L = t.lessons;

  const title = <h1 className="text-3xl font-medium tracking-tight">{t.titles.lessons}</h1>;

  if (!profile.group_id) {
    return (
      <>
        {title}
        <div className="mt-8">
          <EmptyState title={t.dashboard.noGroupTitle} text={L.noGroupText} />
        </div>
      </>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase.from("lessons").select("*").order("starts_at", { ascending: true });
  const lessons = data ?? [];

  // Урок считается текущим ещё 2 часа после начала
  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  const upcoming = lessons.filter((l: any) => new Date(l.starts_at).getTime() >= cutoff);
  const past = lessons
    .filter((l: any) => new Date(l.starts_at).getTime() < cutoff)
    .reverse()
    .slice(0, 8);

  return (
    <>
      {title}

      <section className="mt-8">
        <h2 className="text-lg font-medium">{L.schedule}</h2>
        {upcoming.length === 0 ? (
          <div className="mt-3">
            <EmptyState title={L.noneTitle} text={L.noneText} />
          </div>
        ) : (
          <ul className="ruled mt-3">
            {upcoming.map((l: any) => (
              <li key={l.id} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="font-medium">{l.title}</p>
                  <p className="text-sm text-muted">{fmtDateTime(l.starts_at, locale)}</p>
                </div>
                {l.meet_url ? (
                  <a
                    href={l.meet_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm shrink-0"
                  >
                    {t.dashboard.join}
                  </a>
                ) : (
                  <span className="shrink-0 text-sm text-muted">{L.linkLater}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-medium">{L.past}</h2>
          <ul className="ruled mt-3">
            {past.map((l: any) => (
              <li key={l.id} className="py-3">
                <p>{l.title}</p>
                <p className="text-sm text-muted">{fmtDateTime(l.starts_at, locale)}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
