"use client";

import type { Prisma } from "@prisma/client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatDate } from "@/lib/labels";

type AuditValue = string | number | boolean | null | undefined;

type AuditEntry = {
  id: string;
  action: string;
  createdAt: Date | string;
  previousData?: Prisma.JsonValue;
  newData?: Prisma.JsonValue;
  metadata?: Prisma.JsonValue;
  user?: { name: string; email: string } | null;
};

type AcademicLevelAuditHistoryProps = {
  entries: AuditEntry[];
};

const fieldLabels: Record<string, string> = {
  code: "Codigo",
  name: "Nombre",
  description: "Descripcion",
  displayOrder: "Orden",
  active: "Estado"
};

function asRecord(value: Prisma.JsonValue | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, AuditValue | string[]>;
}

function valueLabel(value: AuditValue | string[]) {
  if (Array.isArray(value)) return value.join(", ");
  if (value === undefined || value === null || value === "") return "Sin valor";
  if (typeof value === "boolean") return value ? "Activo" : "Inactivo";
  return String(value);
}

function changedFields(entry: AuditEntry) {
  const metadata = asRecord(entry.metadata);
  const fields = metadata.changedFields;

  if (Array.isArray(fields) && fields.length > 0) {
    return fields.filter((field): field is string => typeof field === "string");
  }

  return Object.keys(asRecord(entry.newData));
}

export function AcademicLevelAuditHistory({
  entries
}: AcademicLevelAuditHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
        className="focus-ring flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-base font-bold text-ink">
          Historial de auditoria ({entries.length})
        </span>
        <ChevronDown
          className={`h-5 w-5 text-muted transition ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {isOpen ? (
        <div className="mt-4 divide-y divide-line">
          {entries.map((entry) => (
            <div key={entry.id} className="py-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row">
                <div>
                  <p className="text-sm font-bold text-ink">{entry.action}</p>
                  <p className="mt-1 text-xs text-muted">
                    {entry.user ? `${entry.user.name} (${entry.user.email})` : "No disponible"}
                  </p>
                </div>
                <span className="text-xs font-semibold text-muted">
                  {formatDate(entry.createdAt)}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {changedFields(entry).map((field) => {
                  const previousData = asRecord(entry.previousData);
                  const newData = asRecord(entry.newData);

                  return (
                    <div key={`${entry.id}-${field}`} className="rounded-lg border border-line px-3 py-2 text-sm">
                      <span className="font-bold text-ink">{fieldLabels[field] ?? field}: </span>
                      <span className="text-muted">{valueLabel(previousData[field])}</span>
                      <span className="px-2 text-muted">-&gt;</span>
                      <span className="text-ink">{valueLabel(newData[field])}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {entries.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              No hay eventos de auditoria para este nivel academico.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
