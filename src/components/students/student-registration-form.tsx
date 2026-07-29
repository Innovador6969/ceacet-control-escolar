"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  studentRegistrationSchema,
  type StudentRegistrationInput
} from "@/lib/validations/student";

type CatalogOption = {
  id: string;
  name: string;
  academicLevelId?: string;
  modalityId?: string;
};

type StudentRegistrationFormProps = {
  academicLevels: CatalogOption[];
  modalities: CatalogOption[];
  groups: CatalogOption[];
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-xs font-semibold text-red-600">{message}</p>;
}

export function StudentRegistrationForm({
  academicLevels,
  modalities,
  groups
}: StudentRegistrationFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<StudentRegistrationInput>({
    resolver: zodResolver(studentRegistrationSchema),
    defaultValues: {
      enrollmentDate: new Date().toISOString().slice(0, 10),
      lateFeePercentage: 10,
      paymentDay: 6
    }
  });

  const selectedLevel = watch("academicLevelId");
  const selectedModality = watch("modalityId");

  const filteredModalities = useMemo(
    () =>
      modalities.filter(
        (modality) =>
          !selectedLevel || modality.academicLevelId === selectedLevel
      ),
    [modalities, selectedLevel]
  );

  const filteredGroups = useMemo(
    () =>
      groups.filter(
        (group) =>
          (!selectedLevel || group.academicLevelId === selectedLevel) &&
          (!selectedModality || group.modalityId === selectedModality)
      ),
    [groups, selectedLevel, selectedModality]
  );

  const selectedModalityName =
    modalities.find((modality) => modality.id === selectedModality)?.name ?? "";
  const isGlobal = selectedModalityName.toLowerCase().includes("global");
  const isFourMonth = selectedModalityName.toLowerCase().includes("cuatrimestral");

  async function onSubmit(values: StudentRegistrationInput) {
    setServerError("");
    setIsSaving(true);

    const response = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    setIsSaving(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setServerError(payload?.message ?? "No fue posible guardar el alumno.");
      return;
    }

    const payload = (await response.json()) as { id: string };
    router.push(`/alumnos/${payload.id}?created=1`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {serverError}
        </div>
      ) : null}

      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-ink">Datos personales</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Apellido paterno</span>
            <input className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("paternalLastName")} />
            <FieldError message={errors.paternalLastName?.message} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Apellido materno</span>
            <input className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("maternalLastName")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Nombre o nombres</span>
            <input className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("firstName")} />
            <FieldError message={errors.firstName?.message} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Fecha de nacimiento</span>
            <input type="date" className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("birthDate")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">CURP</span>
            <input className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm uppercase" {...register("curp")} />
            <FieldError message={errors.curp?.message} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Sexo</span>
            <select className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("sex")}>
              <option value="">Seleccionar</option>
              <option value="FEMALE">Femenino</option>
              <option value="MALE">Masculino</option>
              <option value="OTHER">Otro</option>
              <option value="NOT_SPECIFIED">Prefiere no decir</option>
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Estado civil</span>
            <input className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("maritalStatus")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Ocupacion</span>
            <input className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("occupation")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Telefono</span>
            <input className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("phone")} />
            <FieldError message={errors.phone?.message} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Correo electronico</span>
            <input type="email" className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("email")} />
            <FieldError message={errors.email?.message} />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-ink">Domicilio</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="space-y-2 xl:col-span-2">
            <span className="text-sm font-semibold text-ink">Calle y numero</span>
            <input className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("street")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Colonia</span>
            <input className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("neighborhood")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Poblacion o municipio</span>
            <input className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("city")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Estado</span>
            <input className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("state")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Codigo postal</span>
            <input className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("postalCode")} />
            <FieldError message={errors.postalCode?.message} />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-ink">Informacion academica</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Nivel</span>
            <select className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("academicLevelId")}>
              <option value="">Seleccionar</option>
              {academicLevels.map((level) => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
            <FieldError message={errors.academicLevelId?.message} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Modalidad</span>
            <select className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("modalityId")}>
              <option value="">Seleccionar</option>
              {filteredModalities.map((modality) => (
                <option key={modality.id} value={modality.id}>{modality.name}</option>
              ))}
            </select>
            <FieldError message={errors.modalityId?.message} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Grado</span>
            <input className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("grade")} />
          </label>
          {isFourMonth ? (
            <label className="space-y-2">
              <span className="text-sm font-semibold text-ink">Cuatrimestre</span>
              <input type="number" min={1} max={6} className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("fourMonthPeriod")} />
            </label>
          ) : null}
          {isGlobal ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
              Modalidad marcada para examen global.
            </div>
          ) : null}
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Grupo</span>
            <select className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("groupId")}>
              <option value="">Seleccionar</option>
              {filteredGroups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Fecha de inscripcion</span>
            <input type="date" className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("enrollmentDate")} />
            <FieldError message={errors.enrollmentDate?.message} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Fecha de inicio</span>
            <input type="date" className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("startDate")} />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-ink">Informacion de cobro</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Cuota de inscripcion</span>
            <input type="number" min={0} className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("registrationFee")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Cuota semanal</span>
            <input type="number" min={0} className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("weeklyFee")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Porcentaje de recargo</span>
            <input type="number" min={0} className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("lateFeePercentage")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Dia habitual de pago</span>
            <input type="number" min={1} max={31} className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("paymentDay")} />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-ink">Observaciones</h3>
        <textarea
          rows={4}
          className="focus-ring mt-5 w-full rounded-lg border border-line px-3 py-2 text-sm"
          {...register("observations")}
        />
      </section>

      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <button
          type="reset"
          className="focus-ring h-11 rounded-lg border border-line bg-white px-4 text-sm font-bold text-ink shadow-sm transition hover:bg-surface"
        >
          Limpiar
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="focus-ring h-11 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Guardando..." : "Guardar alumno"}
        </button>
      </div>
    </form>
  );
}
