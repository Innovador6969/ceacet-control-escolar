import { CalendarDays } from "lucide-react";
import { AcademicPeriodForm } from "@/components/academic-periods/academic-period-form";
import { AcademicPeriodsTable } from "@/components/academic-periods/academic-periods-table";
import { CatalogPageHeader } from "@/components/catalog/catalog-page-header";
import { requireUser } from "@/lib/auth/session";
import {
  getAcademicPeriodFormCatalogs,
  getAcademicPeriods
} from "@/lib/services/academic-periods";

export default async function AcademicPeriodsPage() {
  const user = await requireUser();
  const [academicPeriods, catalogs] = await Promise.all([
    getAcademicPeriods(),
    getAcademicPeriodFormCatalogs()
  ]);
  const canManage = user.role !== "READ_ONLY";

  return (
    <div className="space-y-5">
      <CatalogPageHeader
        title="Administracion de periodos academicos"
        description="Gestiona periodos dentro de cada ciclo escolar y conserva historicos."
        icon={CalendarDays}
        countLabel={`${academicPeriods.length} periodo(s)`}
      />
      <AcademicPeriodForm
        schoolCycles={catalogs.schoolCycles}
        canManage={canManage}
      />
      <AcademicPeriodsTable academicPeriods={academicPeriods} canManage={canManage} />
    </div>
  );
}
