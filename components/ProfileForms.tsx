"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "@/components/I18nProvider";
import { createClient } from "@/lib/supabase/client";

type Message = { ok: boolean; text: string } | null;

function Note({ message }: { message: Message }) {
  if (!message) return null;
  return <p className={`text-sm ${message.ok ? "text-pen" : "text-mark"}`}>{message.text}</p>;
}

// Смена имени. Сохраняется через функцию update_my_profile в базе.
export function NameForm({ initialName }: { initialName: string }) {
  const t = useT().profile;
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = name.trim();
    if (!value) {
      setMessage({ ok: false, text: t.errName });
      return;
    }
    setBusy(true);
    setMessage(null);
    const { error } = await createClient().rpc("update_my_profile", { p_full_name: value });
    if (error) {
      setMessage({ ok: false, text: error.message });
    } else {
      setMessage({ ok: true, text: t.nameSaved });
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="label" htmlFor="profile-name">
          {t.fullName}
        </label>
        <input
          id="profile-name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
      </div>
      <Note message={message} />
      <button className="btn" disabled={busy}>
        {busy ? t.saving : t.saveName}
      </button>
    </form>
  );
}

// Смена почты. Supabase сам отправляет письмо со ссылкой подтверждения на новый адрес.
export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const t = useT().profile;
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setMessage({ ok: false, text: t.errEmailInvalid });
      return;
    }
    if (value === currentEmail.toLowerCase()) {
      setMessage({ ok: false, text: t.errEmailSame });
      return;
    }
    setBusy(true);
    setMessage(null);
    const { error } = await createClient().auth.updateUser({ email: value });
    if (error) {
      setMessage({ ok: false, text: error.message });
    } else {
      setMessage({ ok: true, text: t.emailSent });
      setEmail("");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="label">{t.email}</label>
        <p className="font-medium">{currentEmail}</p>
      </div>
      <div>
        <label className="label" htmlFor="profile-email">
          {t.newEmail}
        </label>
        <input
          id="profile-email"
          type="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <Note message={message} />
      <button className="btn" disabled={busy}>
        {busy ? t.saving : t.changeEmail}
      </button>
    </form>
  );
}

// Смена пароля.
export function PasswordForm() {
  const t = useT().profile;
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password.length < 6) {
      setMessage({ ok: false, text: t.errShort });
      return;
    }
    if (password !== repeat) {
      setMessage({ ok: false, text: t.errMismatch });
      return;
    }
    setBusy(true);
    setMessage(null);
    const { error } = await createClient().auth.updateUser({ password });
    if (error) {
      setMessage({ ok: false, text: error.message });
    } else {
      setMessage({ ok: true, text: t.passwordSaved });
      setPassword("");
      setRepeat("");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="label" htmlFor="new-password">
          {t.newPassword}
        </label>
        <input
          id="new-password"
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <div>
        <label className="label" htmlFor="repeat-password">
          {t.repeatPassword}
        </label>
        <input
          id="repeat-password"
          type="password"
          className="input"
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <Note message={message} />
      <button className="btn" disabled={busy}>
        {busy ? t.saving : t.changePassword}
      </button>
    </form>
  );
}