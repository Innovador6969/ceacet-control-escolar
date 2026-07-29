import { StudentRegistrationForm } from "@/components/students/student-registration-form";
import { requireUser } from "@/lib/auth/session";
import { formatGroupLabel } from "@/lib/labels";
import { getCatalogs } from "@/lib/services/catalogs";

export default async function RegisterStudentPage() {
  await requireUser();
  const { academicLevels, modalities, groups } = await getCatalogs();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-brand-600">Registrar alumno</p>
        <h2 className="mt-1 text-2xl font-extrabold text-ink">
          Nuevo expediente escolar
        </h2>
        <p className="mt-2 text-sm text-muted">
          Captura los datos personales, escolares y de cuotas del alumno.
        </p>
      </div>
      <StudentRegistrationForm
        academicLevels={academicLevels}
        modalities={modalities.map((modality) => ({
          id: modality.id,
          name: modality.name,
          academicLevelId: modality.academicLevelId
        }))}
        groups={groups.map((group) => ({
          id: group.id,
          name: formatGroupLabel(group),
          academicLevelId: group.academicLevelId,
          modalityId: group.modalityId
        }))}
      />
    </div>
  );
}
