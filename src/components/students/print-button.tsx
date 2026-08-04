"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
    >
      <Printer className="h-4 w-4" aria-hidden="true" />
      Imprimir ficha
    </button>
  );
}
