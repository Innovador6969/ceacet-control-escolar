"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AcademicLevelFormData = {
  id?: string;
  code?: string | null;
  name?: string;
  description?: string | null;
  displayOrder?: number;
  active?: boolean;
};

type AcademicLevelFormProps = {
  academicLevel?: AcademicLevelFormData;
  canManage: boolean;
};

export function AcademicLevelForm({
  academicLevel,
  canManage
}: AcademicLevelFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);
    const formData = new FormData(event.currentTarget);
    const payload = {
      code: formData.get("code"),
      name: formData.get("name"),
      description: formData.get("description"),
      displayOrder: formData.get("displayOrder"),
      active: formData.get("active") === "on"
    };
    const endpoint = academicLevel?.id
      ? `/api/academic-levels/${academicLevel.id}`
      : "/api/academic-levels";
    const response = await fetch(endpoint, {
      method: academicLevel?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = (await response.json().catch(() => null)) as {
      id?: string;
      message?: string;
    } | null;
    setIsSaving(false);

    if (!response.ok) {
      setMessage(result?.message ?? "No fue posible guardar el nivel academico.");
      return;
    }

    setMessage("Nivel academico guardado correctamente.");
    router.refresh();

    if (!academicLevel?.id && result?.id) {
      router.push(`/configuracion-academica/niveles-academicos/${result.id}`);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-ink">
          {academicLevel?.id ? "Editar nivel academico" : "Nuevo nivel academico"}
        </h3>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            name="active"
            type="checkbox"
            defaultChecked={academicLevel?.active ?? true}
            disabled={!canManage}
          />
          Activo
        </label>
      </div>
      {message ? <p className="mt-3 text-sm font-semibold text-ink">{message}</p> : null}
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <input
          name="code"
          defaultValue={academicLevel?.code ?? ""}
          placeholder="Codigo"
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        />
        <input
          name="name"
          defaultValue={academicLevel?.name ?? ""}
          placeholder="Nombre"
          required
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        />
        <input
          name="displayOrder"
          type="number"
          min={0}
          step={1}
          defaultValue={academicLevel?.displayOrder ?? 0}
          placeholder="Orden"
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        />
      </div>
      <textarea
        name="description"
        defaultValue={academicLevel?.description ?? ""}
        placeholder="Descripcion"
        rows={3}
        disabled={!canManage}
        className="focus-ring mt-3 w-full rounded-lg border border-line px-3 py-2 text-sm disabled:bg-surface"
      />
      <button
        disabled={!canManage || isSaving}
        className="focus-ring mt-4 h-11 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Guardando..." : "Guardar nivel academico"}
      </button>
    </form>
  );
}
