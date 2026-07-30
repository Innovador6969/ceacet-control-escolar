import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CatalogStatusBadge } from "@/components/catalog/catalog-status-badge";
import { SchoolCycleAuditHistory } from "@/components/school-cycles/school-cycle-audit-history";
import { SchoolCycleForm } from "@/components/school-cycles/school-cycle-form";
import { SchoolCycleMetadata } from "@/components/school-cycles/school-cycle-metadata";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/session";
import { countCatalogAuditEntries } from "@/lib/services/catalog-audit";
import { getSchoolCycleById } from "@/lib/services/school-cycles";
import { formatDate } from "@/lib/labels";

type SchoolCycleDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SchoolCycleDetailPage({
  params
}: SchoolCycleDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const [schoolCycle, auditCount] = await Promise.all([
    getSchoolCycleById(id),
    countCatalogAuditEntries("SchoolCycle", id)
  ]);

  if (!schoolCycle) {
    notFound();
  }

  const canManage = user.role !== "READ_ONLY";

  return (
    <div className="space-y-5">
      <Link
        href="/configuracion-academica/ciclos-escolares"
        className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a ciclos escolares
      </Link>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-600">Ciclo escolar</p>
          <h2 className="mt-1 text-2xl font-extrabold text-ink">{schoolCycle.name}</h2>
          <p className="mt-2 text-sm text-muted">
            {formatDate(schoolCycle.startDate)} - {formatDate(schoolCycle.endDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {schoolCycle.isCurrent ? <Badge tone="blue">Actual</Badge> : null}
          <CatalogStatusBadge active={schoolCycle.isActive} />
        </div>
      </div>
      <SchoolCycleForm schoolCycle={schoolCycle} canManage={canManage} />
      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-ink">Periodos relacionados</h3>
        <div className="mt-4 divide-y divide-line">
          {schoolCycle.periods.map((period) => (
            <div key={period.id} className="flex flex-col justify-between gap-2 py-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold text-ink">
                  {period.displayOrder}. {period.name}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {formatDate(period.startDate)} - {formatDate(period.endDate)}
                </p>
              </div>
              <CatalogStatusBadge active={period.isActive} />
            </div>
          ))}
          {schoolCycle.periods.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              No hay periodos relacionados con este ciclo.
            </p>
          ) : null}
        </div>
      </section>
      <SchoolCycleMetadata schoolCycle={schoolCycle} />
      <SchoolCycleAuditHistory schoolCycleId={schoolCycle.id} count={auditCount} />
    </div>
  );
}
