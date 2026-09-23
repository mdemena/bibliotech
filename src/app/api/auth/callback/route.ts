import { NextResponse, type NextRequest } from "next/server";
import { supabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const locale = searchParams.get("locale") || "es";

  if (!code) {
    return NextResponse.redirect(`${origin}/${locale}/login?error=auth_failed`);
  }

  const supabase = await supabaseServerClient();
  await supabase.auth.exchangeCodeForSession(code);

  return NextResponse.redirect(`${origin}/${locale}/dashboard`);
}

export const dynamic = "force-dynamic";
