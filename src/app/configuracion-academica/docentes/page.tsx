import { UserRound } from "lucide-react";
import { CatalogPageHeader } from "@/components/catalog/catalog-page-header";
import { TeacherForm } from "@/components/teachers/teacher-form";
import { TeachersTable } from "@/components/teachers/teachers-table";
import { requireUser } from "@/lib/auth/session";
import { getTeachers } from "@/lib/services/teachers";

export default async function TeachersPage() {
  const user = await requireUser();
  const teachers = await getTeachers();
  const canManage = user.role !== "READ_ONLY";

  return (
    <div className="space-y-5">
      <CatalogPageHeader
        title="Administracion de docentes"
        description="Gestiona docentes disponibles para asignaciones academicas."
        icon={UserRound}
        countLabel={`${teachers.length} docente(s)`}
      />
      <TeacherForm canManage={canManage} />
      <TeachersTable teachers={teachers} canManage={canManage} />
    </div>
  );
}
