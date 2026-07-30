import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CatalogStatusBadge } from "@/components/catalog/catalog-status-badge";
import { SubjectAuditHistory } from "@/components/subjects/subject-audit-history";
import { SubjectForm } from "@/components/subjects/subject-form";
import { SubjectMetadata } from "@/components/subjects/subject-metadata";
import { requireUser } from "@/lib/auth/session";
import { getSubjectById, getSubjectFormCatalogs } from "@/lib/services/subjects";
import { countCatalogAuditEntries } from "@/lib/services/catalog-audit";

type SubjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const [subject, auditCount] = await Promise.all([
    getSubjectById(id),
    countCatalogAuditEntries("Subject", id)
  ]);

  if (!subject) notFound();

  const catalogs = await getSubjectFormCatalogs(subject.academicLevelId, subject.modalityId);
  const canManage = user.role !== "READ_ONLY";

  return (
    <div className="space-y-5">
      <Link href="/configuracion-academica/materias" className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a materias
      </Link>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-600">Materia</p>
          <h2 className="mt-1 text-2xl font-extrabold text-ink">{subject.name}</h2>
          <p className="mt-2 text-sm text-muted">
            {subject.code} - {subject.academicLevel.name} - {subject.modality?.name ?? "General"}
          </p>
        </div>
        <CatalogStatusBadge active={subject.active} />
      </div>
      <SubjectForm subject={subject} academicLevels={catalogs.academicLevels} modalities={catalogs.modalities} canManage={canManage} />
      <SubjectMetadata subject={subject} />
      <SubjectAuditHistory subjectId={subject.id} count={auditCount} />
    </div>
  );
}
