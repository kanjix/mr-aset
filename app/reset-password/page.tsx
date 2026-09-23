"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LangSwitch from "@/components/LangSwitch";
import { useT } from "@/components/I18nProvider";
import { createClient } from "@/lib/supabase/client";
import { site } from "@/lib/config";

export default function ResetPasswordPage() {
  const t = useT();
  const r = t.resetPassword;
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password.length < 6) {
      setMessage({ ok: false, text: t.auth.errShort });
      return;
    }
    setBusy(true);
    setMessage(null);
    const { error } = await createClient().auth.updateUser({ password });
    if (error) {
      setMessage({ ok: false, text: error.message });
      setBusy(false);
      return;
    }
    setMessage({ ok: true, text: r.done });
    setTimeout(() => router.push("/dashboard"), 1200);
  }

  return (
    <main className="notebook relative flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="absolute right-4 top-4">
        <LangSwitch />
      </div>
      <div className="w-full max-w-sm rounded-md border border-rule bg-paper p-7">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {site.brand}
        </Link>
        <h1 className="mt-6 text-2xl font-medium tracking-tight">{r.resetTitle}</h1>
        <p className="mt-2 text-sm text-muted">{r.resetText}</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            required
            minLength={6}
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          {message && (
            <p className={`text-sm ${message.ok ? "text-pen" : "text-mark"}`}>{message.text}</p>
          )}
          <button className="btn w-full" disabled={busy}>
            {busy ? t.common.wait : r.save}
          </button>
        </form>
      </div>
    </main>
  );
}