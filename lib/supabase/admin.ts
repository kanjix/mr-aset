import { createClient } from "@supabase/supabase-js";

// Административный клиент. Работает только на сервере, никогда не должен
// попасть в браузер — секретный ключ даёт полный доступ к базе.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}