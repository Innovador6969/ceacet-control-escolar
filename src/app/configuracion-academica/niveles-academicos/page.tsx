import { GraduationCap } from "lucide-react";
import { AcademicLevelForm } from "@/components/academic-levels/academic-level-form";
import { AcademicLevelsTable } from "@/components/academic-levels/academic-levels-table";
import { requireUser } from "@/lib/auth/session";
import { getAcademicLevels } from "@/lib/services/academic-levels";

export default async function AcademicLevelsPage() {
  const user = await requireUser();
  const academicLevels = await getAcademicLevels();
  const canManage = user.role !== "READ_ONLY";

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-600">
            Configuracion academica
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-ink">
            Administracion de niveles academicos
          </h2>
          <p className="mt-2 text-sm text-muted">
            Gestiona niveles academicos, dependencias y auditoria sin alterar historicos.
          </p>
        </div>
        <span className="inline-flex h-11 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-bold text-ink shadow-sm">
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          {academicLevels.length} nivel(es)
        </span>
      </div>
      <AcademicLevelForm canManage={canManage} />
      <AcademicLevelsTable academicLevels={academicLevels} canManage={canManage} />
    </div>
  );
}
