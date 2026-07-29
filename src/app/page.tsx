import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  GraduationCap,
  Landmark,
  RefreshCcw,
  UsersRound,
  WalletCards
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/services/dashboard";
import { formatDate, formatGroupLabel, formatMoney } from "@/lib/labels";

function fullName(student: {
  firstName: string;
  paternalLastName: string;
  maternalLastName?: string | null;
}) {
  return `${student.paternalLastName} ${student.maternalLastName ?? ""} ${student.firstName}`.trim();
}

export default async function HomePage() {
  await requireUser();

  try {
    const dashboard = await getDashboardData();
    const stats = [
      {
        title: "Alumnos activos",
        value: String(dashboard.stats.activeStudents),
        note: "Solo alumnos con estado administrativo ACTIVE",
        icon: UsersRound,
        tone: "brand" as const
      },
      {
        title: "Inscripciones activas",
        value: String(dashboard.stats.activeEnrollments),
        note: dashboard.activeSchoolCycle
          ? `Ciclo ${dashboard.activeSchoolCycle.name} y registros sin ciclo`
          : "Todas las inscripciones ACTIVE",
        icon: GraduationCap,
        tone: "green" as const
      },
      {
        title: "Reinscripciones por atender",
        value: String(dashboard.stats.actionableReEnrollments),
        note: "DRAFT, PENDING, PARTIAL u OVERDUE",
        icon: RefreshCcw,
        tone: "yellow" as const
      },
      {
        title: "Cargos vencidos",
        value: String(dashboard.stats.overdueCharges),
        note: "Con saldo y fecha limite anterior a hoy",
        icon: AlertTriangle,
        tone: "red" as const
      },
      {
        title: "Saldo pendiente",
        value: formatMoney(dashboard.stats.pendingBalance),
        note: "Cargos PENDING, PARTIAL u OVERDUE",
        icon: WalletCards,
        tone: "red" as const
      },
      {
        title: "Ingresos del mes",
        value: formatMoney(dashboard.stats.monthlyIncome),
        note: "Pagos APPLIED por fecha de pago",
        icon: Landmark,
        tone: "cyan" as const
      },
      {
        title: "Pagos del dia",
        value: formatMoney(dashboard.stats.todayPaymentsAmount),
        note: `${dashboard.stats.todayPaymentsCount} operacion(es) registradas hoy`,
        icon: CircleDollarSign,
        tone: "green" as const
      },
      {
        title: "Proximos eventos academicos",
        value: String(dashboard.stats.upcomingEventsCount),
        note: "Eventos programados no cancelados",
        icon: CalendarDays,
        tone: "gray" as const
      }
    ];

    return (
      <div className="space-y-6">
        <section className="rounded-lg border border-line bg-white p-5 shadow-panel sm:p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="max-w-3xl">
              <Badge tone="blue">Dashboard ejecutivo</Badge>
              <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                CEACET Control Escolar
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted sm:text-base">
                Indicadores operativos de alumnos, inscripciones, pagos,
                reinscripciones y calendario academico.
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
                href="/pagos"
                className="focus-ring inline-flex h-11 items-center justify-center rounded-lg border border-line bg-white px-4 text-sm font-bold text-ink shadow-sm transition hover:bg-surface"
              >
                Ver pagos
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-ink">
                  Actividad reciente
                </h3>
                <p className="mt-1 text-sm text-muted">
                  Ultimos 5 alumnos registrados.
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
                const enrollment = student.enrollments[0];

                return (
                  <Link
                    key={student.id}
                    href={`/alumnos/${student.id}`}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {fullName(student)}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {student.enrollmentNumber} ·{" "}
                        {enrollment?.modality.name ?? "Sin modalidad"} · Grupo{" "}
                        {enrollment?.group ? formatGroupLabel(enrollment.group) : "sin asignar"}
                      </p>
                    </div>
                    <Badge tone="blue">{student.administrativeStatus}</Badge>
                  </Link>
                );
              })}
              {dashboard.recentStudents.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">
                  Aun no hay alumnos registrados.
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
              <h3 className="text-base font-bold text-ink">
                Cargos que requieren atencion
              </h3>
              <div className="mt-4 space-y-3">
                {dashboard.urgentCharges.map((charge) => (
                  <Link
                    key={charge.id}
                    href={`/alumnos/${charge.enrollment.student.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {fullName(charge.enrollment.student)}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        Vencio: {formatDate(charge.dueDate)}
                      </p>
                    </div>
                    <Badge tone="red">{formatMoney(charge.balance.toString())}</Badge>
                  </Link>
                ))}
                {dashboard.urgentCharges.length === 0 ? (
                  <p className="text-sm text-muted">No hay cargos vencidos.</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-bold text-ink">
                  Proximos eventos academicos
                </h3>
                <Link
                  href="/calendario-academico"
                  className="text-sm font-bold text-brand-600 hover:text-brand-700"
                >
                  Calendario
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {dashboard.upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-lg border border-line px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">
                          {event.title}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {formatDate(event.startsAt)}
                          {event.group ? ` · Grupo ${formatGroupLabel(event.group)}` : ""}
                        </p>
                      </div>
                      <Badge tone="yellow">{event.type}</Badge>
                    </div>
                  </div>
                ))}
                {dashboard.upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted">
                    No hay eventos academicos programados.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { href: "/registrar-alumno", label: "Registrar alumno", icon: CheckCircle2 },
            { href: "/pagos", label: "Registrar pago", icon: Landmark },
            { href: "/calendario-academico", label: "Calendario academico", icon: CalendarDays },
            { href: "/reportes", label: "Reportes", icon: ClipboardList }
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
  } catch {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-800 shadow-sm">
        <h2 className="text-lg font-extrabold">No fue posible cargar el dashboard</h2>
        <p className="mt-2 text-sm">
          Revisa la conexion a la base de datos e intenta nuevamente.
        </p>
      </div>
    );
  }
}
