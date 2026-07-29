"use client";

import { useState } from "react";

type Option = { id: string; name: string };

type EventFormProps = {
  schoolCycles: Option[];
  academicPeriods: Option[];
  groups: Option[];
  subjects: Option[];
  teachers: Option[];
  classrooms: Option[];
};

export function EventForm({
  schoolCycles,
  academicPeriods,
  groups,
  subjects,
  teachers,
  classrooms
}: EventFormProps) {
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/academic-calendar/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        allDay: formData.get("allDay") === "on"
      })
    });
    const result = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    if (!response.ok) {
      setMessage(result?.message ?? "No fue posible crear el evento.");
      return;
    }

    setMessage("Evento creado. Actualiza la pagina para verlo en el calendario.");
    event.currentTarget.reset();
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-line bg-white p-5 shadow-sm"
    >
      <h3 className="text-base font-bold text-ink">Nuevo evento academico</h3>
      {message ? (
        <p className="mt-3 text-sm font-semibold text-ink">{message}</p>
      ) : null}
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <input
          name="title"
          required
          placeholder="Titulo"
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
        />
        <select
          name="type"
          required
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
        >
          <option value="">Tipo de evento</option>
          {[
            "EXAM",
            "COURSE_START",
            "COURSE_END",
            "HOLIDAY",
            "SUSPENSION",
            "GRADE_DEADLINE",
            "INSTITUTIONAL",
            "OTHER"
          ].map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <input
          name="startsAt"
          type="datetime-local"
          required
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
        />
        <input
          name="endsAt"
          type="datetime-local"
          required
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
        />
        {[
          ["schoolCycleId", "Ciclo", schoolCycles],
          ["academicPeriodId", "Periodo", academicPeriods],
          ["groupId", "Grupo", groups],
          ["subjectId", "Materia", subjects],
          ["teacherId", "Docente", teachers],
          ["classroomId", "Aula", classrooms]
        ].map(([name, label, options]) => (
          <select
            key={String(name)}
            name={String(name)}
            className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
          >
            <option value="">{String(label)}</option>
            {(options as Option[]).map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        ))}
        <label className="flex h-11 items-center gap-2 rounded-lg border border-line px-3 text-sm font-semibold text-ink">
          <input name="allDay" type="checkbox" />
          Todo el dia
        </label>
      </div>
      <textarea
        name="description"
        placeholder="Descripcion"
        className="focus-ring mt-3 w-full rounded-lg border border-line px-3 py-2 text-sm"
      />
      <button className="focus-ring mt-4 h-11 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white">
        Guardar evento
      </button>
    </form>
  );
}
