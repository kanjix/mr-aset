import AuthForm from "@/components/AuthForm";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.titles.login };
}

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
