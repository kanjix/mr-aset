import Link from "next/link";
import EmptyState from "@/components/EmptyState";
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

  const row = (s: any) => (
    <li key={s.id}>
      <Link
        href={`/admin/review/${s.id}`}
        className="flex items-center justify-between gap-4 py-4 hover:text-pen"
      >
        <div className="min-w-0">
          <p className="font-medium">{s.profiles?.full_name || s.profiles?.email || P.student}</p>
          <p className="text-sm text-muted">
            {P.submittedLine(
              s.assignments?.title ?? "",
              s.assignments?.groups?.name ?? t.common.groupDeleted,
              fmtDateTime(s.submitted_at, locale)
            )}
          </p>
        </div>
        {s.status === "graded" ? (
          s.grade ? (
            <span className="font-hand shrink-0 text-3xl leading-none text-mark">{s.grade}</span>
          ) : (
            <span className="shrink-0 text-sm text-mark">{P.checkedBadge}</span>
          )
        ) : (
          <span className="shrink-0 text-sm text-pen">{P.waitingBadge}</span>
        )}
      </Link>
    </li>
  );

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
          <ul className="ruled mt-3">{waiting.map(row)}</ul>
        )}
      </section>

      {checked.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-medium">{P.recent}</h2>
          <ul className="ruled mt-3">{checked.map(row)}</ul>
        </section>
      )}
    </>
  );
}