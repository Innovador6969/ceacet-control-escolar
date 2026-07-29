"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Option = {
  id: string;
  name: string;
  academicLevelId?: string;
};

type GroupFormData = {
  id?: string;
  code?: string | null;
  name?: string;
  description?: string | null;
  academicLevelId?: string;
  modalityId?: string;
  schedule?: string | null;
  capacity?: number | null;
  active?: boolean;
};

type GroupFormProps = {
  group?: GroupFormData;
  academicLevels: Option[];
  modalities: Option[];
  canManage: boolean;
};

export function GroupForm({
  group,
  academicLevels,
  modalities,
  canManage
}: GroupFormProps) {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState(group?.academicLevelId ?? "");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const filteredModalities = useMemo(
    () =>
      modalities.filter(
        (modality) => !selectedLevel || modality.academicLevelId === selectedLevel
      ),
    [modalities, selectedLevel]
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);
    const formData = new FormData(event.currentTarget);
    const payload = {
      code: formData.get("code"),
      name: formData.get("name"),
      academicLevelId: formData.get("academicLevelId"),
      modalityId: formData.get("modalityId"),
      schedule: formData.get("schedule"),
      capacity: formData.get("capacity"),
      description: formData.get("description"),
      active: formData.get("active") === "on"
    };
    const endpoint = group?.id ? `/api/groups/${group.id}` : "/api/groups";
    const response = await fetch(endpoint, {
      method: group?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = (await response.json().catch(() => null)) as {
      id?: string;
      message?: string;
    } | null;
    setIsSaving(false);

    if (!response.ok) {
      setMessage(result?.message ?? "No fue posible guardar el grupo.");
      return;
    }

    setMessage("Grupo guardado correctamente.");
    router.refresh();

    if (!group?.id && result?.id) {
      router.push(`/configuracion-academica/grupos/${result.id}`);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-ink">
          {group?.id ? "Editar grupo" : "Nuevo grupo"}
        </h3>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input
            name="active"
            type="checkbox"
            defaultChecked={group?.active ?? true}
            disabled={!canManage}
          />
          Activo
        </label>
      </div>
      {message ? <p className="mt-3 text-sm font-semibold text-ink">{message}</p> : null}
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <input
          name="code"
          defaultValue={group?.code ?? ""}
          placeholder="Codigo"
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        />
        <input
          name="name"
          defaultValue={group?.name ?? ""}
          placeholder="Nombre"
          required
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        />
        <select
          name="academicLevelId"
          required
          value={selectedLevel}
          onChange={(event) => setSelectedLevel(event.target.value)}
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
        <select
          name="modalityId"
          required
          defaultValue={group?.modalityId ?? ""}
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        >
          <option value="">Modalidad</option>
          {filteredModalities.map((modality) => (
            <option key={modality.id} value={modality.id}>
              {modality.name}
            </option>
          ))}
        </select>
        <input
          name="schedule"
          defaultValue={group?.schedule ?? ""}
          placeholder="Horario"
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        />
        <input
          name="capacity"
          type="number"
          min="0"
          defaultValue={group?.capacity ?? ""}
          placeholder="Capacidad"
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        />
      </div>
      <textarea
        name="description"
        defaultValue={group?.description ?? ""}
        placeholder="Descripcion"
        rows={3}
        disabled={!canManage}
        className="focus-ring mt-3 w-full rounded-lg border border-line px-3 py-2 text-sm disabled:bg-surface"
      />
      <button
        disabled={!canManage || isSaving}
        className="focus-ring mt-4 h-11 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Guardando..." : "Guardar grupo"}
      </button>
    </form>
  );
}
