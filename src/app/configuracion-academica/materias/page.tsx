import { BookOpen } from "lucide-react";
import { CatalogPageHeader } from "@/components/catalog/catalog-page-header";
import { SubjectForm } from "@/components/subjects/subject-form";
import { SubjectsTable } from "@/components/subjects/subjects-table";
import { requireUser } from "@/lib/auth/session";
import { getSubjectFormCatalogs, getSubjects } from "@/lib/services/subjects";

export default async function SubjectsPage() {
  const user = await requireUser();
  const [subjects, catalogs] = await Promise.all([
    getSubjects(),
    getSubjectFormCatalogs()
  ]);
  const canManage = user.role !== "READ_ONLY";

  return (
    <div className="space-y-5">
      <CatalogPageHeader
        title="Administracion de materias"
        description="Gestiona materias por nivel y modalidad para programacion academica."
        icon={BookOpen}
        countLabel={`${subjects.length} materia(s)`}
      />
      <SubjectForm
        academicLevels={catalogs.academicLevels}
        modalities={catalogs.modalities}
        canManage={canManage}
      />
      <SubjectsTable subjects={subjects} canManage={canManage} />
    </div>
  );
}
