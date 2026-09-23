"use server";

import type { Json } from "@/types/database.types";
import { supabaseServerClient, getAuthenticatedUserId } from "@/lib/supabase/server";

interface PushSubscriptionJSON {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function savePushSubscription(
  subscription: PushSubscriptionJSON,
): Promise<{ error: string | null }> {
  try {
    const supabase = await supabaseServerClient();
    const userId = await getAuthenticatedUserId();

    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        endpoint: subscription.endpoint,
        user_id: userId,
        subscription: subscription as unknown as Json,
      },
      { onConflict: "endpoint" },
    );
    if (error) return { error: error.message };
    return { error: null };
  } catch {
    return { error: "No authenticated" };
  }
}
