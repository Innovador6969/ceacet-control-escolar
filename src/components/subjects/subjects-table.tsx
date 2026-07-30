"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CatalogEmptyState } from "@/components/catalog/catalog-empty-state";
import { CatalogStatusBadge } from "@/components/catalog/catalog-status-badge";
import { CatalogStatusDialog } from "@/components/catalog/catalog-status-dialog";
import { formatDate } from "@/lib/labels";

type SubjectRow = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  active: boolean;
  updatedAt: Date | string;
  academicLevel: { id: string; name: string };
  modality?: { id: string; name: string } | null;
  updatedBy?: { name: string } | null;
  _count: { academicAssignments: number; academicEvents: number };
};

type SubjectsTableProps = {
  subjects: SubjectRow[];
  canManage: boolean;
};

export function SubjectsTable({ subjects, canManage }: SubjectsTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos");
  const [message, setMessage] = useState("");
  const filteredSubjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return subjects.filter((subject) => {
      const matchesQuery =
        !normalizedQuery ||
        subject.name.toLowerCase().includes(normalizedQuery) ||
        subject.code.toLowerCase().includes(normalizedQuery);

      return matchesQuery && (status === "Todos" || (status === "Activas" ? subject.active : !subject.active));
    });
  }, [query, status, subjects]);

  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-lg border border-line bg-white p-4 shadow-sm md:grid-cols-2">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar materia o codigo" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" />
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="focus-ring h-11 rounded-lg border border-line px-3 text-sm">
          {["Todos", "Activas", "Inactivas"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </section>
      {message ? <div className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm">{message}</div> : null}
      <section className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line">
            <thead className="bg-surface">
              <tr>
                {["Codigo", "Materia", "Nivel", "Modalidad", "Estado", "Asignaciones", "Eventos", "Actualizado", "Usuario", "Acciones"].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-bold uppercase text-muted">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredSubjects.map((subject) => (
                <tr key={subject.id}>
                  <td className="px-4 py-4 text-sm font-semibold text-ink">{subject.code}</td>
                  <td className="px-4 py-4 text-sm font-bold text-ink">{subject.name}</td>
                  <td className="px-4 py-4 text-sm text-muted">{subject.academicLevel.name}</td>
                  <td className="px-4 py-4 text-sm text-muted">{subject.modality?.name ?? "General"}</td>
                  <td className="px-4 py-4"><CatalogStatusBadge active={subject.active} /></td>
                  <td className="px-4 py-4 text-sm text-muted">{subject._count.academicAssignments}</td>
                  <td className="px-4 py-4 text-sm text-muted">{subject._count.academicEvents}</td>
                  <td className="px-4 py-4 text-sm text-muted">{formatDate(subject.updatedAt)}</td>
                  <td className="px-4 py-4 text-sm text-muted">{subject.updatedBy?.name ?? "Registro anterior al modulo"}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/configuracion-academica/materias/${subject.id}`} className="text-sm font-bold text-brand-600">Ver</Link>
                      {canManage ? (
                        <CatalogStatusDialog
                          endpoint={`/api/subjects/${subject.id}`}
                          active={subject.active}
                          title={`${subject.active ? "Desactivar" : "Activar"} materia`}
                          warning={subject.active ? `Vas a desactivar ${subject.name}. Tiene ${subject._count.academicAssignments} asignacion(es).` : `Vas a activar ${subject.name}.`}
                          successMessage="Estado de la materia actualizado."
                          fallbackErrorMessage="No fue posible actualizar la materia."
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
        {filteredSubjects.length === 0 ? <CatalogEmptyState message="No hay materias con los filtros seleccionados." /> : null}
      </section>
    </div>
  );
}
