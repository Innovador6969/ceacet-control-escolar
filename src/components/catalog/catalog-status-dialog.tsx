"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CatalogStatusDialogProps = {
  endpoint: string;
  active: boolean;
  disabled?: boolean;
  title: string;
  warning: string;
  successMessage: string;
  fallbackErrorMessage: string;
  onMessage: (message: string) => void;
};

export function CatalogStatusDialog({
  endpoint,
  active,
  disabled,
  title,
  warning,
  successMessage,
  fallbackErrorMessage,
  onMessage
}: CatalogStatusDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const operation = active ? "deactivate" : "activate";

  async function submit() {
    if (isSubmitting) return;

    setIsSubmitting(true);
    onMessage("");
    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation })
    });
    const result = (await response.json().catch(() => null)) as { message?: string } | null;
    setIsSubmitting(false);

    if (!response.ok) {
      onMessage(result?.message ?? fallbackErrorMessage);
      return;
    }

    setIsOpen(false);
    onMessage(successMessage);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled || isSubmitting}
        onClick={() => setIsOpen(true)}
        className="text-sm font-bold text-ink disabled:cursor-not-allowed disabled:opacity-60"
      >
        {active ? "Desactivar" : "Activar"}
      </button>
      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="catalog-status-dialog-title"
            className="w-full max-w-md rounded-lg border border-line bg-white p-5 shadow-lg"
          >
            <h3 id="catalog-status-dialog-title" className="text-base font-bold text-ink">
              {title}
            </h3>
            <p className="mt-3 text-sm text-muted">{warning}</p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsOpen(false)}
                className="focus-ring h-10 rounded-lg border border-line px-4 text-sm font-bold text-ink disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={submit}
                className="focus-ring h-10 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Procesando..." : active ? "Desactivar" : "Activar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
