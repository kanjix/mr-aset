import Link from "next/link";
import { redirect } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import StatusMark from "@/components/StatusMark";
import { getProfile } from "@/lib/data";
import { firstName, fmtDateTime, fmtShortDate } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.titles.dashboard };
}

export default async function DashboardPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role === "admin") redirect("/admin");

  const { t, locale } = await getI18n();
  const D = t.dashboard;

  const greeting = (
    <h1 className="text-3xl font-medium tracking-tight">
      {D.hello(firstName(profile.full_name, D.studentFallback))}
    </h1>
  );

  if (!profile.group_id) {
    return (
      <>
        {greeting}
        <div className="mt-8">
          <EmptyState title={D.noGroupTitle} text={D.noGroupText} />
        </div>
      </>
    );
  }

  const supabase = await createClient();
  const lessonCutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const [announcementsRes, assignmentsRes, submissionsRes, lessonRes] = await Promise.all([
    supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(3),
    supabase.from("assignments").select("*").order("due_at", { ascending: true, nullsFirst: false }),
    supabase.from("submissions").select("assignment_id,status,grade").eq("student_id", profile.id),
    supabase.from("lessons").select("*").gte("starts_at", lessonCutoff).order("starts_at").limit(1),
  ]);

  const announcements = announcementsRes.data ?? [];
  const assignments = assignmentsRes.data ?? [];
  const nextLesson = lessonRes.data?.[0];
  const subMap = new Map<string, any>((submissionsRes.data ?? []).map((s: any) => [s.assignment_id, s]));

  const todo = assignments.filter((a: any) => !subMap.has(a.id));
  const done = assignments.filter((a: any) => subMap.has(a.id));

  const row = (a: any) => (
    <li key={a.id}>
      <Link
        href={`/dashboard/${a.id}`}
        className="flex items-center justify-between gap-4 py-4 hover:text-pen"
      >
        <div className="min-w-0">
          <p className="truncate font-medium">{a.title}</p>
          {a.due_at && <p className="text-sm text-muted">{D.due(fmtDateTime(a.due_at, locale))}</p>}
        </div>
        <StatusMark submission={subMap.get(a.id)} dueAt={a.due_at} labels={t.status} />
      </Link>
    </li>
  );

  return (
    <>
      {greeting}

      {announcements.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-medium">{D.announcements}</h2>
          <ul className="ruled mt-3">
            {announcements.map((n: any) => (
              <li key={n.id} className="py-3">
                <p className="whitespace-pre-line">{n.body}</p>
                <p className="mt-1 text-xs text-muted">{fmtShortDate(n.created_at, locale)}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {nextLesson && (
        <section className="mt-8 border-l-2 border-pen pl-4">
          <p className="text-sm text-muted">{D.nextLesson}</p>
          <p className="text-lg font-medium">{nextLesson.title}</p>
          <p className="text-sm text-muted">{fmtDateTime(nextLesson.starts_at, locale)}</p>
          {nextLesson.meet_url && (
            <a
              href={nextLesson.meet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm mt-3"
            >
              {D.join}
            </a>
          )}
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-medium">{D.todo}</h2>
        {todo.length === 0 ? (
          <p className="mt-3 text-muted">{D.noTodo}</p>
        ) : (
          <ul className="ruled mt-3">{todo.map(row)}</ul>
        )}
      </section>

      {done.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-medium">{D.done}</h2>
          <ul className="ruled mt-3">{done.map(row)}</ul>
        </section>
      )}
    </>
  );
}
