"use client";

import { useState } from "react";

type Option = { id: string; name: string };

type AssignmentFormProps = {
  subjects: Option[];
  groups: Option[];
  teachers: Option[];
  classrooms: Option[];
  academicPeriods: Option[];
  academicLevels: Option[];
  modalities: Option[];
};

export function AssignmentForm({
  subjects,
  groups,
  teachers,
  classrooms,
  academicPeriods,
  academicLevels,
  modalities
}: AssignmentFormProps) {
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setMessage("");
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/academic-assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId: payload.subjectId,
        groupId: payload.groupId,
        teacherId: payload.teacherId,
        classroomId: payload.classroomId,
        academicPeriodId: payload.academicPeriodId,
        academicLevelId: payload.academicLevelId,
        modalityId: payload.modalityId,
        rules: [
          {
            weekday: payload.weekday,
            startTime: payload.startTime,
            endTime: payload.endTime,
            startDate: payload.startDate,
            endDate: payload.endDate
          }
        ]
      })
    });
    const result = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setMessage(result?.message ?? "No fue posible crear la asignacion.");
      return;
    }

    setMessage("Asignacion creada. Actualiza la pagina para verla en calendario.");
    form.reset();
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-line bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-ink">Nueva asignacion academica</h3>
      {message ? <p className="text-sm font-semibold text-ink">{message}</p> : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[
          ["subjectId", "Materia", subjects],
          ["groupId", "Grupo", groups],
          ["teacherId", "Docente", teachers],
          ["classroomId", "Aula", classrooms],
          ["academicPeriodId", "Periodo", academicPeriods],
          ["academicLevelId", "Nivel", academicLevels],
          ["modalityId", "Programa", modalities]
        ].map(([name, label, options]) => (
          <select
            key={String(name)}
            name={String(name)}
            required={name !== "classroomId"}
            className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
          >
            <option value="">{String(label)}</option>
            {(options as Option[]).map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        ))}
        <select name="weekday" required className="focus-ring h-11 rounded-lg border border-line px-3 text-sm">
          <option value="">Dia</option>
          {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((day) => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
        <input name="startTime" type="time" required className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" />
        <input name="endTime" type="time" required className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" />
        <input name="startDate" type="date" required className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" />
        <input name="endDate" type="date" required className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" />
      </div>
      <button className="focus-ring h-11 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white">
        Guardar asignacion
      </button>
    </form>
  );
}
