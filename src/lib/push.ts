import webpush from "web-push";
import { supabaseServerClient } from "@/lib/supabase/server";
import type { PushPayload } from "@/types";

let vapidConfigured = false;

function configureVapid(): boolean {
  if (vapidConfigured) return true;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    console.warn(
      "VAPID keys not configured: set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY",
    );
    return false;
  }

  webpush.setVapidDetails("mailto:support@bibliotech.app", publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

interface SubscriptionRow {
  endpoint: string;
  subscription: unknown;
}

interface DeliveryResult {
  endpoint: string;
  ok: boolean;
}

async function deliver(
  row: SubscriptionRow,
  payload: string,
): Promise<DeliveryResult> {
  try {
    await webpush.sendNotification(row.subscription as never, payload);
    return { endpoint: row.endpoint, ok: true };
  } catch (error) {
    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      typeof (error as { statusCode: unknown }).statusCode === "number"
        ? (error as { statusCode: number }).statusCode
        : undefined;

    // 404/410 → la suscripción ya no existe; la limpiamos.
    if (statusCode === 404 || statusCode === 410) {
      const supabase = await supabaseServerClient();
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("endpoint", row.endpoint);
      return { endpoint: row.endpoint, ok: false };
    }

    console.warn(`Push to ${row.endpoint} failed:`, error);
    return { endpoint: row.endpoint, ok: false };
  }
}

/**
 * Envía una notificación a todas las suscripciones push de un usuario.
 * `vapidKeysConfigured()` permite a los callers comprobar antes de intentar.
 */
export function vapidKeysConfigured(): boolean {
  return configureVapid();
}

export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
): Promise<{ sent: number; failed: number }> {
  if (!configureVapid()) return { sent: 0, failed: 0 };

  const supabase = await supabaseServerClient();
  const { data: rows, error } = await supabase
    .from("push_subscriptions")
    .select("endpoint, subscription")
    .eq("user_id", userId);

  if (error || !rows) return { sent: 0, failed: 0 };

  const serialized = JSON.stringify(payload);
  const results = await Promise.all(rows.map((row) => deliver(row, serialized)));

  return {
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
  };
}
