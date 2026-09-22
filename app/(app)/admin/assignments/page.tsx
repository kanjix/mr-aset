import EmptyState from "@/components/EmptyState";
import { AnnouncementForm, AssignmentForm } from "@/components/admin/Forms";
import { DeleteButton } from "@/components/admin/Rows";
import { fmtDateTime, fmtShortDate } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.titles.adminAssignments };
}

export default async function AdminAssignmentsPage() {
  const { t, locale } = await getI18n();
  const P = t.admin.assignmentsPage;

  const supabase = await createClient();
  const [groupsRes, assignmentsRes, announcementsRes] = await Promise.all([
    supabase.from("groups").select("id,name").order("created_at"),
    supabase.from("assignments").select("*, groups(name)").order("created_at", { ascending: false }),
    supabase
      .from("announcements")
      .select("*, groups(name)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  const groups = groupsRes.data ?? [];
  const assignments = assignmentsRes.data ?? [];
  const announcements = announcementsRes.data ?? [];

  return (
    <>
      <h1 className="text-3xl font-medium tracking-tight">{t.titles.adminAssignments}</h1>

      <div className="mt-8 space-y-6">
        {groups.length === 0 ? (
          <EmptyState
            title={t.common.createGroupFirstTitle}
            text={t.common.createGroupFirstText}
          />
        ) : (
          <>
            <AssignmentForm groups={groups} />
            <AnnouncementForm groups={groups} />
          </>
        )}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-medium">{P.tasks}</h2>
        {assignments.length === 0 ? (
          <p className="mt-3 text-muted">{t.common.nothingYet}</p>
        ) : (
          <ul className="ruled mt-3">
            {assignments.map((a: any) => (
              <li key={a.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{a.title}</p>
                  <p className="text-sm text-muted">
                    {t.common.groupOf(a.groups?.name ?? t.common.groupDeleted)}
                    {a.due_at ? P.dueSuffix(fmtDateTime(a.due_at, locale)) : ""}
                  </p>
                </div>
                <DeleteButton
                  table="assignments"
                  id={a.id}
                  purgeSubmissions
                  confirmText={P.deleteConfirm}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">{P.latest}</h2>
        {announcements.length === 0 ? (
          <p className="mt-3 text-muted">{t.common.nothingYet}</p>
        ) : (
          <ul className="ruled mt-3">
            {announcements.map((n: any) => (
              <li key={n.id} className="flex items-start justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="whitespace-pre-line">{n.body}</p>
                  <p className="mt-1 text-sm text-muted">
                    {n.groups?.name ? t.common.groupOf(n.groups.name) : t.common.allGroups},{" "}
                    {fmtShortDate(n.created_at, locale)}
                  </p>
                </div>
                <DeleteButton table="announcements" id={n.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
