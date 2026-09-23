import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";
import { routing } from "@/i18n/routing";

/**
 * Refresca la sesión de Supabase en cada request (token rotation) y protege
 * las rutas privadas a nivel de middleware, respetando el locale actual.
 */
export default async function supabaseMiddleware(
  request: NextRequest,
  response: NextResponse,
): Promise<NextResponse> {
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value);
          }
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const entitledProtected = /\/(dashboard|books|authors|locations)(\/|$)/.test(
    request.nextUrl.pathname,
  );

  if (!user && entitledProtected) {
    const url = request.nextUrl.clone();
    const locale =
      request.nextUrl.pathname.split("/")[1] || routing.defaultLocale;
    url.pathname = `/${locale}/login`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
