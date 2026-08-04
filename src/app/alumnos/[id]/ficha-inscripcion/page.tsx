import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PrintButton } from "@/components/students/print-button";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/session";
import {
  documentStatusLabels,
  formatDate,
  formatGroupLabel,
  formatMoney,
  sexLabels
} from "@/lib/labels";
import { getStudentById } from "@/lib/services/students";

type EnrollmentSheetPageProps = {
  params: Promise<{ id: string }>;
};

function Info({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase text-muted print:text-neutral-600">
        {label}
      </dt>
      <dd className="mt-1 min-h-6 border-b border-line pb-1 text-sm font-semibold text-ink print:border-neutral-400">
        {value || "Sin dato"}
      </dd>
    </div>
  );
}

export default async function EnrollmentSheetPage({
  params
}: EnrollmentSheetPageProps) {
  await requireUser();
  const { id } = await params;
  const student = await getStudentById(id);

  if (!student) {
    notFound();
  }

  const enrollment = student.enrollments[0];

  return (
    <div className="space-y-5 print:bg-white">
      <style>{`
        @media print {
          aside, header, nav, .print-hidden { display: none !important; }
          main { padding: 0 !important; }
          body { background: white !important; }
          .print-sheet { border: 0 !important; box-shadow: none !important; }
        }
      `}</style>

      <div className="print-hidden flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <Link
          href={`/alumnos/${student.id}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al expediente
        </Link>
        <PrintButton />
      </div>

      <article className="print-sheet rounded-lg border border-line bg-white p-6 shadow-panel print:p-0">
        <div className="flex items-start justify-between gap-4 border-b border-line pb-5 print:border-neutral-400">
          <div>
            <p className="text-sm font-bold uppercase text-brand-600 print:text-neutral-800">
              CEACET Control Escolar
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-ink">
              Ficha de inscripcion
            </h1>
            <p className="mt-2 text-sm text-muted">
              Folio / matricula: {student.enrollmentNumber}
            </p>
          </div>
          <div className="text-right text-sm font-semibold text-ink">
            <p>Fecha: {formatDate(new Date())}</p>
            <p>Inscripcion: {formatDate(enrollment?.enrollmentDate)}</p>
          </div>
        </div>

        <section className="mt-6">
          <h2 className="text-sm font-extrabold uppercase text-ink">
            Datos del alumno
          </h2>
          <dl className="mt-3 grid gap-4 md:grid-cols-3">
            <Info label="Nombre" value={`${student.paternalLastName} ${student.maternalLastName ?? ""} ${student.firstName}`} />
            <Info label="CURP" value={student.curp} />
            <Info label="Nacimiento" value={formatDate(student.birthDate)} />
            <Info label="Sexo" value={student.sex ? sexLabels[student.sex] : ""} />
            <Info label="Telefono" value={student.phone} />
            <Info label="Correo" value={student.email} />
            <Info label="Domicilio" value={[student.street, student.neighborhood, student.city, student.state, student.postalCode].filter(Boolean).join(", ")} />
          </dl>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-extrabold uppercase text-ink">
            Datos del tutor
          </h2>
          <dl className="mt-3 grid gap-4 md:grid-cols-3">
            <Info label="Nombre" value={student.guardian?.fullName} />
            <Info label="Parentesco" value={student.guardian?.relationship} />
            <Info label="Telefono principal" value={student.guardian?.primaryPhone} />
            <Info label="Telefono alternativo" value={student.guardian?.alternatePhone} />
            <Info label="Correo" value={student.guardian?.email} />
            <Info label="Observaciones" value={student.guardian?.observations} />
          </dl>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-extrabold uppercase text-ink">
            Informacion academica actual
          </h2>
          <dl className="mt-3 grid gap-4 md:grid-cols-3">
            <Info label="Nivel" value={enrollment?.academicLevel.name} />
            <Info label="Modalidad" value={enrollment?.modality.name} />
            <Info label="Grupo" value={enrollment?.group ? formatGroupLabel(enrollment.group) : ""} />
            <Info label="Grado" value={enrollment?.grade} />
            <Info label="Ciclo" value={enrollment?.schoolCycle?.name} />
            <Info label="Periodo" value={enrollment?.academicPeriod?.name} />
            <Info label="Cuota inscripcion" value={formatMoney(enrollment?.registrationFee?.toString() ?? 0)} />
            <Info label="Cuota semanal" value={formatMoney(enrollment?.weeklyFee?.toString() ?? 0)} />
            <Info label="Recargo" value={`${enrollment?.lateFeePercentage?.toString() ?? "0"}%`} />
          </dl>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-extrabold uppercase text-ink">
            Formacion academica previa
          </h2>
          <dl className="mt-3 grid gap-4 md:grid-cols-3">
            <Info label="Nivel anterior" value={student.academicBackground?.previousAcademicLevel?.name} />
            <Info label="Escuela de procedencia" value={student.academicBackground?.previousSchool} />
            <Info label="Ultimo grado" value={student.academicBackground?.lastGrade} />
            <Info label="Ciclo anterior" value={student.academicBackground?.previousSchoolCycle} />
            <Info label="Observaciones" value={student.academicBackground?.observations} />
          </dl>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-extrabold uppercase text-ink">
            Documentos
          </h2>
          <div className="mt-3 overflow-hidden rounded-lg border border-line print:border-neutral-400">
            <table className="min-w-full divide-y divide-line text-sm print:divide-neutral-400">
              <thead className="bg-surface print:bg-white">
                <tr>
                  {["Documento", "Nivel", "Grado", "Estado", "Recepcion"].map((header) => (
                    <th key={header} className="px-3 py-2 text-left text-xs font-bold uppercase text-muted">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line print:divide-neutral-300">
                {student.documents.map((document) => (
                  <tr key={document.id}>
                    <td className="px-3 py-2 font-semibold text-ink">{document.documentType.name}</td>
                    <td className="px-3 py-2 text-muted">{document.academicLevel?.name ?? "Sin nivel"}</td>
                    <td className="px-3 py-2 text-muted">{document.grade ?? "Sin grado"}</td>
                    <td className="px-3 py-2">
                      <Badge tone={document.status === "RECEIVED" ? "green" : "yellow"}>
                        {documentStatusLabels[document.status]}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-muted">{formatDate(document.receivedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          {["Firma del alumno", "Firma del padre, madre o tutor", "Firma de control escolar"].map((label) => (
            <div key={label} className="pt-14 text-center">
              <div className="border-t border-ink pt-2 text-xs font-bold uppercase text-ink">
                {label}
              </div>
            </div>
          ))}
        </section>
      </article>
    </div>
  );
}
