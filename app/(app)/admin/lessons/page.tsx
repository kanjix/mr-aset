import EmptyState from "@/components/EmptyState";
import { LessonForm } from "@/components/admin/Forms";
import { DeleteButton } from "@/components/admin/Rows";
import { fmtDateTime } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.titles.adminLessons };
}

export default async function AdminLessonsPage() {
  const { t, locale } = await getI18n();
  const P = t.admin.lessonsPage;

  const supabase = await createClient();
  const [groupsRes, lessonsRes] = await Promise.all([
    supabase.from("groups").select("id,name").order("created_at"),
    supabase.from("lessons").select("*, groups(name)").order("starts_at", { ascending: true }),
  ]);
  const groups = groupsRes.data ?? [];
  const lessons = lessonsRes.data ?? [];

  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  const upcoming = lessons.filter((l: any) => new Date(l.starts_at).getTime() >= cutoff);
  const past = lessons
    .filter((l: any) => new Date(l.starts_at).getTime() < cutoff)
    .reverse()
    .slice(0, 10);

  const item = (l: any) => (
    <li key={l.id} className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium">{l.title}</p>
        <p className="text-sm text-muted">
          {fmtDateTime(l.starts_at, locale)},{" "}
          {t.common.groupOf(l.groups?.name ?? t.common.groupDeleted)}
        </p>
      </div>
      <DeleteButton table="lessons" id={l.id} />
    </li>
  );

  return (
    <>
      <h1 className="text-3xl font-medium tracking-tight">{t.titles.adminLessons}</h1>

      <div className="mt-8">
        {groups.length === 0 ? (
          <EmptyState
            title={t.common.createGroupFirstTitle}
            text={t.common.createGroupFirstText}
          />
        ) : (
          <LessonForm groups={groups} />
        )}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-medium">{P.upcoming}</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-muted">{P.none}</p>
        ) : (
          <ul className="ruled mt-3">{upcoming.map(item)}</ul>
        )}
      </section>

      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-medium">{P.past}</h2>
          <ul className="ruled mt-3">{past.map(item)}</ul>
        </section>
      )}
    </>
  );
}
