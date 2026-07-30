import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CatalogStatusBadge } from "@/components/catalog/catalog-status-badge";
import { TeacherAuditHistory } from "@/components/teachers/teacher-audit-history";
import { TeacherForm } from "@/components/teachers/teacher-form";
import { TeacherMetadata } from "@/components/teachers/teacher-metadata";
import { requireUser } from "@/lib/auth/session";
import { countCatalogAuditEntries } from "@/lib/services/catalog-audit";
import { getTeacherById } from "@/lib/services/teachers";

type TeacherDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TeacherDetailPage({ params }: TeacherDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const [teacher, auditCount] = await Promise.all([
    getTeacherById(id),
    countCatalogAuditEntries("Teacher", id)
  ]);

  if (!teacher) notFound();

  const canManage = user.role !== "READ_ONLY";

  return (
    <div className="space-y-5">
      <Link href="/configuracion-academica/docentes" className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a docentes
      </Link>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-600">Docente</p>
          <h2 className="mt-1 text-2xl font-extrabold text-ink">{teacher.name}</h2>
          <p className="mt-2 text-sm text-muted">{teacher.email ?? teacher.specialty ?? "Sin correo registrado"}</p>
        </div>
        <CatalogStatusBadge active={teacher.active} />
      </div>
      <TeacherForm teacher={teacher} canManage={canManage} />
      <TeacherMetadata teacher={teacher} />
      <TeacherAuditHistory teacherId={teacher.id} count={auditCount} />
    </div>
  );
}
