"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CatalogEmptyState } from "@/components/catalog/catalog-empty-state";
import { CatalogStatusBadge } from "@/components/catalog/catalog-status-badge";
import { CatalogStatusDialog } from "@/components/catalog/catalog-status-dialog";
import { formatDate } from "@/lib/labels";

type AcademicPeriodRow = {
  id: string;
  code?: string | null;
  name: string;
  description?: string | null;
  schoolCycleId: string;
  displayOrder: number;
  startDate: Date | string;
  endDate: Date | string;
  isActive: boolean;
  schoolCycle: { id: string; name: string };
  updatedAt: Date | string;
  updatedBy?: { name: string } | null;
  _count: {
    enrollments: number;
    reEnrollments: number;
    academicAssignments: number;
    academicEvents: number;
  };
};

type AcademicPeriodsTableProps = {
  academicPeriods: AcademicPeriodRow[];
  canManage: boolean;
};

export function AcademicPeriodsTable({
  academicPeriods,
  canManage
}: AcademicPeriodsTableProps) {
  const [query, setQuery] = useState("");
  const [cycleId, setCycleId] = useState("Todos");
  const [status, setStatus] = useState("Todos");
  const [message, setMessage] = useState("");
  const cycles = Array.from(
    new Map(academicPeriods.map((period) => [period.schoolCycle.id, period.schoolCycle])).values()
  );
  const filteredPeriods = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return academicPeriods.filter((period) => {
      const matchesQuery =
        !normalizedQuery ||
        period.name.toLowerCase().includes(normalizedQuery) ||
        (period.code ?? "").toLowerCase().includes(normalizedQuery);

      return (
        matchesQuery &&
        (cycleId === "Todos" || period.schoolCycleId === cycleId) &&
        (status === "Todos" || (status === "Activos" ? period.isActive : !period.isActive))
      );
    });
  }, [academicPeriods, cycleId, query, status]);

  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-lg border border-line bg-white p-4 shadow-sm md:grid-cols-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar periodo o codigo"
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
        />
        <select
          value={cycleId}
          onChange={(event) => setCycleId(event.target.value)}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
        >
          <option>Todos</option>
          {cycles.map((cycle) => (
            <option key={cycle.id} value={cycle.id}>
              {cycle.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
        >
          {["Todos", "Activos", "Inactivos"].map((item) => (
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
                  "Orden",
                  "Codigo",
                  "Periodo",
                  "Ciclo",
                  "Fechas",
                  "Estado",
                  "Inscripciones",
                  "Reinscripciones",
                  "Asignaciones",
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
              {filteredPeriods.map((period) => (
                <tr key={period.id}>
                  <td className="px-4 py-4 text-sm font-semibold text-ink">{period.displayOrder}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-ink">{period.code ?? "Sin codigo"}</td>
                  <td className="px-4 py-4 text-sm font-bold text-ink">{period.name}</td>
                  <td className="px-4 py-4 text-sm text-muted">{period.schoolCycle.name}</td>
                  <td className="px-4 py-4 text-sm text-muted">
                    {formatDate(period.startDate)} - {formatDate(period.endDate)}
                  </td>
                  <td className="px-4 py-4">
                    <CatalogStatusBadge active={period.isActive} />
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">{period._count.enrollments}</td>
                  <td className="px-4 py-4 text-sm text-muted">{period._count.reEnrollments}</td>
                  <td className="px-4 py-4 text-sm text-muted">{period._count.academicAssignments}</td>
                  <td className="px-4 py-4 text-sm text-muted">{period._count.academicEvents}</td>
                  <td className="px-4 py-4 text-sm text-muted">{formatDate(period.updatedAt)}</td>
                  <td className="px-4 py-4 text-sm text-muted">{period.updatedBy?.name ?? "Registro anterior al modulo"}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/configuracion-academica/periodos-academicos/${period.id}`} className="text-sm font-bold text-brand-600">
                        Ver
                      </Link>
                      {canManage ? (
                        <CatalogStatusDialog
                          endpoint={`/api/academic-periods/${period.id}`}
                          active={period.isActive}
                          title={`${period.isActive ? "Desactivar" : "Activar"} periodo academico`}
                          warning={
                            period.isActive
                              ? `Vas a desactivar el periodo ${period.name}. Tiene ${period._count.enrollments} inscripcion(es), ${period._count.reEnrollments} reinscripcion(es) y ${period._count.academicAssignments} asignacion(es).`
                              : `Vas a activar el periodo ${period.name}.`
                          }
                          successMessage="Estado del periodo academico actualizado."
                          fallbackErrorMessage="No fue posible actualizar el estado del periodo."
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
        {filteredPeriods.length === 0 ? (
          <CatalogEmptyState message="No hay periodos academicos con los filtros seleccionados." />
        ) : null}
      </section>
    </div>
  );
}
