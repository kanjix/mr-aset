import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { site } from "@/lib/config";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { email, name } = await request.json();
  if (!email) return NextResponse.json({ error: "no email" }, { status: 400 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  try {
    // Одноразовая ссылка входа — ученик нажимает и сразу оказывается в кабинете.
    const admin = createAdminClient();
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${siteUrl}/dashboard` },
    });
    if (linkError || !linkData?.properties?.action_link) {
      throw new Error(linkError?.message ?? "Не удалось создать ссылку для входа");
    }
    const loginLink = linkData.properties.action_link;

    await sendEmail(
      email,
      `Заявка подтверждена — ${site.brand}`,
      `<div style="background-color:#f4f6fb;padding:32px 16px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
         <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #dde4ee;">
           <tr>
             <td style="background-color:#2544c7;padding:24px 32px;">
               <span style="color:#ffffff;font-size:18px;font-weight:600;">${site.brand}</span>
             </td>
           </tr>
           <tr>
             <td style="padding:32px;">
               <h1 style="margin:0 0 16px;font-size:22px;color:#1d2236;">Добро пожаловать!</h1>
               <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#5c6479;">
                 Здравствуйте${name ? ", " + name : ""}! Ваша заявка подтверждена, доступ к кабинету открыт.
                 Нажмите на кнопку ниже, чтобы сразу войти.
               </p>
               <table role="presentation" cellpadding="0" cellspacing="0">
                 <tr>
                   <td style="border-radius:6px;background-color:#2544c7;">
                     <a href="${loginLink}"
                        style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;">
                       Открыть личный кабинет
                     </a>
                   </td>
                 </tr>
               </table>
               <p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#8a90a3;">
                 Ссылка одноразовая и действует ограниченное время. Если она устареет, войдите на сайте обычным способом со своим паролем.
               </p>
             </td>
           </tr>
         </table>
       </div>`
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}