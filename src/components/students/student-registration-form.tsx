"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import {
  studentRegistrationSchema,
  type StudentRegistrationInput
} from "@/lib/validations/student";

type CatalogOption = {
  id: string;
  name: string;
  academicLevelId?: string;
  modalityId?: string;
  schoolCycleId?: string;
};

type DocumentTypeOption = {
  id: string;
  name: string;
  required: boolean;
};

type StudentRegistrationFormProps = {
  mode?: "create" | "edit";
  studentId?: string;
  academicLevels: CatalogOption[];
  modalities: CatalogOption[];
  groups: CatalogOption[];
  schoolCycles: CatalogOption[];
  academicPeriods: CatalogOption[];
  documentTypes: DocumentTypeOption[];
  defaultValues?: Partial<StudentRegistrationInput>;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs font-semibold text-red-600">{message}</p>;
}

function normalizeLevelName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function gradeOptionsForLevel(levelName?: string) {
  if (!levelName) return null;
  const normalized = normalizeLevelName(levelName);
  if (normalized.includes("primaria")) return ["1", "2", "3", "4", "5", "6"];
  if (normalized.includes("secundaria")) return ["1", "2", "3"];
  return null;
}

function valueLabel(options: CatalogOption[] | DocumentTypeOption[], value?: string) {
  return options.find((option) => option.id === value)?.name ?? "Sin dato";
}

function ReviewRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-bold text-ink">{value || "Sin dato"}</dd>
    </div>
  );
}

export function StudentRegistrationForm({
  mode = "create",
  studentId,
  academicLevels,
  modalities,
  groups,
  schoolCycles,
  academicPeriods,
  documentTypes,
  defaultValues
}: StudentRegistrationFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [reviewValues, setReviewValues] = useState<StudentRegistrationInput | null>(null);
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors }
  } = useForm<StudentRegistrationInput>({
    resolver: zodResolver(studentRegistrationSchema),
    defaultValues: {
      enrollmentDate: new Date().toISOString().slice(0, 10),
      lateFeePercentage: 10,
      paymentDay: 6,
      documents: [],
      ...defaultValues
    }
  });
  const { fields, append, remove } = useFieldArray({ control, name: "documents" });

  const selectedLevel = watch("academicLevelId");
  const selectedModality = watch("modalityId");
  const selectedSchoolCycle = watch("schoolCycleId");
  const selectedLevelName = valueLabel(academicLevels, selectedLevel);
  const gradeOptions = gradeOptionsForLevel(selectedLevelName);
  const selectedGrade = watch("grade");

  const filteredModalities = useMemo(
    () =>
      modalities.filter(
        (modality) => !selectedLevel || modality.academicLevelId === selectedLevel
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

  const filteredPeriods = useMemo(
    () =>
      academicPeriods.filter(
        (period) => !selectedSchoolCycle || period.schoolCycleId === selectedSchoolCycle
      ),
    [academicPeriods, selectedSchoolCycle]
  );

  const selectedModalityName = valueLabel(modalities, selectedModality);
  const isGlobal = selectedModalityName.toLowerCase().includes("global");
  const isFourMonth = selectedModalityName.toLowerCase().includes("cuatrimestral");

  function onReview(values: StudentRegistrationInput) {
    setServerError("");
    setReviewValues(values);
  }

  async function confirmSave() {
    const values = getValues();
    setServerError("");
    setIsSaving(true);

    const response = await fetch(
      mode === "edit" && studentId ? `/api/students/${studentId}` : "/api/students",
      {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      }
    );

    setIsSaving(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setServerError(payload?.message ?? "No fue posible guardar el alumno.");
      setReviewValues(null);
      return;
    }

    const payload = (await response.json()) as { id: string };
    router.push(`/alumnos/${payload.id}${mode === "create" ? "?created=1" : "?updated=1"}`);
  }

  if (reviewValues) {
    return (
      <div className="space-y-5">
        {serverError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {serverError}
          </div>
        ) : null}
        <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-ink">Revision del registro</h3>
          <dl className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <ReviewRow label="Alumno" value={`${reviewValues.paternalLastName} ${reviewValues.maternalLastName ?? ""} ${reviewValues.firstName}`} />
            <ReviewRow label="Telefono alumno" value={reviewValues.phone} />
            <ReviewRow label="Correo alumno" value={reviewValues.email} />
            <ReviewRow label="Tutor" value={reviewValues.guardianFullName} />
            <ReviewRow label="Parentesco" value={reviewValues.guardianRelationship} />
            <ReviewRow label="Telefono tutor" value={reviewValues.guardianPrimaryPhone} />
            <ReviewRow label="Nivel" value={valueLabel(academicLevels, reviewValues.academicLevelId)} />
            <ReviewRow label="Modalidad" value={valueLabel(modalities, reviewValues.modalityId)} />
            <ReviewRow label="Grado" value={reviewValues.grade} />
            <ReviewRow label="Grupo" value={valueLabel(groups, reviewValues.groupId)} />
            <ReviewRow label="Ciclo" value={valueLabel(schoolCycles, reviewValues.schoolCycleId)} />
            <ReviewRow label="Periodo" value={valueLabel(academicPeriods, reviewValues.academicPeriodId)} />
            <ReviewRow label="Nivel anterior" value={valueLabel(academicLevels, reviewValues.previousAcademicLevelId)} />
            <ReviewRow label="Escuela de procedencia" value={reviewValues.previousSchool} />
            <ReviewRow label="Ultimo grado cursado" value={reviewValues.lastGrade} />
          </dl>
        </section>
        <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-ink">Documentos capturados</h3>
          {reviewValues.documents.length > 0 ? (
            <div className="mt-4 space-y-2">
              {reviewValues.documents.map((document, index) => (
                <div key={`${document.documentTypeId}-${index}`} className="rounded-lg border border-line p-3 text-sm">
                  <span className="font-bold text-ink">{valueLabel(documentTypes, document.documentTypeId)}</span>
                  <span className="text-muted"> · {valueLabel(academicLevels, document.academicLevelId)} · Grado {document.grade || "sin grado"} · {document.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">Se generaran documentos pendientes del catalogo activo.</p>
          )}
        </section>
        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <button type="button" onClick={() => setReviewValues(null)} className="focus-ring h-11 rounded-lg border border-line bg-white px-4 text-sm font-bold text-ink shadow-sm transition hover:bg-surface">
            Regresar y corregir
          </button>
          <button type="button" onClick={confirmSave} disabled={isSaving} className="focus-ring h-11 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70">
            {isSaving ? "Guardando..." : mode === "edit" ? "Confirmar cambios" : "Confirmar registro"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onReview)} className="space-y-5">
      {serverError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {serverError}
        </div>
      ) : null}

      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-ink">Datos del estudiante</h3>
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
            <span className="text-sm font-semibold text-ink">Telefono del alumno</span>
            <input className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("phone")} />
            <FieldError message={errors.phone?.message} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Correo del alumno</span>
            <input type="email" className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("email")} />
            <FieldError message={errors.email?.message} />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-ink">Domicilio del estudiante</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <input placeholder="Calle y numero" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm xl:col-span-2" {...register("street")} />
          <input placeholder="Colonia" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" {...register("neighborhood")} />
          <input placeholder="Poblacion o municipio" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" {...register("city")} />
          <input placeholder="Estado" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" {...register("state")} />
          <input placeholder="Codigo postal" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" {...register("postalCode")} />
        </div>
        <FieldError message={errors.postalCode?.message} />
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-ink">Datos del tutor</h3>
        <p className="mt-1 text-sm text-muted">Opcional cuando el alumno es mayor de edad o no se cuenta con tutor registrado.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <input placeholder="Nombre completo del tutor" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" {...register("guardianFullName")} />
          <input placeholder="Parentesco" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" {...register("guardianRelationship")} />
          <input placeholder="Telefono principal" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" {...register("guardianPrimaryPhone")} />
          <input placeholder="Telefono alternativo" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" {...register("guardianAlternatePhone")} />
          <input type="email" placeholder="Correo del tutor" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" {...register("guardianEmail")} />
          <input placeholder="Observaciones del tutor" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" {...register("guardianObservations")} />
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-ink">Inscripcion actual</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Nivel</span>
            <select
              className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm"
              {...register("academicLevelId", {
                onChange: () => {
                  const currentGrade = getValues("grade");
                  const nextLevelName = valueLabel(academicLevels, getValues("academicLevelId"));
                  const nextGrades = gradeOptionsForLevel(nextLevelName);
                  if (nextGrades && currentGrade && !nextGrades.includes(currentGrade)) {
                    setValue("grade", "");
                  }
                  setValue("modalityId", "");
                  setValue("groupId", "");
                }
              })}
            >
              <option value="">Seleccionar</option>
              {academicLevels.map((level) => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
            <FieldError message={errors.academicLevelId?.message} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Modalidad</span>
            <select className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("modalityId", { onChange: () => setValue("groupId", "") })}>
              <option value="">Seleccionar</option>
              {filteredModalities.map((modality) => (
                <option key={modality.id} value={modality.id}>{modality.name}</option>
              ))}
            </select>
            <FieldError message={errors.modalityId?.message} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Grado</span>
            {gradeOptions ? (
              <select className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("grade")}>
                <option value="">Seleccionar</option>
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
                {selectedGrade && !gradeOptions.includes(selectedGrade) ? (
                  <option value={selectedGrade}>{selectedGrade}</option>
                ) : null}
              </select>
            ) : (
              <input className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("grade")} />
            )}
          </label>
          {isFourMonth ? (
            <label className="space-y-2">
              <span className="text-sm font-semibold text-ink">Cuatrimestre</span>
              <input type="number" min={1} max={12} className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("fourMonthPeriod")} />
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
            <span className="text-sm font-semibold text-ink">Ciclo escolar</span>
            <select className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("schoolCycleId", { onChange: () => setValue("academicPeriodId", "") })}>
              <option value="">Seleccionar</option>
              {schoolCycles.map((cycle) => (
                <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-ink">Periodo academico</span>
            <select className="focus-ring h-11 w-full rounded-lg border border-line px-3 text-sm" {...register("academicPeriodId")}>
              <option value="">Seleccionar</option>
              {filteredPeriods.map((period) => (
                <option key={period.id} value={period.id}>{period.name}</option>
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
        <h3 className="text-base font-bold text-ink">Formacion academica previa</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <select className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" {...register("previousAcademicLevelId")}>
            <option value="">Nivel academico anterior</option>
            {academicLevels.map((level) => (
              <option key={level.id} value={level.id}>{level.name}</option>
            ))}
          </select>
          <input placeholder="Escuela de procedencia" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" {...register("previousSchool")} />
          <input placeholder="Ultimo grado cursado" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" {...register("lastGrade")} />
          <input placeholder="Ciclo escolar anterior" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" {...register("previousSchoolCycle")} />
          <input placeholder="Observaciones" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm md:col-span-2" {...register("academicBackgroundObservations")} />
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-bold text-ink">Documentos academicos</h3>
          <button
            type="button"
            onClick={() => append({ documentTypeId: "", academicLevelId: selectedLevel, grade: getValues("grade"), status: "PENDING" })}
            className="focus-ring inline-flex h-10 items-center gap-2 rounded-lg border border-line px-3 text-sm font-bold text-ink"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            Agregar
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {fields.length === 0 ? (
            <p className="text-sm text-muted">Si no capturas documentos, se generaran pendientes del catalogo activo.</p>
          ) : null}
          {fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 rounded-lg border border-line p-3 md:grid-cols-2 xl:grid-cols-6">
              <input type="hidden" {...register(`documents.${index}.id`)} />
              <select className="focus-ring h-10 rounded-lg border border-line px-3 text-sm xl:col-span-2" {...register(`documents.${index}.documentTypeId`)}>
                <option value="">Tipo de documento</option>
                {documentTypes.map((documentType) => (
                  <option key={documentType.id} value={documentType.id}>{documentType.name}</option>
                ))}
              </select>
              <select className="focus-ring h-10 rounded-lg border border-line px-3 text-sm" {...register(`documents.${index}.academicLevelId`)}>
                <option value="">Nivel</option>
                {academicLevels.map((level) => (
                  <option key={level.id} value={level.id}>{level.name}</option>
                ))}
              </select>
              <input placeholder="Grado" className="focus-ring h-10 rounded-lg border border-line px-3 text-sm" {...register(`documents.${index}.grade`)} />
              <select className="focus-ring h-10 rounded-lg border border-line px-3 text-sm" {...register(`documents.${index}.status`)}>
                <option value="PENDING">Pendiente</option>
                <option value="RECEIVED">Recibido</option>
                <option value="REVIEW">En revision</option>
                <option value="REJECTED">Rechazado</option>
              </select>
              <button type="button" onClick={() => remove(index)} className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-line px-3 text-sm font-bold text-ink">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Quitar
              </button>
              <input type="date" className="focus-ring h-10 rounded-lg border border-line px-3 text-sm" {...register(`documents.${index}.receivedAt`)} />
              <input placeholder="Ubicacion fisica" className="focus-ring h-10 rounded-lg border border-line px-3 text-sm" {...register(`documents.${index}.physicalLocation`)} />
              <input placeholder="Referencia de archivo" className="focus-ring h-10 rounded-lg border border-line px-3 text-sm" {...register(`documents.${index}.fileUrl`)} />
              <input placeholder="Observaciones" className="focus-ring h-10 rounded-lg border border-line px-3 text-sm xl:col-span-3" {...register(`documents.${index}.observations`)} />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-ink">Informacion de cobro</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input type="number" min={0} placeholder="Cuota de inscripcion" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" {...register("registrationFee")} />
          <input type="number" min={0} placeholder="Cuota semanal" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" {...register("weeklyFee")} />
          <input type="number" min={0} placeholder="Porcentaje de recargo" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" {...register("lateFeePercentage")} />
          <input type="number" min={1} max={31} placeholder="Dia habitual de pago" className="focus-ring h-11 rounded-lg border border-line px-3 text-sm" {...register("paymentDay")} />
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-ink">Observaciones del alumno</h3>
        <textarea rows={4} className="focus-ring mt-5 w-full rounded-lg border border-line px-3 py-2 text-sm" {...register("observations")} />
      </section>

      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <button type="reset" className="focus-ring h-11 rounded-lg border border-line bg-white px-4 text-sm font-bold text-ink shadow-sm transition hover:bg-surface">
          Limpiar
        </button>
        <button type="submit" disabled={isSaving} className="focus-ring h-11 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70">
          {mode === "edit" ? "Revisar cambios" : "Revisar registro"}
        </button>
      </div>
    </form>
  );
}
