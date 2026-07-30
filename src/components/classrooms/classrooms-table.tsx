"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CatalogEmptyState } from "@/components/catalog/catalog-empty-state";
import { CatalogStatusBadge } from "@/components/catalog/catalog-status-badge";
import { CatalogStatusDialog } from "@/components/catalog/catalog-status-dialog";
import { formatDate } from "@/lib/labels";

type ClassroomRow = {
  id: string;
  code?: string | null;
  name: string;
  location?: string | null;
  capacity?: number | null;
  active: boolean;
  updatedAt: Date | string;
  updatedBy?: { name: string } | null;
  _count: { academicAssignments: number; academicEvents: number };
};

type ClassroomsTableProps = {
  classrooms: ClassroomRow[];
  canManage: boolean;
};

export function ClassroomsTable({ classrooms, canManage }: ClassroomsTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const [message, setMessage] = useState("");
  const filteredClassrooms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return classrooms.filter((classroom) => {
      const matchesQuery =
        !normalizedQuery ||
        classroom.name.toLowerCase().includes(normalizedQuery) ||
        (classroom.code ?? "").toLowerCase().includes(normalizedQuery) ||
        (classroom.location ?? "").toLowerCase().includes(normalizedQuery);

      return matchesQuery && (status === "Todos" || (status === "Activas" ? classroom.active : !classroom.active));
    });
  }, [classrooms, query, status]);

  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-lg border border-line bg-white p-4 shadow-sm md:grid-cols-2">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar aula, codigo o ubicacion" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" />
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="focus-ring h-11 rounded-lg border border-line px-3 text-sm">
          {["Todos", "Activas", "Inactivas"].map((item) => <option key={item}>{item}</option>)}
        </select>
      </section>
      {message ? <div className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm">{message}</div> : null}
      <section className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line">
            <thead className="bg-surface">
              <tr>
                {["Codigo", "Aula", "Ubicacion", "Capacidad", "Estado", "Asignaciones", "Eventos", "Actualizado", "Usuario", "Acciones"].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-bold uppercase text-muted">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredClassrooms.map((classroom) => (
                <tr key={classroom.id}>
                  <td className="px-4 py-4 text-sm font-semibold text-ink">{classroom.code ?? "Sin codigo"}</td>
                  <td className="px-4 py-4 text-sm font-bold text-ink">{classroom.name}</td>
                  <td className="px-4 py-4 text-sm text-muted">{classroom.location ?? "Sin ubicacion"}</td>
                  <td className="px-4 py-4 text-sm text-muted">{classroom.capacity ?? "Sin capacidad"}</td>
                  <td className="px-4 py-4"><CatalogStatusBadge active={classroom.active} /></td>
                  <td className="px-4 py-4 text-sm text-muted">{classroom._count.academicAssignments}</td>
                  <td className="px-4 py-4 text-sm text-muted">{classroom._count.academicEvents}</td>
                  <td className="px-4 py-4 text-sm text-muted">{formatDate(classroom.updatedAt)}</td>
                  <td className="px-4 py-4 text-sm text-muted">{classroom.updatedBy?.name ?? "Registro anterior al modulo"}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/configuracion-academica/aulas/${classroom.id}`} className="text-sm font-bold text-brand-600">Ver</Link>
                      {canManage ? (
                        <CatalogStatusDialog
                          endpoint={`/api/classrooms/${classroom.id}`}
                          active={classroom.active}
                          title={`${classroom.active ? "Desactivar" : "Activar"} aula`}
                          warning={classroom.active ? `Vas a desactivar ${classroom.name}. Tiene ${classroom._count.academicAssignments} asignacion(es).` : `Vas a activar ${classroom.name}.`}
                          successMessage="Estado del aula actualizado."
                          fallbackErrorMessage="No fue posible actualizar el aula."
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
        {filteredClassrooms.length === 0 ? <CatalogEmptyState message="No hay aulas con los filtros seleccionados." /> : null}
      </section>
    </div>
  );
}
