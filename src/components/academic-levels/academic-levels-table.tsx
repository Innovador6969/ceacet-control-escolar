"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CatalogEmptyState } from "@/components/catalog/catalog-empty-state";
import { CatalogStatusBadge } from "@/components/catalog/catalog-status-badge";
import { CatalogStatusDialog } from "@/components/catalog/catalog-status-dialog";
import { formatDate } from "@/lib/labels";

type AcademicLevelRow = {
  id: string;
  code?: string | null;
  name: string;
  description?: string | null;
  displayOrder: number;
  active: boolean;
  updatedAt: Date | string;
  activeModalityCount: number;
  activeGroupCount: number;
  updatedBy?: { name: string } | null;
  _count: {
    modalities: number;
    groups: number;
    enrollments: number;
    reEnrollments: number;
    subjects: number;
    academicAssignments: number;
    academicEvents: number;
  };
};

type AcademicLevelsTableProps = {
  academicLevels: AcademicLevelRow[];
  canManage: boolean;
};

export function AcademicLevelsTable({
  academicLevels,
  canManage
}: AcademicLevelsTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const [message, setMessage] = useState("");
  const filteredLevels = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return academicLevels.filter((level) => {
      const matchesQuery =
        !normalizedQuery ||
        level.name.toLowerCase().includes(normalizedQuery) ||
        (level.code ?? "").toLowerCase().includes(normalizedQuery);

      return (
        matchesQuery &&
        (status === "Todos" || (status === "Activos" ? level.active : !level.active))
      );
    });
  }, [academicLevels, query, status]);

  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-lg border border-line bg-white p-4 shadow-sm md:grid-cols-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar nivel o codigo"
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
        />
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
                  "Nivel academico",
                  "Modalidades",
                  "Modalidades activas",
                  "Grupos",
                  "Grupos activos",
                  "Estado",
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
              {filteredLevels.map((level) => (
                <tr key={level.id}>
                  <td className="px-4 py-4 text-sm font-semibold text-ink">{level.displayOrder}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-ink">{level.code ?? "Sin codigo"}</td>
                  <td className="px-4 py-4 text-sm font-bold text-ink">{level.name}</td>
                  <td className="px-4 py-4 text-sm text-muted">{level._count.modalities}</td>
                  <td className="px-4 py-4 text-sm text-muted">{level.activeModalityCount}</td>
                  <td className="px-4 py-4 text-sm text-muted">{level._count.groups}</td>
                  <td className="px-4 py-4 text-sm text-muted">{level.activeGroupCount}</td>
                  <td className="px-4 py-4">
                    <CatalogStatusBadge active={level.active} />
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">{formatDate(level.updatedAt)}</td>
                  <td className="px-4 py-4 text-sm text-muted">{level.updatedBy?.name ?? "Registro anterior al modulo"}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/configuracion-academica/niveles-academicos/${level.id}`} className="text-sm font-bold text-brand-600">
                        Ver
                      </Link>
                      {canManage ? (
                        <CatalogStatusDialog
                          endpoint={`/api/academic-levels/${level.id}`}
                          active={level.active}
                          title={`${level.active ? "Desactivar" : "Activar"} nivel academico`}
                          warning={
                            level.active
                              ? `Vas a desactivar el nivel ${level.name}. Tiene ${level._count.modalities} modalidad(es), ${level._count.groups} grupo(s), ${level._count.enrollments} inscripcion(es) y ${level._count.reEnrollments} reinscripcion(es).`
                              : `Vas a activar el nivel ${level.name}.`
                          }
                          successMessage="Estado del nivel academico actualizado."
                          fallbackErrorMessage="No fue posible actualizar el estado."
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
        {filteredLevels.length === 0 ? (
          <CatalogEmptyState message="No hay niveles academicos con los filtros seleccionados." />
        ) : null}
      </section>
    </div>
  );
}
