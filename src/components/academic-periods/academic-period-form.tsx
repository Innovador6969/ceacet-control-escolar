"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SchoolCycleOption = {
  id: string;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  isActive: boolean;
};

type AcademicPeriodFormData = {
  id?: string;
  code?: string | null;
  name?: string;
  description?: string | null;
  schoolCycleId?: string;
  displayOrder?: number;
  startDate?: Date | string;
  endDate?: Date | string;
  isActive?: boolean;
};

type AcademicPeriodFormProps = {
  academicPeriod?: AcademicPeriodFormData;
  schoolCycles: SchoolCycleOption[];
  canManage: boolean;
};

function inputDate(value?: Date | string) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function dateLabel(value: Date | string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function AcademicPeriodForm({
  academicPeriod,
  schoolCycles,
  canManage
}: AcademicPeriodFormProps) {
  const router = useRouter();
  const [selectedCycleId, setSelectedCycleId] = useState(academicPeriod?.schoolCycleId ?? "");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const selectedCycle = useMemo(
    () => schoolCycles.find((cycle) => cycle.id === selectedCycleId),
    [schoolCycles, selectedCycleId]
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    setMessage("");
    setIsSaving(true);
    const formData = new FormData(event.currentTarget);
    const payload = {
      code: formData.get("code"),
      name: formData.get("name"),
      description: formData.get("description"),
      schoolCycleId: selectedCycleId,
      displayOrder: formData.get("displayOrder"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      isActive: formData.get("isActive") === "on"
    };
    const endpoint = academicPeriod?.id
      ? `/api/academic-periods/${academicPeriod.id}`
      : "/api/academic-periods";
    const response = await fetch(endpoint, {
      method: academicPeriod?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = (await response.json().catch(() => null)) as {
      id?: string;
      message?: string;
    } | null;
    setIsSaving(false);

    if (!response.ok) {
      setMessage(result?.message ?? "No fue posible guardar el periodo academico.");
      return;
    }

    setMessage("Periodo academico guardado correctamente.");

    if (!academicPeriod?.id && result?.id) {
      router.push(`/configuracion-academica/periodos-academicos/${result.id}`);
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-ink">
          {academicPeriod?.id ? "Editar periodo academico" : "Nuevo periodo academico"}
        </h3>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={academicPeriod?.isActive ?? true}
            disabled={!canManage}
          />
          Activo
        </label>
      </div>
      {message ? <p className="mt-3 text-sm font-semibold text-ink">{message}</p> : null}
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <input
          name="code"
          defaultValue={academicPeriod?.code ?? ""}
          placeholder="Codigo"
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        />
        <input
          name="name"
          defaultValue={academicPeriod?.name ?? ""}
          placeholder="Nombre"
          required
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        />
        <input
          name="displayOrder"
          type="number"
          min={1}
          step={1}
          defaultValue={academicPeriod?.displayOrder ?? 1}
          placeholder="Orden"
          required
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        />
        <select
          name="schoolCycleId"
          value={selectedCycleId}
          onChange={(event) => setSelectedCycleId(event.target.value)}
          required
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        >
          <option value="">Seleccione un ciclo...</option>
          {schoolCycles.map((cycle) => (
            <option key={cycle.id} value={cycle.id}>
              {cycle.name}
            </option>
          ))}
        </select>
        <input
          name="startDate"
          type="date"
          defaultValue={inputDate(academicPeriod?.startDate)}
          required
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        />
        <input
          name="endDate"
          type="date"
          defaultValue={inputDate(academicPeriod?.endDate)}
          required
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        />
      </div>
      {selectedCycle ? (
        <p className="mt-3 text-xs font-semibold text-muted">
          Rango del ciclo: {dateLabel(selectedCycle.startDate)} - {dateLabel(selectedCycle.endDate)}
        </p>
      ) : null}
      <textarea
        name="description"
        defaultValue={academicPeriod?.description ?? ""}
        placeholder="Descripcion"
        rows={3}
        disabled={!canManage}
        className="focus-ring mt-3 w-full rounded-lg border border-line px-3 py-2 text-sm disabled:bg-surface"
      />
      <button
        disabled={!canManage || isSaving}
        className="focus-ring mt-4 h-11 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Guardando..." : "Guardar periodo academico"}
      </button>
    </form>
  );
}
