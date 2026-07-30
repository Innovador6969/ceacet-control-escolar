import { CalendarRange } from "lucide-react";
import { CatalogPageHeader } from "@/components/catalog/catalog-page-header";
import { SchoolCycleForm } from "@/components/school-cycles/school-cycle-form";
import { SchoolCyclesTable } from "@/components/school-cycles/school-cycles-table";
import { requireUser } from "@/lib/auth/session";
import { getSchoolCycles } from "@/lib/services/school-cycles";

export default async function SchoolCyclesPage() {
  const user = await requireUser();
  const schoolCycles = await getSchoolCycles();
  const canManage = user.role !== "READ_ONLY";

  return (
    <div className="space-y-5">
      <CatalogPageHeader
        title="Administracion de ciclos escolares"
        description="Gestiona ciclos, vigencia y ciclo actual sin alterar registros historicos."
        icon={CalendarRange}
        countLabel={`${schoolCycles.length} ciclo(s)`}
      />
      <SchoolCycleForm canManage={canManage} />
      <SchoolCyclesTable schoolCycles={schoolCycles} canManage={canManage} />
    </div>
  );
}
