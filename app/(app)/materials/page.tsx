import { redirect } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import { getProfile } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.titles.materials };
}

export default async function MaterialsPage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role === "admin") redirect("/admin/materials");

  const { t } = await getI18n();
  const M = t.materials;

  const kinds = [
    { key: "book", title: M.kinds.book, action: M.open },
    { key: "presentation", title: M.kinds.presentation, action: M.open },
    { key: "video", title: M.kinds.video, action: M.watch },
  ];

  const title = <h1 className="text-3xl font-medium tracking-tight">{t.titles.materials}</h1>;

  if (!profile.group_id) {
    return (
      <>
        {title}
        <div className="mt-8">
          <EmptyState title={t.dashboard.noGroupTitle} text={M.noGroupText} />
        </div>
      </>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("materials")
    .select("*")
    .order("created_at", { ascending: false });
  const items = data ?? [];

  // Файлы приватные: для каждого создаётся временная ссылка на час.
  const paths = items.filter((m: any) => m.file_path).map((m: any) => m.file_path as string);
  const urlByPath = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage.from("materials").createSignedUrls(paths, 3600);
    (signed ?? []).forEach((s: any) => {
      if (s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl);
    });
  }

  return (
    <>
      {title}

      {items.length === 0 && (
        <div className="mt-8">
          <EmptyState title={M.emptyTitle} text={M.emptyText} />
        </div>
      )}

      {kinds.map((k) => {
        const list = items.filter((m: any) => m.kind === k.key);
        if (list.length === 0) return null;
        return (
          <section key={k.key} className="mt-10">
            <h2 className="text-lg font-medium">{k.title}</h2>
            <ul className="ruled mt-3">
              {list.map((m: any) => {
                const href = m.url ?? (m.file_path ? urlByPath.get(m.file_path) : undefined);
                return (
                  <li key={m.id} className="flex items-center justify-between gap-4 py-4">
                    <p className="min-w-0 font-medium">{m.title}</p>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm shrink-0"
                      >
                        {k.action}
                      </a>
                    ) : (
                      <span className="shrink-0 text-sm text-muted">{M.unavailable}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </>
  );
}
