"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Keyboard, ScanLine } from "lucide-react";
import { useTranslations } from "next-intl";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ScannerDialog({
  open,
  onIsbn,
  onClose,
}: {
  open: boolean;
  onIsbn: (isbn: string) => void;
  onClose: () => void;
}) {
  const t = useTranslations("books");
  const [manual, setManual] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const stoppedRef = useRef(false);

  const emit = (value: string) => {
    const cleaned = value.replace(/\\D/g, "");
    if (!cleaned) return;
    onIsbn(cleaned);
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    let reader: BrowserMultiFormatReader | null = null;

    const start = async () => {
      const video = videoRef.current;
      if (!video) return;
      try {
        reader = new BrowserMultiFormatReader();
        controlsRef.current = await reader.decodeFromVideoDevice(
          undefined,
          video,
          (result) => {
            if (result && !stoppedRef.current) {
              stoppedRef.current = true;
              emit(result.getText());
            }
          },
        );
      } catch {
        setError(t("scan_permission"));
      }
    };

    const raf = requestAnimationFrame(() => void start());

    return () => {
      cancelAnimationFrame(raf);
      stoppedRef.current = false;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-[2.5rem]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <ScanLine size={22} className="text-blue-600" />
            {t("scan_title")}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="auth-error mx-8 mt-4">
            <span>{error}</span>
          </div>
        )}

        <div className="px-8 py-4">
          <p className="text-xs text-gray-500 mb-4">{t("scan_hint")}</p>

          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900 mb-4">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
            />
            <div className="absolute inset-8 border-2 border-dashed border-blue-500/60 rounded-xl pointer-events-none" />
          </div>

          <div className="flex items-center gap-3">
            <Keyboard size={16} className="text-gray-400 shrink-0" />
            <Input
              className="py-2.5"
              placeholder={t("scan_manual_placeholder")}
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="px-8 pb-8 flex justify-end">
          <Button disabled={!manual || pending} onClick={() => emit(manual)} className="shadow-xl shadow-blue-500/20">
            {t("scan_check")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
