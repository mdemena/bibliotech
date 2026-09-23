"use client";

import { useEffect, useTransition } from "react";
import { savePushSubscription } from "@/lib/actions/push";

export function ServiceWorkerRegistrar() {
  const [, startTransition] = useTransition();

  useEffect(() => {
    async function registerAndSubscribe() {
      if (!("serviceWorker" in navigator)) return;

      try {
        const registration = await navigator.serviceWorker.register("/sw.js");

        const applicationServerKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!applicationServerKey || !("PushManager" in window)) return;

        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const existing = await registration.pushManager.getSubscription();
        const encode = (base64String: string): ArrayBuffer => {
          const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
          const base64 = (base64String + padding)
            .replace(/-/g, "+")
            .replace(/_/g, "/");
          const raw = atob(base64);
          const output = new Uint8Array(new ArrayBuffer(raw.length));
          for (let i = 0; i < raw.length; i += 1) {
            output[i] = raw.charCodeAt(i);
          }
          return output.buffer;
        };

        const subscription =
          existing ??
          (await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: encode(applicationServerKey),
          }));

        const subscriptionJson = subscription.toJSON();
        if (!subscriptionJson.endpoint) return;

        startTransition(() => void savePushSubscription(subscriptionJson as never));
      } catch (error) {
        console.warn("Service worker / push registration failed:", error);
      }
    }

    void registerAndSubscribe();
  }, [startTransition]);

  return null;
}
