import EmptyState from "@/components/EmptyState";
import { DeleteButton, StudentRow } from "@/components/admin/Rows";
import { GroupForm } from "@/components/admin/Forms";
import { getI18n } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.titles.adminStudents };
}

export default async function AdminStudentsPage() {
  const { t } = await getI18n();
  const P = t.admin.studentsPage;
  const supabase = await createClient();

  const [groupsRes, studentsRes] = await Promise.all([
    supabase.from("groups").select("*").order("created_at"),
    supabase.from("profiles").select("*").eq("role", "student").order("created_at", { ascending: false }),
  ]);

  const groups = groupsRes.data ?? [];
  const students = [...(studentsRes.data ?? [])].sort(
    (a: any, b: any) => Number(b.status === "pending") - Number(a.status === "pending")
  );
  const pendingCount = students.filter((s: any) => s.status === "pending").length;

  return (
    <>
      <h1 className="text-3xl font-medium tracking-tight">{t.titles.adminStudents}</h1>

      <section className="mt-8">
        <h2 className="text-lg font-medium">{P.groups}</h2>
        {groups.length > 0 && (
          <ul className="ruled mt-3">
            {groups.map((g: any) => {
              const count = students.filter((s: any) => s.group_id === g.id).length;
              return (
                <li key={g.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="font-medium">{g.name}</p>
                    <p className="text-sm text-muted">{P.studentsCount(count)}</p>
                  </div>
                  <DeleteButton table="groups" id={g.id} confirmText={P.deleteGroupConfirm} />
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-5">
          <GroupForm />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-medium">
          {pendingCount > 0 ? P.studentsPending(pendingCount) : P.students}
        </h2>
        {students.length === 0 ? (
          <div className="mt-3">
            <EmptyState title={P.noStudentsTitle} text={P.noStudentsText} />
          </div>
        ) : (
          <ul className="ruled mt-3">
            {students.map((s: any) => (
              <StudentRow key={s.id} student={s} groups={groups} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
