"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/labels";

type ModalityRow = {
  id: string;
  code?: string | null;
  name: string;
  description?: string | null;
  active: boolean;
  updatedAt: Date | string;
  activeGroupCount: number;
  academicLevel: { id: string; name: string };
  updatedBy?: { name: string } | null;
  _count: {
    groups: number;
    enrollments: number;
    reEnrollments: number;
    subjects: number;
    academicAssignments: number;
    academicEvents: number;
  };
};

type ModalitiesTableProps = {
  modalities: ModalityRow[];
  canManage: boolean;
};

export function ModalitiesTable({ modalities, canManage }: ModalitiesTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("Todos");
  const [status, setStatus] = useState("Todos");
  const [message, setMessage] = useState("");
  const levels = Array.from(
    new Map(modalities.map((modality) => [modality.academicLevel.id, modality.academicLevel])).values()
  );
  const filteredModalities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return modalities.filter((modality) => {
      const matchesQuery =
        !normalizedQuery ||
        modality.name.toLowerCase().includes(normalizedQuery) ||
        (modality.code ?? "").toLowerCase().includes(normalizedQuery);

      return (
        matchesQuery &&
        (level === "Todos" || modality.academicLevel.id === level) &&
        (status === "Todos" ||
          (status === "Activas" ? modality.active : !modality.active))
      );
    });
  }, [level, modalities, query, status]);

  async function toggleModality(modality: ModalityRow) {
    const action = modality.active ? "deactivate" : "activate";
    const warning = modality.active
      ? `Vas a desactivar la modalidad ${modality.name}. Tiene ${modality._count.groups} grupo(s), ${modality._count.enrollments} inscripcion(es) y ${modality._count.reEnrollments} reinscripcion(es).`
      : `Vas a activar la modalidad ${modality.name}.`;

    if (!window.confirm(warning)) return;

    setMessage("");
    const response = await fetch(`/api/modalities/${modality.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: action })
    });
    const result = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setMessage(result?.message ?? "No fue posible actualizar el estado.");
      return;
    }

    setMessage("Estado de la modalidad actualizado.");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-lg border border-line bg-white p-4 shadow-sm md:grid-cols-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar modalidad o codigo"
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
        />
        <select
          value={level}
          onChange={(event) => setLevel(event.target.value)}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
        >
          <option>Todos</option>
          {levels.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
        >
          {["Todos", "Activas", "Inactivas"].map((item) => (
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
                  "Modalidad",
                  "Nivel",
                  "Estado",
                  "Grupos",
                  "Grupos activos",
                  "Inscripciones",
                  "Reinscripciones",
                  "Asignaciones",
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
              {filteredModalities.map((modality) => (
                <tr key={modality.id}>
                  <td className="px-4 py-4 text-sm font-semibold text-ink">{modality.code ?? "Sin codigo"}</td>
                  <td className="px-4 py-4 text-sm font-bold text-ink">{modality.name}</td>
                  <td className="px-4 py-4 text-sm text-muted">{modality.academicLevel.name}</td>
                  <td className="px-4 py-4">
                    <Badge tone={modality.active ? "green" : "gray"}>
                      {modality.active ? "Activa" : "Inactiva"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">{modality._count.groups}</td>
                  <td className="px-4 py-4 text-sm text-muted">{modality.activeGroupCount}</td>
                  <td className="px-4 py-4 text-sm text-muted">{modality._count.enrollments}</td>
                  <td className="px-4 py-4 text-sm text-muted">{modality._count.reEnrollments}</td>
                  <td className="px-4 py-4 text-sm text-muted">{modality._count.academicAssignments}</td>
                  <td className="px-4 py-4 text-sm text-muted">{formatDate(modality.updatedAt)}</td>
                  <td className="px-4 py-4 text-sm text-muted">{modality.updatedBy?.name ?? "Registro anterior al modulo"}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/configuracion-academica/modalidades/${modality.id}`} className="text-sm font-bold text-brand-600">
                        Ver
                      </Link>
                      {canManage ? (
                        <button
                          type="button"
                          onClick={() => toggleModality(modality)}
                          className="text-sm font-bold text-ink"
                        >
                          {modality.active ? "Desactivar" : "Activar"}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredModalities.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">
            No hay modalidades con los filtros seleccionados.
          </div>
        ) : null}
      </section>
    </div>
  );
}
