"use client";

import { useMemo, useState } from "react";
import { CalendarDays, List, Rows3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Option = { id: string; name: string };
type EventRow = {
  id: string;
  title: string;
  type: string;
  startsAt: string;
  endsAt: string;
  groupId: string;
  group: string;
  subject: string;
  teacher: string;
  schoolCycle: string;
};
type OccurrenceRow = {
  id: string;
  title: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  groupId: string;
  group: string;
  teacher: string;
  schoolCycle: string;
};

type AcademicCalendarViewProps = {
  events: EventRow[];
  occurrences: OccurrenceRow[];
  schoolCycles: Option[];
  groups: Option[];
  teachers: Option[];
  subjects: Option[];
};

const views = [
  { id: "month", label: "Mes", icon: CalendarDays },
  { id: "week", label: "Semana", icon: Rows3 },
  { id: "list", label: "Lista", icon: List }
];

function uniqueOptions(options: string[]) {
  return Array.from(new Set(options));
}

export function AcademicCalendarView({
  events,
  occurrences,
  schoolCycles,
  groups,
  teachers,
  subjects
}: AcademicCalendarViewProps) {
  const [view, setView] = useState("month");
  const [filters, setFilters] = useState({
    cycle: "Todos",
    group: "Todos",
    teacher: "Todos",
    subject: "Todos",
    type: "Todos"
  });

  const combined = useMemo(
    () => [
      ...events.map((event) => ({
        ...event,
        date: event.startsAt.slice(0, 10),
        time: `${event.startsAt.slice(11, 16)} - ${event.endsAt.slice(11, 16)}`
      })),
      ...occurrences.map((occurrence) => ({
        id: occurrence.id,
        title: occurrence.title,
        type: occurrence.type,
        date: occurrence.date,
        time: `${occurrence.startTime} - ${occurrence.endTime}`,
        groupId: occurrence.groupId,
        group: occurrence.group,
        teacher: occurrence.teacher,
        schoolCycle: occurrence.schoolCycle,
        subject: occurrence.title
      }))
    ],
    [events, occurrences]
  );

  const filtered = combined.filter(
    (item) =>
      (filters.cycle === "Todos" || item.schoolCycle === filters.cycle) &&
      (filters.group === "Todos" || item.groupId === filters.group) &&
      (filters.teacher === "Todos" || item.teacher === filters.teacher) &&
      (filters.subject === "Todos" || item.subject === filters.subject) &&
      (filters.type === "Todos" || item.type === filters.type)
  );

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-white p-2 shadow-sm">
        <div className="flex gap-2 overflow-x-auto">
          {views.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              className={`focus-ring flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold ${
                view === item.id
                  ? "bg-brand-600 text-white"
                  : "text-muted hover:bg-surface hover:text-ink"
              }`}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-3 rounded-lg border border-line bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-5">
        {[
          ["cycle", "Ciclo escolar", schoolCycles.map((item) => item.name)],
          ["teacher", "Docente", teachers.map((item) => item.name)],
          ["subject", "Materia", subjects.map((item) => item.name)],
          [
            "type",
            "Tipo",
            [
              "EXAM",
              "COURSE_START",
              "COURSE_END",
              "CLASS_SESSION",
              "HOLIDAY",
              "SUSPENSION",
              "GRADE_DEADLINE",
              "INSTITUTIONAL",
              "OTHER"
            ]
          ]
        ].map(([key, label, options]) => {
          const filterKey = String(key);

          return (
          <select
            key={filterKey}
            value={filters[filterKey as keyof typeof filters]}
            onChange={(event) => setFilters({ ...filters, [filterKey]: event.target.value })}
            className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
            aria-label={String(label)}
          >
            <option>Todos</option>
            {uniqueOptions(options as string[]).map((option) => (
              <option key={`${filterKey}-${option}`}>{option}</option>
            ))}
          </select>
          );
        })}
        <select
          value={filters.group}
          onChange={(event) => setFilters({ ...filters, group: event.target.value })}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
          aria-label="Grupo"
        >
          <option value="Todos">Todos</option>
          {groups.map((group) => (
            <option key={`group-${group.id}`} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </section>

      <section
        className={
          view === "list"
            ? "space-y-3"
            : "grid gap-3 md:grid-cols-2 xl:grid-cols-3"
        }
      >
        {filtered.map((item) => (
          <article
            key={item.id}
            className="rounded-lg border border-line bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-ink">{item.title}</p>
                <p className="mt-1 text-xs text-muted">
                  {item.date} · {item.time}
                </p>
              </div>
              <Badge tone={item.type === "CLASS_SESSION" ? "blue" : "yellow"}>
                {item.type}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-muted">
              Grupo {item.group || "sin grupo"} · {item.teacher || "sin docente"}
            </p>
          </article>
        ))}
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-line bg-white p-8 text-center text-sm text-muted">
          No hay eventos u ocurrencias con los filtros seleccionados.
        </div>
      ) : null}
    </div>
  );
}
