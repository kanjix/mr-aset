"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LangSwitch from "@/components/LangSwitch";
import { useT } from "@/components/I18nProvider";
import { createClient } from "@/lib/supabase/client";
import { site } from "@/lib/config";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const t = useT();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const isLogin = mode === "login";

  // Переводим типичные ответы Supabase на язык сайта
  function translate(message: string) {
    const m = message.toLowerCase();
    if (m.includes("invalid login")) return t.auth.errInvalid;
    if (m.includes("already registered")) return t.auth.errExists;
    if (m.includes("at least")) return t.auth.errShort;
    if (m.includes("email not confirmed")) return t.auth.errUnconfirmed;
    if (m.includes("rate limit")) return t.auth.errRate;
    return message;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const fullName = String(fd.get("full_name") ?? "").trim();

    setBusy(true);
    setError(null);
    setInfo(null);

    const supabase = createClient();

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(translate(error.message));
        setBusy(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      setError(translate(error.message));
      setBusy(false);
      return;
    }
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setInfo(t.auth.checkEmail);
      setBusy(false);
    }
  }

  return (
    <main className="notebook relative flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="absolute right-4 top-4">
        <LangSwitch />
      </div>

      <div className="w-full max-w-sm rounded-md border border-rule bg-paper p-7 shadow-[0_1px_0_var(--rule)]">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          {site.brand}
        </Link>
        <h1 className="mt-6 text-2xl font-medium tracking-tight">
          {isLogin ? t.auth.loginTitle : t.auth.registerTitle}
        </h1>
        {!isLogin && <p className="mt-2 text-sm text-muted">{t.auth.registerHint}</p>}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {!isLogin && (
            <div>
              <label className="label" htmlFor="full_name">
                {t.auth.fullName}
              </label>
              <input
                id="full_name"
                name="full_name"
                className="input"
                required
                autoComplete="name"
              />
            </div>
          )}
          <div>
            <label className="label" htmlFor="email">
              {t.auth.email}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              {t.auth.password}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              required
              minLength={6}
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          {error && <p className="text-sm text-mark">{error}</p>}
          {info && <p className="text-sm text-pen">{info}</p>}

          <button type="submit" className="btn w-full" disabled={busy}>
            {busy ? t.common.wait : isLogin ? t.auth.submitLogin : t.auth.submitRegister}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted">
          {isLogin ? (
            <>
              {t.auth.noAccount}{" "}
              <Link href="/register" className="text-pen underline underline-offset-2">
                {t.auth.signUpLink}
              </Link>
            </>
          ) : (
            <>
              {t.auth.haveAccount}{" "}
              <Link href="/login" className="text-pen underline underline-offset-2">
                {t.auth.signInLink}
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
