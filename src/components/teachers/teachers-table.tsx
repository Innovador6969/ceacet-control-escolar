"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CatalogEmptyState } from "@/components/catalog/catalog-empty-state";
import { CatalogStatusBadge } from "@/components/catalog/catalog-status-badge";
import { CatalogStatusDialog } from "@/components/catalog/catalog-status-dialog";
import { formatDate } from "@/lib/labels";

type TeacherRow = {
  id: string;
  code?: string | null;
  name: string;
  email?: string | null;
  specialty?: string | null;
  active: boolean;
  updatedAt: Date | string;
  updatedBy?: { name: string } | null;
  _count: { academicAssignments: number; academicEvents: number };
};

type TeachersTableProps = {
  teachers: TeacherRow[];
  canManage: boolean;
};

export function TeachersTable({ teachers, canManage }: TeachersTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const [message, setMessage] = useState("");
  const filteredTeachers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return teachers.filter((teacher) => {
      const matchesQuery =
        !normalizedQuery ||
        teacher.name.toLowerCase().includes(normalizedQuery) ||
        (teacher.code ?? "").toLowerCase().includes(normalizedQuery) ||
        (teacher.email ?? "").toLowerCase().includes(normalizedQuery);

      return matchesQuery && (status === "Todos" || (status === "Activos" ? teacher.active : !teacher.active));
    });
  }, [query, status, teachers]);

  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-lg border border-line bg-white p-4 shadow-sm md:grid-cols-2">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar docente, codigo o correo" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" />
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="focus-ring h-11 rounded-lg border border-line px-3 text-sm">
          {["Todos", "Activos", "Inactivos"].map((item) => <option key={item}>{item}</option>)}
        </select>
      </section>
      {message ? <div className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm">{message}</div> : null}
      <section className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line">
            <thead className="bg-surface">
              <tr>
                {["Codigo", "Docente", "Correo", "Especialidad", "Estado", "Asignaciones", "Eventos", "Actualizado", "Usuario", "Acciones"].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-bold uppercase text-muted">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td className="px-4 py-4 text-sm font-semibold text-ink">{teacher.code ?? "Sin codigo"}</td>
                  <td className="px-4 py-4 text-sm font-bold text-ink">{teacher.name}</td>
                  <td className="px-4 py-4 text-sm text-muted">{teacher.email ?? "Sin correo"}</td>
                  <td className="px-4 py-4 text-sm text-muted">{teacher.specialty ?? "Sin especialidad"}</td>
                  <td className="px-4 py-4"><CatalogStatusBadge active={teacher.active} /></td>
                  <td className="px-4 py-4 text-sm text-muted">{teacher._count.academicAssignments}</td>
                  <td className="px-4 py-4 text-sm text-muted">{teacher._count.academicEvents}</td>
                  <td className="px-4 py-4 text-sm text-muted">{formatDate(teacher.updatedAt)}</td>
                  <td className="px-4 py-4 text-sm text-muted">{teacher.updatedBy?.name ?? "Registro anterior al modulo"}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/configuracion-academica/docentes/${teacher.id}`} className="text-sm font-bold text-brand-600">Ver</Link>
                      {canManage ? (
                        <CatalogStatusDialog
                          endpoint={`/api/teachers/${teacher.id}`}
                          active={teacher.active}
                          title={`${teacher.active ? "Desactivar" : "Activar"} docente`}
                          warning={teacher.active ? `Vas a desactivar ${teacher.name}. Tiene ${teacher._count.academicAssignments} asignacion(es).` : `Vas a activar ${teacher.name}.`}
                          successMessage="Estado del docente actualizado."
                          fallbackErrorMessage="No fue posible actualizar el docente."
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
        {filteredTeachers.length === 0 ? <CatalogEmptyState message="No hay docentes con los filtros seleccionados." /> : null}
      </section>
    </div>
  );
}
