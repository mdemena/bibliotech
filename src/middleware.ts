import type { NextRequest } from "next/server";
import createSupabaseMiddleware from "@/lib/supabase/middleware";
import { routing } from "@/i18n/routing";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request);
  return createSupabaseMiddleware(request, intlResponse);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/"],
};
