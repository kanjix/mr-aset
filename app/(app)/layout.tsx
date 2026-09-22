import { redirect } from "next/navigation";
import LangSwitch from "@/components/LangSwitch";
import Shell from "@/components/Shell";
import SignOutButton from "@/components/SignOutButton";
import { getProfile } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";
import { hasSupabaseEnv } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseEnv()) {
    return (
      <main className="mx-auto max-w-lg px-6 py-20">
        <h1 className="text-2xl font-medium">Осталось подключить Supabase</h1>
        <p className="mt-3 text-muted">
          Создайте файл .env.local по образцу .env.local.example, вставьте туда адрес проекта и
          ключ из Supabase и перезапустите сайт.
        </p>
      </main>
    );
  }

  const profile = await getProfile();
  if (!profile) redirect("/login");

  const { t } = await getI18n();
  const isAdmin = profile.role === "admin";
  const approved = profile.status === "approved";

  if (!isAdmin && !approved) {
    const blocked = profile.status === "blocked";
    return (
      <main className="notebook relative flex min-h-dvh items-center justify-center px-6">
        <div className="absolute right-4 top-4">
          <LangSwitch />
        </div>
        <div className="w-full max-w-sm rounded-md border border-rule bg-paper p-7">
          <h1 className="text-2xl font-medium tracking-tight">
            {blocked ? t.pending.blockedTitle : t.pending.title}
          </h1>
          <p className="mt-3 text-sm text-muted">
            {blocked ? t.pending.blockedText : t.pending.text}
          </p>
          <div className="mt-6">
            <SignOutButton />
          </div>
        </div>
      </main>
    );
  }

  return (
    <Shell
      role={profile.role}
      name={profile.full_name || profile.email || ""}
      groupName={profile.groups?.name ?? null}
    >
      {children}
    </Shell>
  );
}
