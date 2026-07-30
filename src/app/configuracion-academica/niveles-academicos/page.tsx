import { GraduationCap } from "lucide-react";
import { AcademicLevelForm } from "@/components/academic-levels/academic-level-form";
import { AcademicLevelsTable } from "@/components/academic-levels/academic-levels-table";
import { CatalogPageHeader } from "@/components/catalog/catalog-page-header";
import { requireUser } from "@/lib/auth/session";
import { getAcademicLevels } from "@/lib/services/academic-levels";

export default async function AcademicLevelsPage() {
  const user = await requireUser();
  const academicLevels = await getAcademicLevels();
  const canManage = user.role !== "READ_ONLY";

  return (
    <div className="space-y-5">
      <CatalogPageHeader
        title="Administracion de niveles academicos"
        description="Gestiona niveles academicos, dependencias y auditoria sin alterar historicos."
        icon={GraduationCap}
        countLabel={`${academicLevels.length} nivel(es)`}
      />
      <AcademicLevelForm canManage={canManage} />
      <AcademicLevelsTable academicLevels={academicLevels} canManage={canManage} />
    </div>
  );
}
