"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type LevelOption = { id: string; name: string };
type ModalityOption = { id: string; name: string; academicLevelId: string };

type SubjectFormData = {
  id?: string;
  code?: string;
  name?: string;
  description?: string | null;
  academicLevelId?: string;
  modalityId?: string | null;
  active?: boolean;
};

type SubjectFormProps = {
  subject?: SubjectFormData;
  academicLevels: LevelOption[];
  modalities: ModalityOption[];
  canManage: boolean;
};

export function SubjectForm({
  subject,
  academicLevels,
  modalities,
  canManage
}: SubjectFormProps) {
  const router = useRouter();
  const [selectedLevelId, setSelectedLevelId] = useState(subject?.academicLevelId ?? "");
  const [selectedModalityId, setSelectedModalityId] = useState(subject?.modalityId ?? "");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const compatibleModalities = useMemo(
    () =>
      selectedLevelId
        ? modalities.filter((modality) => modality.academicLevelId === selectedLevelId)
        : [],
    [modalities, selectedLevelId]
  );

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    setMessage("");
    setIsSaving(true);

    const payload = {
      code: formData.get("code"),
      name: formData.get("name"),
      description: formData.get("description"),
      academicLevelId: selectedLevelId,
      modalityId: selectedModalityId,
      active: formData.get("active") === "on"
    };
    const endpoint = subject?.id ? `/api/subjects/${subject.id}` : "/api/subjects";
    const response = await fetch(endpoint, {
      method: subject?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;
    setIsSaving(false);

    if (!response.ok) {
      setMessage(result?.message ?? "No fue posible guardar la materia.");
      return;
    }

    setMessage("Materia guardada correctamente.");

    if (!subject?.id && result?.id) {
      form.reset();
      router.push(`/configuracion-academica/materias/${result.id}`);
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-ink">
          {subject?.id ? "Editar materia" : "Nueva materia"}
        </h3>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input name="active" type="checkbox" defaultChecked={subject?.active ?? true} disabled={!canManage} />
          Activa
        </label>
      </div>
      {message ? <p className="mt-3 text-sm font-semibold text-ink">{message}</p> : null}
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <input name="code" defaultValue={subject?.code ?? ""} placeholder="Codigo" required disabled={!canManage} className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface" />
        <input name="name" defaultValue={subject?.name ?? ""} placeholder="Nombre" required disabled={!canManage} className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface" />
        <select
          name="academicLevelId"
          value={selectedLevelId}
          onChange={(event) => {
            const nextLevelId = event.target.value;
            setSelectedLevelId(nextLevelId);
            const selectedModality = modalities.find((modality) => modality.id === selectedModalityId);
            if (!selectedModality || selectedModality.academicLevelId !== nextLevelId) {
              setSelectedModalityId("");
            }
          }}
          required
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        >
          <option value="">Seleccione un nivel...</option>
          {academicLevels.map((level) => (
            <option key={level.id} value={level.id}>{level.name}</option>
          ))}
        </select>
        <select
          name="modalityId"
          value={selectedModalityId}
          onChange={(event) => setSelectedModalityId(event.target.value)}
          disabled={!canManage}
          className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface"
        >
          <option value="">Sin modalidad especifica</option>
          {compatibleModalities.map((modality) => (
            <option key={modality.id} value={modality.id}>{modality.name}</option>
          ))}
        </select>
      </div>
      <textarea name="description" defaultValue={subject?.description ?? ""} placeholder="Descripcion" rows={3} disabled={!canManage} className="focus-ring mt-3 w-full rounded-lg border border-line px-3 py-2 text-sm disabled:bg-surface" />
      <button disabled={!canManage || isSaving} className="focus-ring mt-4 h-11 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
        {isSaving ? "Guardando..." : "Guardar materia"}
      </button>
    </form>
  );
}
