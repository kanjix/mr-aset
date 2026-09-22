"use client";

import { useRouter } from "next/navigation";
import { useT } from "@/components/I18nProvider";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton({
  className = "btn btn-ghost btn-sm",
}: {
  className?: string;
}) {
  const t = useT();
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button type="button" onClick={signOut} className={className}>
      {t.common.signOut}
    </button>
  );
}
