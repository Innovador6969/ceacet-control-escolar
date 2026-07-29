import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  FileText,
  GraduationCap,
  Landmark,
  Pencil,
  Phone,
  WalletCards
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/session";
import { getStudentById } from "@/lib/services/students";
import {
  administrativeStatusLabels,
  documentStatusLabels,
  formatDate,
  formatGroupLabel,
  formatMoney,
  sexLabels
} from "@/lib/labels";

type StudentDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    created?: string;
  }>;
};

export default async function StudentDetailPage({
  params,
  searchParams
}: StudentDetailPageProps) {
  await requireUser();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const student = await getStudentById(id);

  if (!student) {
    notFound();
  }

  const enrollment = student.enrollments[0];
  const balance = student.enrollments.reduce(
    (total, item) =>
      total + item.charges.reduce((sum, charge) => sum + Number(charge.balance), 0),
    0
  );
  const missingDocuments = student.documents.filter(
    (document) =>
      document.documentType.required && document.status !== "RECEIVED"
  ).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <Link
          href="/alumnos"
          className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a alumnos
        </Link>
        {query.created === "1" ? (
          <Badge tone="green">Registro exitoso</Badge>
        ) : null}
      </div>

      <section className="rounded-lg border border-line bg-white p-5 shadow-panel sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <Badge tone={balance > 0 ? "red" : "green"}>
              {balance > 0 ? "Con adeudo" : "Al corriente"}
            </Badge>
            <h2 className="mt-4 text-2xl font-extrabold text-ink sm:text-3xl">
              {student.paternalLastName} {student.maternalLastName ?? ""}{" "}
              {student.firstName}
            </h2>
            <p className="mt-2 text-sm text-muted">
              Matricula {student.enrollmentNumber} ·{" "}
              {administrativeStatusLabels[student.administrativeStatus]}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Cuota semanal",
                value: formatMoney(enrollment?.weeklyFee?.toString() ?? 0),
                icon: Landmark
              },
              {
                label: "Adeudo",
                value: formatMoney(balance),
                icon: FileText
              },
              {
                label: "Documentos faltantes",
                value: String(missingDocuments),
                icon: GraduationCap
              }
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-line bg-surface p-4"
              >
                <item.icon className="h-4 w-4 text-brand-600" aria-hidden="true" />
                <p className="mt-3 text-xs font-semibold text-muted">
                  {item.label}
                </p>
                <p className="mt-1 text-lg font-extrabold text-ink">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {[
          { href: "#datos", label: "Editar alumno", icon: Pencil },
          { href: "/pagos", label: "Registrar pago", icon: CreditCard },
          { href: "/documentos", label: "Ver documentos", icon: FileText },
          { href: "/pagos", label: "Estado de cuenta", icon: WalletCards }
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="focus-ring flex h-11 items-center justify-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-bold text-ink shadow-sm transition hover:bg-surface"
          >
            <action.icon className="h-4 w-4" aria-hidden="true" />
            {action.label}
          </Link>
        ))}
      </section>

      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            "Resumen",
            "Datos personales",
            "Inscripcion",
            "Pagos",
            "Documentos",
            "Seguimientos",
            "Historial"
          ].map((tab, index) => (
            <span
              key={tab}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold ${
                index === 0
                  ? "bg-brand-600 text-white"
                  : "border border-line text-muted"
              }`}
            >
              {tab}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-ink">Resumen</h3>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-muted">Nivel</dt>
              <dd className="mt-1 text-sm font-bold text-ink">
                {enrollment?.academicLevel.name ?? "Sin nivel"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">Modalidad</dt>
              <dd className="mt-1 text-sm font-bold text-ink">
                {enrollment?.modality.name ?? "Sin modalidad"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">Grupo</dt>
              <dd className="mt-1 text-sm font-bold text-ink">
                {enrollment?.group ? formatGroupLabel(enrollment.group) : "Sin grupo"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">Inscripcion</dt>
              <dd className="mt-1 text-sm font-bold text-ink">
                {formatDate(enrollment?.enrollmentDate)}
              </dd>
            </div>
          </dl>
        </div>

        <div id="datos" className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-ink">Datos de contacto</h3>
          <div className="mt-4 flex items-start gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
              <Phone className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-ink">
                {student.phone ?? "Sin telefono"}
              </p>
              <p className="mt-1 text-sm text-muted">
                {student.email ?? "Sin correo"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-ink">Datos personales</h3>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-muted">CURP</dt>
              <dd className="mt-1 text-sm font-bold text-ink">
                {student.curp ?? "Sin CURP"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">Nacimiento</dt>
              <dd className="mt-1 text-sm font-bold text-ink">
                {formatDate(student.birthDate)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">Sexo</dt>
              <dd className="mt-1 text-sm font-bold text-ink">
                {student.sex ? sexLabels[student.sex] : "Sin dato"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">Ocupacion</dt>
              <dd className="mt-1 text-sm font-bold text-ink">
                {student.occupation ?? "Sin dato"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-ink">Inscripcion y cuotas</h3>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold text-muted">Fecha de inicio</dt>
              <dd className="mt-1 text-sm font-bold text-ink">
                {formatDate(enrollment?.startDate)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">Grado</dt>
              <dd className="mt-1 text-sm font-bold text-ink">
                {enrollment?.grade ?? "Sin grado"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">Inscripcion</dt>
              <dd className="mt-1 text-sm font-bold text-ink">
                {formatMoney(enrollment?.registrationFee?.toString() ?? 0)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">Recargo</dt>
              <dd className="mt-1 text-sm font-bold text-ink">
                {enrollment?.lateFeePercentage.toString() ?? "0"}%
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-ink">Pagos</h3>
          <p className="mt-3 text-sm text-muted">
            La captura completa de pagos semanales queda preparada para la siguiente etapa.
          </p>
        </div>
        <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-ink">Documentos</h3>
          <div className="mt-3 space-y-2">
            {student.documents.slice(0, 4).map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span className="text-muted">{document.documentType.name}</span>
                <Badge
                  tone={document.status === "RECEIVED" ? "green" : "yellow"}
                >
                  {documentStatusLabels[document.status]}
                </Badge>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-ink">Seguimientos e historial</h3>
          <p className="mt-3 text-sm text-muted">
            Sin eventos adicionales para mostrar en esta etapa.
          </p>
        </div>
      </section>
    </div>
  );
}
