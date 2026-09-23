import { setRequestLocale } from "next-intl/server";
import { supabaseServerClient } from "@/lib/supabase/server";
import { HomeClient } from "./HomeClient";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await supabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return <HomeClient authenticated={!!user} />;
}
