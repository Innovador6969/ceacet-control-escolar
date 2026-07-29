import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  FileWarning,
  Landmark,
  UsersRound
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/session";
import {
  getActiveEnrollment,
  getMissingDocumentCount,
  getStudentBalance,
  getDashboardData
} from "@/lib/services/students";
import { formatMoney } from "@/lib/labels";

export default async function HomePage() {
  await requireUser();
  const dashboard = await getDashboardData();
  const stats = [
    {
      title: "Alumnos activos",
      value: String(dashboard.stats.active),
      note: "Expedientes activos en la base de datos",
      icon: UsersRound,
      tone: "brand" as const
    },
    {
      title: "Alumnos al corriente",
      value: String(dashboard.stats.current),
      note: "Sin saldos pendientes registrados",
      icon: BookOpenCheck,
      tone: "green" as const
    },
    {
      title: "Alumnos con adeudo",
      value: String(dashboard.stats.withDebt),
      note: "Requieren seguimiento administrativo",
      icon: CircleDollarSign,
      tone: "red" as const
    },
    {
      title: "Expedientes incompletos",
      value: String(dashboard.stats.incomplete),
      note: "Documentos faltantes por validar",
      icon: FileWarning,
      tone: "yellow" as const
    },
    {
      title: "Ingresos del dia",
      value: formatMoney(dashboard.stats.todayIncome),
      note: "Pagos registrados hoy",
      icon: Landmark,
      tone: "cyan" as const
    },
    {
      title: "Pagos pendientes",
      value: String(dashboard.stats.pendingCharges),
      note: "Cargos vencidos o por vencer",
      icon: ClipboardList,
      tone: "gray" as const
    }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-panel sm:p-6">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="max-w-3xl">
            <Badge tone="blue">Primera etapa</Badge>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              CEACET Control Escolar
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
              Panel central para alumnos, inscripciones, pagos, documentos y
              reportes de secundaria y preparatoria abierta.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/registrar-alumno"
              className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
            >
              Registrar alumno
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/alumnos"
              className="focus-ring inline-flex h-11 items-center justify-center rounded-lg border border-line bg-white px-4 text-sm font-bold text-ink shadow-sm transition hover:bg-surface"
            >
              Ver alumnos
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-ink">Actividad reciente</h3>
              <p className="mt-1 text-sm text-muted">
                Ultimos expedientes agregados al sistema.
              </p>
            </div>
            <Link
              href="/alumnos"
              className="text-sm font-bold text-brand-600 hover:text-brand-700"
            >
              Ver todo
            </Link>
          </div>
          <div className="mt-5 divide-y divide-line">
            {dashboard.recentStudents.map((student) => {
              const enrollment = getActiveEnrollment(student);
              const balance = getStudentBalance(student);

              return (
                <Link
                  key={student.id}
                  href={`/alumnos/${student.id}`}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {student.paternalLastName} {student.maternalLastName ?? ""}{" "}
                      {student.firstName}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {enrollment?.modality.name ?? "Sin modalidad"} · Grupo{" "}
                      {enrollment?.group?.name ?? "sin asignar"}
                    </p>
                  </div>
                  <Badge tone={balance > 0 ? "red" : "green"}>
                    {balance > 0 ? "Con adeudo" : "Al corriente"}
                  </Badge>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-ink">
              Alumnos que requieren atencion
            </h3>
            <div className="mt-4 space-y-3">
              {dashboard.attentionStudents.map((student) => (
                <Link
                  key={student.id}
                  href={`/alumnos/${student.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2"
                >
                  <span className="min-w-0 truncate text-sm font-semibold text-ink">
                    {student.paternalLastName} {student.firstName}
                  </span>
                  <Badge tone="red">{formatMoney(getStudentBalance(student))}</Badge>
                </Link>
              ))}
              {dashboard.attentionStudents.length === 0 ? (
                <p className="text-sm text-muted">No hay adeudos pendientes.</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-ink">Documentos pendientes</h3>
            <div className="mt-4 space-y-3">
              {dashboard.pendingDocuments.map((student) => (
                <Link
                  key={student.id}
                  href={`/alumnos/${student.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2"
                >
                  <span className="min-w-0 truncate text-sm font-semibold text-ink">
                    {student.paternalLastName} {student.firstName}
                  </span>
                  <Badge tone="yellow">
                    {getMissingDocumentCount(student)} pendientes
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { href: "/registrar-alumno", label: "Registrar alumno", icon: CheckCircle2 },
          { href: "/pagos", label: "Registrar pago", icon: Landmark },
          { href: "/documentos", label: "Ver documentos", icon: ClipboardList },
          { href: "/reportes", label: "Reportes", icon: CalendarDays }
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg border border-line bg-white p-4 text-sm font-bold text-ink shadow-sm transition hover:bg-surface"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
              <item.icon className="h-4 w-4" aria-hidden="true" />
            </span>
            {item.label}
          </Link>
        ))}
      </section>
    </div>
  );
}
