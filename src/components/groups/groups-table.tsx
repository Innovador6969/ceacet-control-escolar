"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatGroupLabel } from "@/lib/labels";

type GroupRow = {
  id: string;
  code?: string | null;
  name: string;
  description?: string | null;
  schedule?: string | null;
  capacity?: number | null;
  active: boolean;
  updatedAt: Date | string;
  academicLevel: { id: string; name: string };
  modality: { id: string; name: string };
  updatedBy?: { name: string } | null;
  _count: {
    enrollments: number;
    reEnrollments: number;
    academicAssignments: number;
    academicEvents: number;
  };
};

type GroupsTableProps = {
  groups: GroupRow[];
  canManage: boolean;
};

export function GroupsTable({ groups, canManage }: GroupsTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("Todos");
  const [modality, setModality] = useState("Todas");
  const [status, setStatus] = useState("Todos");
  const [message, setMessage] = useState("");
  const levels = Array.from(new Map(groups.map((group) => [group.academicLevel.id, group.academicLevel])).values());
  const modalities = Array.from(new Map(groups.map((group) => [group.modality.id, group.modality])).values());

  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return groups.filter((group) => {
      const label = formatGroupLabel(group).toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        label.includes(normalizedQuery) ||
        (group.code ?? "").toLowerCase().includes(normalizedQuery);

      return (
        matchesQuery &&
        (level === "Todos" || group.academicLevel.id === level) &&
        (modality === "Todas" || group.modality.id === modality) &&
        (status === "Todos" ||
          (status === "Activos" ? group.active : !group.active))
      );
    });
  }, [groups, level, modality, query, status]);

  async function toggleGroup(group: GroupRow) {
    const action = group.active ? "deactivate" : "activate";
    const warning = group.active
      ? `Vas a desactivar el grupo ${formatGroupLabel(group)}. No se modificaran relaciones historicas.`
      : `Vas a activar el grupo ${formatGroupLabel(group)}.`;

    if (!window.confirm(warning)) return;

    setMessage("");
    const response = await fetch(`/api/groups/${group.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: action })
    });
    const result = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setMessage(result?.message ?? "No fue posible actualizar el estado del grupo.");
      return;
    }

    setMessage("Estado del grupo actualizado.");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-3 rounded-lg border border-line bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar grupo o codigo"
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
          value={modality}
          onChange={(event) => setModality(event.target.value)}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
        >
          <option>Todas</option>
          {modalities.map((item) => (
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
                  "Codigo",
                  "Grupo",
                  "Horario",
                  "Capacidad",
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
              {filteredGroups.map((group) => (
                <tr key={group.id}>
                  <td className="px-4 py-4 text-sm font-semibold text-ink">{group.code ?? "Sin codigo"}</td>
                  <td className="px-4 py-4 text-sm font-bold text-ink">{formatGroupLabel(group)}</td>
                  <td className="px-4 py-4 text-sm text-muted">{group.schedule ?? "Sin horario"}</td>
                  <td className="px-4 py-4 text-sm text-muted">{group.capacity ?? "Sin limite"}</td>
                  <td className="px-4 py-4">
                    <Badge tone={group.active ? "green" : "gray"}>{group.active ? "Activo" : "Inactivo"}</Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">{group._count.enrollments}</td>
                  <td className="px-4 py-4 text-sm text-muted">{group._count.reEnrollments}</td>
                  <td className="px-4 py-4 text-sm text-muted">{group._count.academicAssignments}</td>
                  <td className="px-4 py-4 text-sm text-muted">{group._count.academicEvents}</td>
                  <td className="px-4 py-4 text-sm text-muted">{formatDate(group.updatedAt)}</td>
                  <td className="px-4 py-4 text-sm text-muted">{group.updatedBy?.name ?? "Registro anterior al modulo"}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/configuracion-academica/grupos/${group.id}`} className="text-sm font-bold text-brand-600">
                        Ver
                      </Link>
                      {canManage ? (
                        <button
                          type="button"
                          onClick={() => toggleGroup(group)}
                          className="text-sm font-bold text-ink"
                        >
                          {group.active ? "Desactivar" : "Activar"}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredGroups.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">
            No hay grupos con los filtros seleccionados.
          </div>
        ) : null}
      </section>
    </div>
  );
}
