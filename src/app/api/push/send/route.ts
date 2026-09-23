import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { supabaseServerClient, getAuthenticatedUserId } from "@/lib/supabase/server";
import { sendPushToUser, vapidKeysConfigured } from "@/lib/push";

const payloadSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().max(300).optional(),
  url: z.string().startsWith("/").optional(),
});

/** POST /api/push/send — envía una notificación push al usuario autenticado. */
export async function POST(request: NextRequest) {
  if (!vapidKeysConfigured()) {
    return NextResponse.json(
      { error: "push_not_configured" },
      { status: 501 },
    );
  }

  const supabase = await supabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const result = await sendPushToUser(user.id, parsed.data);
  return NextResponse.json(result, { status: result.sent > 0 ? 200 : 422 });
}
