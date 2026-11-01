import { NextResponse, type NextRequest } from "next/server";
import { supabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const locale = searchParams.get("locale") || "es";

  const supabase = await supabaseServerClient();

  if (!code) {
    return NextResponse.redirect(`${origin}/${locale}/login?error=auth_failed`);
  }

  await supabase.auth.exchangeCodeForSession(code);

  // Redirigir al idioma guardado del usuario (si lo tiene)
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("locale")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  const target = (profile?.locale as string | null) ?? locale;

  return NextResponse.redirect(`${origin}/${target}/dashboard`);
}

export const dynamic = "force-dynamic";
