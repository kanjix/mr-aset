import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import StatusMark from "@/components/StatusMark";
import SubmitForm from "@/components/SubmitForm";
import { getProfile } from "@/lib/data";
import { fmtDateTime } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.titles.assignment };
}

export default async function AssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (profile.role === "admin") redirect("/admin");

  const { t, locale } = await getI18n();
  const A = t.assignment;
  const supabase = await createClient();

  const { data: assignment } = await supabase
    .from("assignments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!assignment) notFound();

  const { data: sub } = await supabase
    .from("submissions")
    .select("*")
    .eq("assignment_id", id)
    .eq("student_id", profile.id)
    .maybeSingle();

  const photoPaths: string[] = sub?.photo_paths ?? [];
  let photos: string[] = [];
  if (photoPaths.length > 0) {
    const { data } = await supabase.storage.from("submissions").createSignedUrls(photoPaths, 3600);
    photos = (data ?? []).map((d: any) => d.signedUrl).filter(Boolean);
  }

  const graded = sub?.status === "graded";

  return (
    <>
      <Link href="/dashboard" className="text-sm text-muted hover:text-pen">
        {A.back}
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <h1 className="text-3xl font-medium tracking-tight">{assignment.title}</h1>
        <div className="pt-1">
          <StatusMark submission={sub} dueAt={assignment.due_at} labels={t.status} />
        </div>
      </div>

      {assignment.due_at && (
        <p className="mt-1 text-muted">{A.deadline(fmtDateTime(assignment.due_at, locale))}</p>
      )}

      {assignment.description && (
        <p className="mt-6 max-w-prose whitespace-pre-line leading-relaxed">
          {assignment.description}
        </p>
      )}

      <section className="mt-10 border-t border-rule pt-6">
        <h2 className="text-lg font-medium">{A.yourWork}</h2>

        {graded && (
          <div className="mt-4 flex items-start gap-6">
            {sub.grade && (
              <span className="font-hand text-6xl leading-none text-mark">{sub.grade}</span>
            )}
            {sub.comment && (
              <div>
                <p className="text-sm text-muted">{A.teacherComment}</p>
                <p className="mt-1 whitespace-pre-line border-l-2 border-mark pl-3">
                  {sub.comment}
                </p>
              </div>
            )}
          </div>
        )}

        {photos.length > 0 && (
          <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photos.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={A.photoAlt}
                    className="aspect-square w-full rounded-md border border-rule object-cover"
                  />
                </a>
              </li>
            ))}
          </ul>
        )}

        {graded ? (
          <p className="mt-4 text-sm text-muted">{A.gradedNote}</p>
        ) : (
          <SubmitForm assignmentId={id} userId={profile.id} existingPaths={photoPaths} />
        )}
      </section>
    </>
  );
}
