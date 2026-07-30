import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { AcademicCalendarView } from "@/components/calendar/academic-calendar-view";
import { EventForm } from "@/components/calendar/event-form";
import { requireUser } from "@/lib/auth/session";
import { formatGroupLabel } from "@/lib/labels";
import { getCalendarModuleData } from "@/lib/services/academic-calendar";

export default async function AcademicCalendarPage() {
  await requireUser();
  const data = await getCalendarModuleData();

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-600">
            Calendario academico
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-ink">
            Eventos, examenes y clases recurrentes
          </h2>
          <p className="mt-2 text-sm text-muted">
            Combina eventos especiales con sesiones calculadas desde reglas de
            horario.
          </p>
        </div>
        <Link
          href="/calendario-academico/asignaciones"
          className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          Programar materias
        </Link>
      </div>
      <AcademicCalendarView
        events={data.events.map((event) => ({
          id: event.id,
          title: event.title,
          type: event.type,
          startsAt: event.startsAt.toISOString(),
          endsAt: event.endsAt.toISOString(),
          groupId: event.group?.id ?? "",
          group: event.group ? formatGroupLabel(event.group) : "",
          subject: event.subject?.name ?? "",
          teacher: event.teacher?.name ?? "",
          schoolCycle: event.schoolCycle?.name ?? ""
        }))}
        occurrences={data.occurrences}
        schoolCycles={data.schoolCycles.map((cycle) => ({
          id: cycle.id,
          name: cycle.name
        }))}
        groups={data.groups.map((group) => ({
          id: group.id,
          name: formatGroupLabel(group)
        }))}
        teachers={data.teachers.map((teacher) => ({
          id: teacher.id,
          name: teacher.name
        }))}
        subjects={data.subjects.map((subject) => ({
          id: subject.id,
          name: subject.name
        }))}
      />
      <EventForm
        schoolCycles={data.schoolCycles.map((cycle) => ({
          id: cycle.id,
          name: cycle.name
        }))}
        academicPeriods={data.academicPeriods.map((period) => ({
          id: period.id,
          name: `${period.name} (${period.schoolCycle.name})`,
          schoolCycleId: period.schoolCycleId
        }))}
        groups={data.groups.map((group) => ({
          id: group.id,
          name: formatGroupLabel(group)
        }))}
        subjects={data.subjects.map((subject) => ({
          id: subject.id,
          name: subject.name
        }))}
        teachers={data.teachers.map((teacher) => ({
          id: teacher.id,
          name: teacher.name
        }))}
        classrooms={data.classrooms.map((classroom) => ({
          id: classroom.id,
          name: classroom.name
        }))}
      />
    </div>
  );
}
