"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    void navigator.serviceWorker.register("/sw.js");
  }, []);

  return null;
}
