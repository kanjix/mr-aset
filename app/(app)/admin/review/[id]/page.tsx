import Link from "next/link";
import { notFound } from "next/navigation";
import { GradeForm } from "@/components/admin/Rows";
import { fmtDateTime } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.titles.adminReview };
}

export default async function AdminReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t, locale } = await getI18n();
  const P = t.admin.reviewPage;

  const supabase = await createClient();

  const { data: s } = await supabase
    .from("submissions")
    .select("*, profiles(full_name, email), assignments(title, description, groups(name))")
    .eq("id", id)
    .maybeSingle();

  if (!s) notFound();

  const photoPaths: string[] = s.photo_paths ?? [];
  let photos: string[] = [];
  if (photoPaths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("submissions")
      .createSignedUrls(photoPaths, 3600);
    photos = (signed ?? []).map((d: any) => d.signedUrl).filter(Boolean);
  }

  return (
    <>
      <Link href="/admin/review" className="text-sm text-muted hover:text-pen">
        {P.back}
      </Link>

      <h1 className="mt-4 text-3xl font-medium tracking-tight">
        {s.profiles?.full_name || s.profiles?.email || P.student}
      </h1>
      <p className="mt-1 text-muted">
        {P.submittedLine(
          s.assignments?.title ?? "",
          s.assignments?.groups?.name ?? t.common.groupDeleted,
          fmtDateTime(s.submitted_at, locale)
        )}
      </p>

      {s.assignments?.description && (
        <p className="mt-4 max-w-prose whitespace-pre-line leading-relaxed text-muted">
          {s.assignments.description}
        </p>
      )}

      <section className="mt-8 border-t border-rule pt-6">
        {photos.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
          <p className="text-sm text-muted">{P.photosDeleted}</p>
        )}

        <GradeForm
          submissionId={s.id}
          grade={s.grade}
          comment={s.comment}
          graded={s.status === "graded"}
          photoPaths={photoPaths}
        />
      </section>
    </>
  );
}