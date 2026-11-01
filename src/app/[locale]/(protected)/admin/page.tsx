import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";

/** El panel admin es el dashboard del admin: /admin redirige a /dashboard. */
export default async function AdminRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!(await isAdmin())) {
    redirect(`/${locale}/dashboard`);
  }
  redirect(`/${locale}/dashboard`);
}
