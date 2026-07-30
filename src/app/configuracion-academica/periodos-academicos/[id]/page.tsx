import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AcademicPeriodAuditHistory } from "@/components/academic-periods/academic-period-audit-history";
import { AcademicPeriodForm } from "@/components/academic-periods/academic-period-form";
import { AcademicPeriodMetadata } from "@/components/academic-periods/academic-period-metadata";
import { CatalogStatusBadge } from "@/components/catalog/catalog-status-badge";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/labels";
import {
  getAcademicPeriodById,
  getAcademicPeriodFormCatalogs
} from "@/lib/services/academic-periods";
import { countCatalogAuditEntries } from "@/lib/services/catalog-audit";

type AcademicPeriodDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AcademicPeriodDetailPage({
  params
}: AcademicPeriodDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const [academicPeriod, auditCount] = await Promise.all([
    getAcademicPeriodById(id),
    countCatalogAuditEntries("AcademicPeriod", id)
  ]);

  if (!academicPeriod) {
    notFound();
  }

  const catalogs = await getAcademicPeriodFormCatalogs(academicPeriod.schoolCycleId);
  const canManage = user.role !== "READ_ONLY";

  return (
    <div className="space-y-5">
      <Link
        href="/configuracion-academica/periodos-academicos"
        className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a periodos academicos
      </Link>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-600">Periodo academico</p>
          <h2 className="mt-1 text-2xl font-extrabold text-ink">
            {academicPeriod.name}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {academicPeriod.schoolCycle.name} - {formatDate(academicPeriod.startDate)} a {formatDate(academicPeriod.endDate)}
          </p>
        </div>
        <CatalogStatusBadge active={academicPeriod.isActive} />
      </div>
      <AcademicPeriodForm
        academicPeriod={academicPeriod}
        schoolCycles={catalogs.schoolCycles}
        canManage={canManage}
      />
      <AcademicPeriodMetadata academicPeriod={academicPeriod} />
      <AcademicPeriodAuditHistory academicPeriodId={academicPeriod.id} count={auditCount} />
    </div>
  );
}
