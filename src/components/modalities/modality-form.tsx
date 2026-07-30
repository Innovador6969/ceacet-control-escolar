"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AcademicLevelOption } from "@/lib/types/catalog";

type ModalityFormData = {
  id?: string;
  code?: string | null;
  name?: string;
  description?: string | null;
  academicLevelId?: string;
  active?: boolean;
};

type ModalityFormProps = {
  modality?: ModalityFormData;
  academicLevels: AcademicLevelOption[];
  canManage: boolean;
};

export function ModalityForm({
  modality,
  academicLevels,
  canManage
}: ModalityFormProps) {
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
      academicLevelId: formData.get("academicLevelId"),
      description: formData.get("description"),
      active: formData.get("active") === "on"
    };
    const endpoint = modality?.id
      ? `/api/modalities/${modality.id}`
      : "/api/modalities";
    const response = await fetch(endpoint, {
      method: modality?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = (await response.json().catch(() => null)) as {
      id?: string;
      message?: string;
    } | null;
    setIsSaving(false);

    if (!response.ok) {
      setMessage(result?.message ?? "No fue posible guardar la modalidad.");
      return;
    }

    setMessage("Modalidad guardada correctamente.");

    if (!modality?.id && result?.id) {
      router.push(`/configuracion-academica/modalidades/${result.id}`);
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-ink">
          {modality?.id ? "Editar modalidad" : "Nueva modalidad"}
        </h3>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            name="active"
            type="checkbox"
            defaultChecked={modality?.active ?? true}
            disabled={!canManage}
          />
          Activa
        </label>
      </div>
      {message ? <p className="mt-3 text-sm font-semibold text-ink">{message}</p> : null}
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <input
          name="code"
          defaultValue={modality?.code ?? ""}
          placeholder="Codigo"
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        />
        <input
          name="name"
          defaultValue={modality?.name ?? ""}
          placeholder="Nombre"
          required
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        />
        <select
          name="academicLevelId"
          required
          defaultValue={modality?.academicLevelId ?? ""}
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        >
          <option value="">Nivel academico</option>
          {academicLevels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
        </select>
      </div>
      <textarea
        name="description"
        defaultValue={modality?.description ?? ""}
        placeholder="Descripcion"
        rows={3}
        disabled={!canManage}
        className="focus-ring mt-3 w-full rounded-lg border border-line px-3 py-2 text-sm disabled:bg-surface"
      />
      <button
        disabled={!canManage || isSaving}
        className="focus-ring mt-4 h-11 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Guardando..." : "Guardar modalidad"}
      </button>
    </form>
  );
}
