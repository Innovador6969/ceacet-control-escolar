"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CatalogEmptyState } from "@/components/catalog/catalog-empty-state";
import { CatalogStatusBadge } from "@/components/catalog/catalog-status-badge";
import { CatalogStatusDialog } from "@/components/catalog/catalog-status-dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/labels";

type SchoolCycleRow = {
  id: string;
  code?: string | null;
  name: string;
  description?: string | null;
  startDate: Date | string;
  endDate: Date | string;
  isActive: boolean;
  isCurrent: boolean;
  updatedAt: Date | string;
  updatedBy?: { name: string } | null;
  _count: {
    periods: number;
    enrollments: number;
    reEnrollments: number;
    academicEvents: number;
  };
};

type SchoolCyclesTableProps = {
  schoolCycles: SchoolCycleRow[];
  canManage: boolean;
};

export function SchoolCyclesTable({ schoolCycles, canManage }: SchoolCyclesTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState("");
  const filteredCycles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return schoolCycles.filter((cycle) => {
      const matchesQuery =
        !normalizedQuery ||
        cycle.name.toLowerCase().includes(normalizedQuery) ||
        (cycle.code ?? "").toLowerCase().includes(normalizedQuery);
      const matchesStatus =
        status === "Todos" ||
        (status === "Activos" && cycle.isActive) ||
        (status === "Inactivos" && !cycle.isActive) ||
        (status === "Actuales" && cycle.isCurrent);

      return matchesQuery && matchesStatus;
    });
  }, [query, schoolCycles, status]);

  async function setCurrent(cycle: SchoolCycleRow) {
    if (processingId) return;

    setProcessingId(cycle.id);
    setMessage("");
    const response = await fetch(`/api/school-cycles/${cycle.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: "set-current" })
    });
    const result = (await response.json().catch(() => null)) as { message?: string } | null;
    setProcessingId("");

    if (!response.ok) {
      setMessage(result?.message ?? "No fue posible marcar el ciclo como actual.");
      return;
    }

    setMessage("Ciclo escolar marcado como actual.");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-lg border border-line bg-white p-4 shadow-sm md:grid-cols-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar ciclo o codigo"
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
        >
          {["Todos", "Activos", "Inactivos", "Actuales"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </section>
      {message ? (
        <div className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm">
          {message}
        </div>
      ) : null}
      <section className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line">
            <thead className="bg-surface">
              <tr>
                {[
                  "Codigo",
                  "Ciclo",
                  "Fechas",
                  "Estado",
                  "Actual",
                  "Periodos",
                  "Inscripciones",
                  "Reinscripciones",
                  "Eventos",
                  "Actualizado",
                  "Usuario",
                  "Acciones"
                ].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-bold uppercase text-muted">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredCycles.map((cycle) => (
                <tr key={cycle.id}>
                  <td className="px-4 py-4 text-sm font-semibold text-ink">{cycle.code ?? "Sin codigo"}</td>
                  <td className="px-4 py-4 text-sm font-bold text-ink">{cycle.name}</td>
                  <td className="px-4 py-4 text-sm text-muted">
                    {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
                  </td>
                  <td className="px-4 py-4">
                    <CatalogStatusBadge active={cycle.isActive} />
                  </td>
                  <td className="px-4 py-4">
                    {cycle.isCurrent ? <Badge tone="blue">Actual</Badge> : <span className="text-sm text-muted">No</span>}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">{cycle._count.periods}</td>
                  <td className="px-4 py-4 text-sm text-muted">{cycle._count.enrollments}</td>
                  <td className="px-4 py-4 text-sm text-muted">{cycle._count.reEnrollments}</td>
                  <td className="px-4 py-4 text-sm text-muted">{cycle._count.academicEvents}</td>
                  <td className="px-4 py-4 text-sm text-muted">{formatDate(cycle.updatedAt)}</td>
                  <td className="px-4 py-4 text-sm text-muted">{cycle.updatedBy?.name ?? "Registro anterior al modulo"}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Link href={`/configuracion-academica/ciclos-escolares/${cycle.id}`} className="text-sm font-bold text-brand-600">
                        Ver
                      </Link>
                      {canManage && !cycle.isCurrent ? (
                        <button
                          type="button"
                          disabled={processingId === cycle.id}
                          onClick={() => setCurrent(cycle)}
                          className="text-sm font-bold text-ink disabled:opacity-60"
                        >
                          {processingId === cycle.id ? "Procesando..." : "Marcar actual"}
                        </button>
                      ) : null}
                      {canManage ? (
                        <CatalogStatusDialog
                          endpoint={`/api/school-cycles/${cycle.id}`}
                          active={cycle.isActive}
                          title={`${cycle.isActive ? "Desactivar" : "Activar"} ciclo escolar`}
                          warning={
                            cycle.isActive
                              ? `Vas a desactivar el ciclo ${cycle.name}. Tiene ${cycle._count.periods} periodo(s), ${cycle._count.enrollments} inscripcion(es) y ${cycle._count.reEnrollments} reinscripcion(es).`
                              : `Vas a activar el ciclo ${cycle.name}.`
                          }
                          successMessage="Estado del ciclo escolar actualizado."
                          fallbackErrorMessage="No fue posible actualizar el estado del ciclo."
                          onMessage={setMessage}
                        />
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredCycles.length === 0 ? (
          <CatalogEmptyState message="No hay ciclos escolares con los filtros seleccionados." />
        ) : null}
      </section>
    </div>
  );
}
