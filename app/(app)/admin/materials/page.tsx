import EmptyState from "@/components/EmptyState";
import { MaterialForm } from "@/components/admin/Forms";
import { DeleteButton } from "@/components/admin/Rows";
import { getI18n } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.titles.adminMaterials };
}

export default async function AdminMaterialsPage() {
  const { t } = await getI18n();
  const P = t.admin.materialsPage;
  const kindLabel: Record<string, string> = P.kindLabels;

  const supabase = await createClient();
  const [groupsRes, materialsRes] = await Promise.all([
    supabase.from("groups").select("id,name").order("created_at"),
    supabase.from("materials").select("*, groups(name)").order("created_at", { ascending: false }),
  ]);
  const groups = groupsRes.data ?? [];
  const materials = materialsRes.data ?? [];

  return (
    <>
      <h1 className="text-3xl font-medium tracking-tight">{t.titles.adminMaterials}</h1>

      <div className="mt-8">
        {groups.length === 0 ? (
          <EmptyState
            title={t.common.createGroupFirstTitle}
            text={t.common.createGroupFirstText}
          />
        ) : (
          <MaterialForm groups={groups} />
        )}
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-medium">{P.uploaded}</h2>
        {materials.length === 0 ? (
          <p className="mt-3 text-muted">{t.common.nothingYet}</p>
        ) : (
          <ul className="ruled mt-3">
            {materials.map((m: any) => (
              <li key={m.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{m.title}</p>
                  <p className="text-sm text-muted">
                    {kindLabel[m.kind] ?? m.kind},{" "}
                    {t.common.groupOf(m.groups?.name ?? t.common.groupDeleted)}
                  </p>
                </div>
                <DeleteButton table="materials" id={m.id} bucket="materials" path={m.file_path} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
