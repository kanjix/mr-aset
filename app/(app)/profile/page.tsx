import { redirect } from "next/navigation";
import { EmailForm, NameForm, PasswordForm } from "@/components/ProfileForms";
import { getProfile } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.shell.profile };
}

export default async function ProfilePage() {
  const profile = await getProfile();
  if (!profile) redirect("/login");

  const { t } = await getI18n();
  const p = t.profile;
  const groupName: string | undefined = profile.groups?.name;

  return (
    <>
            <div className="notebook relative -mx-5 -mt-8 overflow-hidden rounded-b-md px-5 py-8 pr-16 md:-mx-10 md:-mt-12 md:px-10 md:py-12">
        <span
          aria-hidden
          className="pointer-events-none absolute right-4 top-3 select-none font-hand text-5xl text-pen/25 sm:text-6xl"
        >
          π
        </span>
        <h1 className="text-3xl font-medium tracking-tight">{t.shell.profile}</h1>
        <p className="mt-1 text-muted">{profile.full_name || profile.email}</p>
      </div>

      <section className="mt-10 border-t border-rule pt-6">
        <h2 className="text-lg font-medium">{p.personal}</h2>
        <div className="mt-4 max-w-md">
          <NameForm initialName={profile.full_name ?? ""} />
        </div>

        {profile.role === "admin" ? (
          <p className="mt-6 text-sm text-muted">{p.roleTeacher}</p>
        ) : (
          <div className="mt-6">
            <p className="label">{p.groupTitle}</p>
            {groupName ? (
              <p className="font-medium">{groupName}</p>
            ) : (
              <p className="text-muted">{p.noGroup}</p>
            )}
          </div>
        )}
      </section>

      <section className="mt-10 border-t border-rule pt-6">
        <h2 className="text-lg font-medium">{p.email}</h2>
        <div className="mt-4 max-w-md">
          <EmailForm currentEmail={profile.email ?? ""} />
        </div>
      </section>

      <section className="mt-10 border-t border-rule pt-6">
        <h2 className="text-lg font-medium">{p.passwordTitle}</h2>
        <div className="mt-4 max-w-md">
          <PasswordForm />
        </div>
      </section>
    </>
  );
}