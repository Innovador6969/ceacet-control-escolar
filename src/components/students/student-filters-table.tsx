"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/labels";

type StudentFiltersTableProps = {
  students: Array<{
    id: string;
    fullName: string;
    enrollmentNumber: string;
    academicLevel: string;
    modality: string;
    groupId: string;
    group: string;
    phone: string;
    paymentStatus: string;
    documentStatus: string;
    administrativeStatus: string;
    balance: number;
  }>;
  levels: string[];
  modalities: string[];
  groups: Array<{ id: string; name: string }>;
  statuses: string[];
};

export function StudentFiltersTable({
  students,
  levels,
  modalities,
  groups,
  statuses
}: StudentFiltersTableProps) {
  const [nameQuery, setNameQuery] = useState("");
  const [enrollmentQuery, setEnrollmentQuery] = useState("");
  const [level, setLevel] = useState("Todos");
  const [modality, setModality] = useState("Todas");
  const [group, setGroup] = useState("Todos");
  const [status, setStatus] = useState("Todos");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filteredStudents = useMemo(() => {
    const normalizedNameQuery = nameQuery.trim().toLowerCase();
    const normalizedEnrollmentQuery = enrollmentQuery.trim().toLowerCase();

    return students.filter((student) => {
      const matchesName =
        normalizedNameQuery.length === 0 ||
        student.fullName.toLowerCase().includes(normalizedNameQuery);
      const matchesEnrollment =
        normalizedEnrollmentQuery.length === 0 ||
        student.enrollmentNumber.toLowerCase().includes(normalizedEnrollmentQuery);

      return (
        matchesName &&
        matchesEnrollment &&
        (level === "Todos" || student.academicLevel === level) &&
        (modality === "Todas" || student.modality === modality) &&
        (group === "Todos" || student.groupId === group) &&
        (status === "Todos" || student.administrativeStatus === status)
      );
    });
  }, [enrollmentQuery, group, level, modality, nameQuery, status, students]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-lg border border-line bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-6">
        <label className="flex h-11 items-center gap-2 rounded-lg border border-line px-3 xl:col-span-2">
          <Search className="h-4 w-4 text-muted" aria-hidden="true" />
          <input
            value={nameQuery}
            onChange={(event) => {
              setNameQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nombre"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        <label className="flex h-11 items-center gap-2 rounded-lg border border-line px-3">
          <Search className="h-4 w-4 text-muted" aria-hidden="true" />
          <input
            value={enrollmentQuery}
            onChange={(event) => {
              setEnrollmentQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Matricula"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        <select
          value={level}
          onChange={(event) => setLevel(event.target.value)}
          className="focus-ring h-11 rounded-lg border border-line bg-white px-3 text-sm"
          aria-label="Filtrar por nivel"
        >
          <option>Todos</option>
          {levels.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          value={modality}
          onChange={(event) => setModality(event.target.value)}
          className="focus-ring h-11 rounded-lg border border-line bg-white px-3 text-sm"
          aria-label="Filtrar por modalidad"
        >
          <option>Todas</option>
          {modalities.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          value={group}
          onChange={(event) => setGroup(event.target.value)}
          className="focus-ring h-11 rounded-lg border border-line bg-white px-3 text-sm"
          aria-label="Filtrar por grupo"
        >
          <option>Todos</option>
          {groups.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="focus-ring h-11 rounded-lg border border-line bg-white px-3 text-sm"
          aria-label="Filtrar por estado"
        >
          <option>Todos</option>
          {statuses.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-line">
            <thead className="bg-surface">
              <tr>
                {[
                  "Alumno",
                  "Matricula",
                  "Nivel",
                  "Modalidad",
                  "Grupo",
                  "Telefono",
                  "Pagos",
                  "Documentos",
                  "Administrativo",
                  "Acciones"
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-bold uppercase text-muted"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visibleStudents.map((student) => (
                <tr key={student.id} className="hover:bg-surface/60">
                  <td className="px-4 py-4">
                    <p className="whitespace-nowrap text-sm font-bold text-ink">
                      {student.fullName}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Adeudo: {formatMoney(student.balance)}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-ink">
                    {student.enrollmentNumber}
                  </td>
                  <td className="px-4 py-4 text-sm text-ink">
                    {student.academicLevel}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">
                    {student.modality}
                  </td>
                  <td className="px-4 py-4 text-sm text-ink">
                    {student.group}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">
                    {student.phone || "Sin telefono"}
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      tone={
                        student.paymentStatus === "Con adeudo"
                          ? "red"
                          : student.paymentStatus === "Al corriente"
                            ? "green"
                            : "blue"
                      }
                    >
                      {student.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      tone={
                        student.documentStatus === "Completo" ? "green" : "yellow"
                      }
                    >
                      {student.documentStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      tone={
                        student.administrativeStatus === "Con adeudo"
                          ? "red"
                          : student.administrativeStatus === "Baja temporal"
                            ? "yellow"
                            : "blue"
                      }
                    >
                      {student.administrativeStatus}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/alumnos/${student.id}`}
                      className="text-sm font-bold text-brand-600 hover:text-brand-700"
                    >
                      Ver expediente
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">
            No hay alumnos que coincidan con los filtros seleccionados.
          </div>
        ) : null}
      </div>
      <div className="flex flex-col justify-between gap-3 rounded-lg border border-line bg-white px-4 py-3 text-sm text-muted sm:flex-row sm:items-center">
        <span>
          Mostrando {visibleStudents.length} de {filteredStudents.length} alumnos
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={currentPage === 1}
            className="focus-ring h-9 rounded-lg border border-line px-3 font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="font-semibold text-ink">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={currentPage === totalPages}
            className="focus-ring h-9 rounded-lg border border-line px-3 font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
