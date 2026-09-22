"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "@/components/I18nProvider";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image";

const MAX_FILES = 5;

export default function SubmitForm({
  assignmentId,
  userId,
  existingPaths,
}: {
  assignmentId: string;
  userId: string;
  existingPaths: string[];
}) {
  const t = useT();
  const S = t.submit;
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const resubmit = existingPaths.length > 0;

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length > MAX_FILES) {
      setError(S.tooMany(MAX_FILES));
      setFiles(picked.slice(0, MAX_FILES));
      return;
    }
    setError(null);
    setFiles(picked);
  }

  function errorText(err: any) {
    switch (err?.message) {
      case "image_open":
        return S.errOpen;
      case "image_canvas":
        return S.errCanvas;
      case "image_compress":
        return S.errCompress;
      default:
        return err?.message || S.failed;
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (files.length === 0) {
      setError(S.needPhoto);
      return;
    }
    setBusy(true);
    setError(null);

    try {
      const supabase = createClient();
      const stamp = Date.now();
      const uploaded: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const blob = await compressImage(files[i]);
        const path = `${userId}/${assignmentId}/${stamp}-${i + 1}.jpg`;
        const { error: upErr } = await supabase.storage
          .from("submissions")
          .upload(path, blob, { contentType: "image/jpeg", upsert: false });
        if (upErr) throw new Error(upErr.message);
        uploaded.push(path);
      }

      const { error: dbErr } = await supabase.from("submissions").upsert(
        {
          assignment_id: assignmentId,
          student_id: userId,
          photo_paths: uploaded,
          status: "submitted",
          submitted_at: new Date().toISOString(),
        },
        { onConflict: "assignment_id,student_id" }
      );
      if (dbErr) throw new Error(dbErr.message);

      // Старые фото заменяются новыми, чтобы не занимать место.
      if (existingPaths.length > 0) {
        await supabase.storage.from("submissions").remove(existingPaths);
      }

      setFiles([]);
      setInputKey((k) => k + 1);
      router.refresh();
    } catch (err: any) {
      setError(errorText(err));
    }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="photos" className="label">
          {resubmit ? S.labelResubmit : S.label(MAX_FILES)}
        </label>
        <input
          key={inputKey}
          id="photos"
          type="file"
          accept="image/*"
          multiple
          onChange={onPick}
          className="input"
        />
        {files.length > 0 && <p className="mt-2 text-sm text-muted">{S.chosen(files.length)}</p>}
      </div>

      {error && <p className="text-sm text-mark">{error}</p>}

      <button type="submit" className="btn" disabled={busy || files.length === 0}>
        {busy ? S.sending : resubmit ? S.resubmit : S.submit}
      </button>
    </form>
  );
}
