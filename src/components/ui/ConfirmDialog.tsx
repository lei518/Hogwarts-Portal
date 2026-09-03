import { useEffect } from "react";
import { Button } from "./Button";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 bg-void/85 flex items-center justify-center px-6"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div className="w-full max-w-sm border border-ember/40 rounded-sm bg-ink p-8 text-center">
        <h2 id="confirm-dialog-title" className="text-2xl font-display text-gold-bright mb-2">
          {title}
        </h2>
        <p id="confirm-dialog-message" className="text-parchment-dim text-sm mb-8">
          {message}
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onCancel} autoFocus>
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            className="flex-1 bg-ember! border-ember! hover:bg-ember/80!"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
