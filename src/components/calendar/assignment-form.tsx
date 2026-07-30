"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Option = { id: string; name: string };
type GroupOption = Option & {
  academicLevel: { name: string };
  modality: { name: string };
};

type AssignmentFormProps = {
  subjects: Option[];
  groups: GroupOption[];
  teachers: Option[];
  classrooms: Option[];
  academicPeriods: Option[];
};

export function AssignmentForm({
  subjects,
  groups,
  teachers,
  classrooms,
  academicPeriods
}: AssignmentFormProps) {
  const [message, setMessage] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const missingSubjects = subjects.length === 0;
  const missingTeachers = teachers.length === 0;
  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId),
    [groups, selectedGroupId]
  );

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
    setSelectedGroupId("");
    form.reset();
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-line bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-ink">Nueva asignacion academica</h3>
      {message ? <p className="text-sm font-semibold text-ink">{message}</p> : null}
      {missingSubjects || missingTeachers || classrooms.length === 0 ? (
        <div className="mt-3 grid gap-2 text-sm text-muted">
          {missingSubjects ? (
            <p>
              No hay materias activas disponibles.{" "}
              <Link href="/configuracion-academica/materias" className="font-bold text-brand-600">Administrar materias</Link>
            </p>
          ) : null}
          {missingTeachers ? (
            <p>
              No hay docentes activos disponibles.{" "}
              <Link href="/configuracion-academica/docentes" className="font-bold text-brand-600">Administrar docentes</Link>
            </p>
          ) : null}
          {classrooms.length === 0 ? (
            <p>
              No hay aulas activas disponibles. El aula es opcional para esta asignacion.
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <select
          name="groupId"
          required
          value={selectedGroupId}
          onChange={(event) => setSelectedGroupId(event.target.value)}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm"
        >
          <option value="">Grupo</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
        {selectedGroup ? (
          <div className="rounded-lg border border-line bg-surface px-3 py-2 text-sm md:col-span-2">
            <p className="font-semibold text-ink">Nivel Academico:</p>
            <p className="text-muted">{selectedGroup.academicLevel.name}</p>
            <p className="mt-2 font-semibold text-ink">Programa:</p>
            <p className="text-muted">{selectedGroup.modality.name}</p>
          </div>
        ) : null}
        {[
          ["subjectId", "Materia", subjects],
          ["teacherId", "Docente", teachers],
          ["classroomId", "Aula", classrooms],
          ["academicPeriodId", "Periodo", academicPeriods]
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
      <button
        disabled={missingSubjects || missingTeachers}
        className="focus-ring h-11 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        Guardar asignacion
      </button>
    </form>
  );
}
