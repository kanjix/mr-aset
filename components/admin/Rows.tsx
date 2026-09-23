"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "@/components/I18nProvider";
import { createClient } from "@/lib/supabase/client";

type Group = { id: string; name: string };

export function StudentRow({ student, groups }: { student: any; groups: Group[] }) {
  const t = useT();
  const R = t.admin.rows;
  const router = useRouter();
  const pending = student.status === "pending";
  const [group, setGroup] = useState<string>(student.group_id ?? "");
  const [status, setStatus] = useState<string>(pending ? "approved" : student.status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

    async function save() {
    setBusy(true);
    setError(null);
    const wasPending = student.status === "pending";
    const { error } = await createClient()
      .from("profiles")
      .update({ group_id: group || null, status })
      .eq("id", student.id);
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }

    if (wasPending && status === "approved" && student.email) {
      try {
        const res = await fetch("/api/notify-approved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: student.email, name: student.full_name }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          alert("Не удалось отправить письмо: " + (body.error ?? res.status));
        }
      } catch (e: any) {
        alert("Не удалось отправить письмо: " + e.message);
      }
    }

    router.refresh();
    setBusy(false);
  }

  return (
    <li className="py-4">
      <div className="flex flex-wrap items-start justify-between gap-x-4">
        <div className="min-w-0">
          <p className="font-medium">{student.full_name || R.noName}</p>
          <p className="truncate text-sm text-muted">{student.email}</p>
        </div>
        {pending && <span className="text-sm text-mark">{R.pendingLabel}</span>}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <select
          aria-label={t.common.group}
          className="input"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
        >
          <option value="">{R.noGroup}</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <select
          aria-label={R.status}
          className="input"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="pending">{R.statusPending}</option>
          <option value="approved">{R.statusApproved}</option>
          <option value="blocked">{R.statusBlocked}</option>
        </select>
        <button type="button" className="btn" onClick={save} disabled={busy}>
          {pending ? R.approve : R.save}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-mark">{error}</p>}
    </li>
  );
}

export function DeleteButton({
  table,
  id,
  bucket,
  path,
  purgeSubmissions,
  confirmText,
}: {
  table: string;
  id: string;
  bucket?: string;
  path?: string | null;
  purgeSubmissions?: boolean;
  confirmText?: string;
}) {
  const R = useT().admin.rows;
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (!confirm(confirmText ?? R.deleteConfirm)) return;
    setBusy(true);
    const supabase = createClient();

    // Вместе с заданием удаляем фото сданных работ, чтобы не копились в хранилище.
    if (purgeSubmissions) {
      const { data } = await supabase.from("submissions").select("photo_paths").eq("assignment_id", id);
      const paths = (data ?? []).flatMap((r: any) => r.photo_paths ?? []);
      if (paths.length > 0) await supabase.storage.from("submissions").remove(paths);
    }
    if (bucket && path) await supabase.storage.from(bucket).remove([path]);

    const { error } = await supabase.from(table).delete().eq("id", id);
    setBusy(false);
    if (error) alert(error.message);
    else router.refresh();
  }

  return (
    <button type="button" onClick={onClick} disabled={busy} className="btn btn-danger btn-sm shrink-0">
      {busy ? R.deleting : R.delete}
    </button>
  );
}

export function GradeForm({
  submissionId,
  grade,
  comment,
  graded,
  photoPaths,
}: {
  submissionId: string;
  grade: string | null;
  comment: string | null;
  graded: boolean;
  photoPaths: string[];
}) {
  const R = useT().admin.rows;
  const router = useRouter();
  const [g, setG] = useState(grade ?? "");
  const [c, setC] = useState(comment ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    const { error } = await createClient()
      .from("submissions")
      .update({
        grade: g.trim() || null,
        comment: c.trim() || null,
        status: "graded",
        graded_at: new Date().toISOString(),
      })
      .eq("id", submissionId);
    if (error) setError(error.message);
    else router.refresh();
    setBusy(false);
  }

  async function clearPhotos() {
    if (!confirm(R.clearConfirm)) return;
    setBusy(true);
    const supabase = createClient();
    await supabase.storage.from("submissions").remove(photoPaths);
    const { error } = await supabase
      .from("submissions")
      .update({ photo_paths: [] })
      .eq("id", submissionId);
    if (error) setError(error.message);
    else router.refresh();
    setBusy(false);
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-[6rem_1fr]">
        <div>
          <label className="label">{R.grade}</label>
          <input
            className="input"
            value={g}
            onChange={(e) => setG(e.target.value)}
            placeholder="5"
          />
        </div>
        <div>
          <label className="label">{R.comment}</label>
          <textarea className="input" value={c} onChange={(e) => setC(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-sm text-mark">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn" onClick={save} disabled={busy}>
          {graded ? R.updateGrade : R.setGrade}
        </button>
        {graded && photoPaths.length > 0 && (
          <button type="button" className="btn btn-ghost" onClick={clearPhotos} disabled={busy}>
            {R.clearPhotos}
          </button>
        )}
      </div>
    </div>
  );
}
