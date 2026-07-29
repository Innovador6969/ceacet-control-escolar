import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AssignmentForm } from "@/components/calendar/assignment-form";
import { requireUser } from "@/lib/auth/session";
import { getCalendarModuleData } from "@/lib/services/academic-calendar";

export default async function AcademicAssignmentsPage() {
  await requireUser();
  const data = await getCalendarModuleData();

  return (
    <div className="space-y-5">
      <Link
        href="/calendario-academico"
        className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver al calendario
      </Link>
      <div>
        <p className="text-sm font-semibold text-brand-600">
          Programacion de materias
        </p>
        <h2 className="mt-1 text-2xl font-extrabold text-ink">
          Asignaciones academicas y reglas recurrentes
        </h2>
        <p className="mt-2 text-sm text-muted">
          El sistema valida conflictos de docente, grupo y aula antes de guardar.
        </p>
      </div>
      <AssignmentForm
        subjects={data.subjects.map((item) => ({ id: item.id, name: item.name }))}
        groups={data.groups.map((item) => ({ id: item.id, name: item.name }))}
        teachers={data.teachers.map((item) => ({ id: item.id, name: item.name }))}
        classrooms={data.classrooms.map((item) => ({ id: item.id, name: item.name }))}
        academicPeriods={data.academicPeriods.map((item) => ({
          id: item.id,
          name: `${item.name} (${item.schoolCycle.name})`
        }))}
        academicLevels={data.academicLevels.map((item) => ({
          id: item.id,
          name: item.name
        }))}
        modalities={data.modalities.map((item) => ({ id: item.id, name: item.name }))}
      />
      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-ink">Asignaciones existentes</h3>
        <div className="mt-4 divide-y divide-line">
          {data.assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex flex-col justify-between gap-2 py-3 sm:flex-row sm:items-center"
            >
              <div>
                <p className="text-sm font-bold text-ink">{assignment.subject.name}</p>
                <p className="mt-1 text-xs text-muted">
                  Grupo {assignment.group.name} · {assignment.teacher.name} ·{" "}
                  {assignment.classroom?.name ?? "Sin aula"}
                </p>
              </div>
              <span className="text-xs font-semibold text-muted">
                {assignment.scheduleRules.length} regla(s)
              </span>
            </div>
          ))}
        </div>
        {data.assignments.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Aun no hay asignaciones registradas.
          </p>
        ) : null}
      </section>
    </div>
  );
}
