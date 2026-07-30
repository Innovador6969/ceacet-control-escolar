import { MapPin } from "lucide-react";
import { ClassroomForm } from "@/components/classrooms/classroom-form";
import { ClassroomsTable } from "@/components/classrooms/classrooms-table";
import { CatalogPageHeader } from "@/components/catalog/catalog-page-header";
import { requireUser } from "@/lib/auth/session";
import { getClassrooms } from "@/lib/services/classrooms";

export default async function ClassroomsPage() {
  const user = await requireUser();
  const classrooms = await getClassrooms();
  const canManage = user.role !== "READ_ONLY";

  return (
    <div className="space-y-5">
      <CatalogPageHeader
        title="Administracion de aulas"
        description="Gestiona aulas fisicas o virtuales disponibles para programacion academica."
        icon={MapPin}
        countLabel={`${classrooms.length} aula(s)`}
      />
      <ClassroomForm canManage={canManage} />
      <ClassroomsTable classrooms={classrooms} canManage={canManage} />
    </div>
  );
}
