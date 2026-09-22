import EmptyState from "@/components/EmptyState";
import { GradeForm } from "@/components/admin/Rows";
import { fmtDateTime } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.titles.adminReview };
}

export default async function AdminReviewPage() {
  const { t, locale } = await getI18n();
  const P = t.admin.reviewPage;

  const supabase = await createClient();

  const { data } = await supabase
    .from("submissions")
    .select("*, profiles(full_name, email), assignments(title, groups(name))")
    .order("submitted_at", { ascending: false })
    .limit(60);
  const subs = data ?? [];

  const waiting = subs.filter((s: any) => s.status === "submitted");
  const checked = subs.filter((s: any) => s.status === "graded").slice(0, 15);

  // Фото приватные: выдаём временные ссылки на час
  const allPaths = subs.flatMap((s: any) => s.photo_paths ?? []) as string[];
  const urlByPath = new Map<string, string>();
  if (allPaths.length > 0) {
    const { data: signed } = await supabase.storage.from("submissions").createSignedUrls(allPaths, 3600);
    (signed ?? []).forEach((x: any) => {
      if (x.path && x.signedUrl) urlByPath.set(x.path, x.signedUrl);
    });
  }

  const card = (s: any) => {
    const photos = ((s.photo_paths ?? []) as string[])
      .map((p) => urlByPath.get(p))
      .filter(Boolean) as string[];
    return (
      <li key={s.id} className="py-6">
        <p className="font-medium">{s.profiles?.full_name || s.profiles?.email || P.student}</p>
        <p className="text-sm text-muted">
          {P.submittedLine(
            s.assignments?.title ?? "",
            s.assignments?.groups?.name ?? t.common.groupDeleted,
            fmtDateTime(s.submitted_at, locale)
          )}
        </p>

        {photos.length > 0 ? (
          <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photos.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={P.photoAlt}
                    className="aspect-square w-full rounded-md border border-rule object-cover"
                  />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">{P.photosDeleted}</p>
        )}

        <GradeForm
          submissionId={s.id}
          grade={s.grade}
          comment={s.comment}
          graded={s.status === "graded"}
          photoPaths={s.photo_paths ?? []}
        />
      </li>
    );
  };

  return (
    <>
      <h1 className="text-3xl font-medium tracking-tight">{t.titles.adminReview}</h1>

      <section className="mt-8">
        <h2 className="text-lg font-medium">
          {waiting.length > 0 ? P.waitingCount(waiting.length) : P.waiting}
        </h2>
        {waiting.length === 0 ? (
          <div className="mt-3">
            <EmptyState title={P.allCheckedTitle} text={P.allCheckedText} />
          </div>
        ) : (
          <ul className="ruled mt-3">{waiting.map(card)}</ul>
        )}
      </section>

      {checked.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-medium">{P.recent}</h2>
          <ul className="ruled mt-3">{checked.map(card)}</ul>
        </section>
      )}
    </>
  );
}
