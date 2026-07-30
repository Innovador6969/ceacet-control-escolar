"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SchoolCycleFormData = {
  id?: string;
  code?: string | null;
  name?: string;
  description?: string | null;
  startDate?: Date | string;
  endDate?: Date | string;
  isActive?: boolean;
  isCurrent?: boolean;
};

type SchoolCycleFormProps = {
  schoolCycle?: SchoolCycleFormData;
  canManage: boolean;
};

function inputDate(value?: Date | string) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function SchoolCycleForm({ schoolCycle, canManage }: SchoolCycleFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      isActive: formData.get("isActive") === "on",
      isCurrent: formData.get("isCurrent") === "on"
    };
    const endpoint = schoolCycle?.id
      ? `/api/school-cycles/${schoolCycle.id}`
      : "/api/school-cycles";
    const response = await fetch(endpoint, {
      method: schoolCycle?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = (await response.json().catch(() => null)) as {
      id?: string;
      message?: string;
    } | null;
    setIsSaving(false);

    if (!response.ok) {
      setMessage(result?.message ?? "No fue posible guardar el ciclo escolar.");
      return;
    }

    setMessage("Ciclo escolar guardado correctamente.");

    if (!schoolCycle?.id && result?.id) {
      router.push(`/configuracion-academica/ciclos-escolares/${result.id}`);
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-bold text-ink">
          {schoolCycle?.id ? "Editar ciclo escolar" : "Nuevo ciclo escolar"}
        </h3>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-ink">
            <input
              name="isActive"
              type="checkbox"
              defaultChecked={schoolCycle?.isActive ?? true}
              disabled={!canManage}
            />
            Activo
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-ink">
            <input
              name="isCurrent"
              type="checkbox"
              defaultChecked={schoolCycle?.isCurrent ?? false}
              disabled={!canManage}
            />
            Actual
          </label>
        </div>
      </div>
      {message ? <p className="mt-3 text-sm font-semibold text-ink">{message}</p> : null}
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <input
          name="code"
          defaultValue={schoolCycle?.code ?? ""}
          placeholder="Codigo"
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        />
        <input
          name="name"
          defaultValue={schoolCycle?.name ?? ""}
          placeholder="Nombre"
          required
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        />
        <input
          name="startDate"
          type="date"
          defaultValue={inputDate(schoolCycle?.startDate)}
          required
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        />
        <input
          name="endDate"
          type="date"
          defaultValue={inputDate(schoolCycle?.endDate)}
          required
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        />
      </div>
      <textarea
        name="description"
        defaultValue={schoolCycle?.description ?? ""}
        placeholder="Descripcion"
        rows={3}
        disabled={!canManage}
        className="focus-ring mt-3 w-full rounded-lg border border-line px-3 py-2 text-sm disabled:bg-surface"
      />
      <button
        disabled={!canManage || isSaving}
        className="focus-ring mt-4 h-11 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Guardando..." : "Guardar ciclo escolar"}
      </button>
    </form>
  );
}
