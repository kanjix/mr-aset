import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Профиль текущего пользователя (кэшируется на время одного запроса).
export const getProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*, groups(name)")
    .eq("id", user.id)
    .maybeSingle();

  return data;
});
