import AuthForm from "@/components/AuthForm";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.titles.register };
}

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
