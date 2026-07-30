"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ClassroomFormData = {
  id?: string;
  code?: string | null;
  name?: string;
  location?: string | null;
  capacity?: number | null;
  description?: string | null;
  active?: boolean;
};

type ClassroomFormProps = {
  classroom?: ClassroomFormData;
  canManage: boolean;
};

export function ClassroomForm({ classroom, canManage }: ClassroomFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
      location: formData.get("location"),
      capacity: formData.get("capacity"),
      description: formData.get("description"),
      active: formData.get("active") === "on"
    };
    const endpoint = classroom?.id ? `/api/classrooms/${classroom.id}` : "/api/classrooms";
    const response = await fetch(endpoint, {
      method: classroom?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;
    setIsSaving(false);

    if (!response.ok) {
      setMessage(result?.message ?? "No fue posible guardar el aula.");
      return;
    }

    setMessage("Aula guardada correctamente.");
    if (!classroom?.id && result?.id) {
      form.reset();
      router.push(`/configuracion-academica/aulas/${result.id}`);
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-ink">{classroom?.id ? "Editar aula" : "Nueva aula"}</h3>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input name="active" type="checkbox" defaultChecked={classroom?.active ?? true} disabled={!canManage} />
          Activa
        </label>
      </div>
      {message ? <p className="mt-3 text-sm font-semibold text-ink">{message}</p> : null}
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <input name="code" defaultValue={classroom?.code ?? ""} placeholder="Codigo" disabled={!canManage} className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface" />
        <input name="name" defaultValue={classroom?.name ?? ""} placeholder="Nombre" required disabled={!canManage} className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface" />
        <input name="location" defaultValue={classroom?.location ?? ""} placeholder="Ubicacion" disabled={!canManage} className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface" />
        <input name="capacity" type="number" min={1} step={1} defaultValue={classroom?.capacity ?? ""} placeholder="Capacidad" disabled={!canManage} className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface" />
      </div>
      <textarea name="description" defaultValue={classroom?.description ?? ""} placeholder="Descripcion" rows={3} disabled={!canManage} className="focus-ring mt-3 w-full rounded-lg border border-line px-3 py-2 text-sm disabled:bg-surface" />
      <button disabled={!canManage || isSaving} className="focus-ring mt-4 h-11 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
        {isSaving ? "Guardando..." : "Guardar aula"}
      </button>
    </form>
  );
}
