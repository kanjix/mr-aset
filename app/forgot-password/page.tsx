"use client";

import Link from "next/link";
import { useState } from "react";
import LangSwitch from "@/components/LangSwitch";
import { useT } from "@/components/I18nProvider";
import { createClient } from "@/lib/supabase/client";
import { site } from "@/lib/config";

export default function ForgotPasswordPage() {
  const t = useT();
  const r = t.resetPassword;
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const { error } = await createClient().auth.resetPasswordForEmail(email.trim());
    if (error) setMessage({ ok: false, text: error.message });
    else setMessage({ ok: true, text: r.sent });
    setBusy(false);
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
        <h1 className="mt-6 text-2xl font-medium tracking-tight">{r.forgotTitle}</h1>
        <p className="mt-2 text-sm text-muted">{r.forgotText}</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          {message && (
            <p className={`text-sm ${message.ok ? "text-pen" : "text-mark"}`}>{message.text}</p>
          )}
          <button className="btn w-full" disabled={busy}>
            {busy ? t.common.wait : r.sendLink}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted">
          <Link href="/login" className="text-pen underline underline-offset-2">
            {r.backToLogin}
          </Link>
        </p>
      </div>
    </main>
  );
}