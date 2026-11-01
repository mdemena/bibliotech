import { setRequestLocale } from "next-intl/server";
import { supabaseServerClient } from "@/lib/supabase/server";
import { ProfileClient } from "./ProfileClient";

interface ProfileData {
  displayName: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  locale: string;
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await supabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, first_name, last_name, birth_date, locale")
    .eq("id", user.id)
    .single();

  const row = profile as unknown as {
    display_name: string | null;
    first_name: string | null;
    last_name: string | null;
    birth_date: string | null;
    locale: string | null;
  } | null;

  const data: ProfileData = {
    displayName: row?.display_name ?? user.email?.split("@")[0] ?? "",
    firstName: row?.first_name ?? "",
    lastName: row?.last_name ?? "",
    birthDate: row?.birth_date ?? "",
    locale: row?.locale ?? locale,
  };

  return <ProfileClient data={data} locale={locale} />;
}
