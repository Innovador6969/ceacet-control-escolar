import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ClassroomAuditHistory } from "@/components/classrooms/classroom-audit-history";
import { ClassroomForm } from "@/components/classrooms/classroom-form";
import { ClassroomMetadata } from "@/components/classrooms/classroom-metadata";
import { CatalogStatusBadge } from "@/components/catalog/catalog-status-badge";
import { requireUser } from "@/lib/auth/session";
import { getClassroomById } from "@/lib/services/classrooms";
import { countCatalogAuditEntries } from "@/lib/services/catalog-audit";

type ClassroomDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ClassroomDetailPage({ params }: ClassroomDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const [classroom, auditCount] = await Promise.all([
    getClassroomById(id),
    countCatalogAuditEntries("Classroom", id)
  ]);

  if (!classroom) notFound();

  const canManage = user.role !== "READ_ONLY";

  return (
    <div className="space-y-5">
      <Link href="/configuracion-academica/aulas" className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a aulas
      </Link>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-600">Aula</p>
          <h2 className="mt-1 text-2xl font-extrabold text-ink">{classroom.name}</h2>
          <p className="mt-2 text-sm text-muted">{classroom.location ?? "Sin ubicacion"} - capacidad {classroom.capacity ?? "sin definir"}</p>
        </div>
        <CatalogStatusBadge active={classroom.active} />
      </div>
      <ClassroomForm classroom={classroom} canManage={canManage} />
      <ClassroomMetadata classroom={classroom} />
      <ClassroomAuditHistory classroomId={classroom.id} count={auditCount} />
    </div>
  );
}
