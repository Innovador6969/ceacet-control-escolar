"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type TeacherFormData = {
  id?: string;
  code?: string | null;
  name?: string;
  email?: string | null;
  phone?: string | null;
  specialty?: string | null;
  description?: string | null;
  active?: boolean;
};

type TeacherFormProps = {
  teacher?: TeacherFormData;
  canManage: boolean;
};

export function TeacherForm({ teacher, canManage }: TeacherFormProps) {
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
      email: formData.get("email"),
      phone: formData.get("phone"),
      specialty: formData.get("specialty"),
      description: formData.get("description"),
      active: formData.get("active") === "on"
    };
    const endpoint = teacher?.id ? `/api/teachers/${teacher.id}` : "/api/teachers";
    const response = await fetch(endpoint, {
      method: teacher?.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;
    setIsSaving(false);

    if (!response.ok) {
      setMessage(result?.message ?? "No fue posible guardar el docente.");
      return;
    }

    setMessage("Docente guardado correctamente.");
    if (!teacher?.id && result?.id) {
      form.reset();
      router.push(`/configuracion-academica/docentes/${result.id}`);
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-ink">{teacher?.id ? "Editar docente" : "Nuevo docente"}</h3>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input name="active" type="checkbox" defaultChecked={teacher?.active ?? true} disabled={!canManage} />
          Activo
        </label>
      </div>
      {message ? <p className="mt-3 text-sm font-semibold text-ink">{message}</p> : null}
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <input name="code" defaultValue={teacher?.code ?? ""} placeholder="Codigo" disabled={!canManage} className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface" />
        <input name="name" defaultValue={teacher?.name ?? ""} placeholder="Nombre completo" required disabled={!canManage} className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface" />
        <input name="email" type="email" defaultValue={teacher?.email ?? ""} placeholder="Correo" disabled={!canManage} className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface" />
        <input name="phone" defaultValue={teacher?.phone ?? ""} placeholder="Telefono" disabled={!canManage} className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface" />
        <input name="specialty" defaultValue={teacher?.specialty ?? ""} placeholder="Especialidad" disabled={!canManage} className="focus-ring h-11 rounded-lg border border-line px-3 text-sm disabled:bg-surface md:col-span-2" />
      </div>
      <textarea name="description" defaultValue={teacher?.description ?? ""} placeholder="Descripcion" rows={3} disabled={!canManage} className="focus-ring mt-3 w-full rounded-lg border border-line px-3 py-2 text-sm disabled:bg-surface" />
      <button disabled={!canManage || isSaving} className="focus-ring mt-4 h-11 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
        {isSaving ? "Guardando..." : "Guardar docente"}
      </button>
    </form>
  );
}
