"use client";

import { useTransition } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm?: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
}: ConfirmDialogProps) {
  const [pending, startTransition] = useTransition();

  const handleConfirm = () => {
    if (!onConfirm) return;
    startTransition(() => {
      onConfirm();
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-content p-10 border-none rounded-[2rem] shadow-2xl relative overflow-hidden max-w-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="flex items-center gap-4 text-red-600 mb-6">
          <AlertTriangle size={32} />
          <DialogTitle className="text-2xl font-black">{title}</DialogTitle>
        </div>
        <DialogDescription className="text-gray-500 dark:text-gray-400 text-base mb-10 leading-relaxed font-medium">
          {description}
        </DialogDescription>
        <DialogFooter>
          <Button variant="secondary" disabled={pending} onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          {onConfirm && (
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 shadow-xl shadow-red-500/20"
              disabled={pending}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
