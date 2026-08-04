import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { StudentRegistrationForm } from "@/components/students/student-registration-form";
import { requireUser } from "@/lib/auth/session";
import { formatGroupLabel } from "@/lib/labels";
import { getStudentById, getStudentFormCatalogs } from "@/lib/services/students";

type EditStudentPageProps = {
  params: Promise<{ id: string }>;
};

function dateInput(value?: Date | string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  await requireUser();
  const { id } = await params;
  const [student, catalogs] = await Promise.all([
    getStudentById(id),
    getStudentFormCatalogs(id)
  ]);

  if (!student) {
    notFound();
  }

  const enrollment = student.enrollments[0];

  return (
    <div className="space-y-5">
      <Link
        href={`/alumnos/${student.id}`}
        className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver al expediente
      </Link>
      <div>
        <p className="text-sm font-semibold text-brand-600">Editar alumno</p>
        <h2 className="mt-1 text-2xl font-extrabold text-ink">
          {student.paternalLastName} {student.maternalLastName ?? ""} {student.firstName}
        </h2>
        <p className="mt-2 text-sm text-muted">
          Corrige datos personales, tutor, documentos e inscripcion reciente.
        </p>
      </div>
      <StudentRegistrationForm
        mode="edit"
        studentId={student.id}
        academicLevels={catalogs.academicLevels}
        modalities={catalogs.modalities}
        groups={catalogs.groups.map((group) => ({
          id: group.id,
          name: formatGroupLabel(group),
          academicLevelId: group.academicLevelId,
          modalityId: group.modalityId
        }))}
        schoolCycles={catalogs.schoolCycles}
        academicPeriods={catalogs.academicPeriods.map((period) => ({
          id: period.id,
          name: period.name,
          schoolCycleId: period.schoolCycleId
        }))}
        documentTypes={catalogs.documentTypes}
        defaultValues={{
          firstName: student.firstName,
          paternalLastName: student.paternalLastName,
          maternalLastName: student.maternalLastName ?? undefined,
          birthDate: dateInput(student.birthDate),
          curp: student.curp ?? undefined,
          sex: student.sex ?? undefined,
          maritalStatus: student.maritalStatus ?? undefined,
          occupation: student.occupation ?? undefined,
          phone: student.phone ?? undefined,
          email: student.email ?? undefined,
          street: student.street ?? undefined,
          neighborhood: student.neighborhood ?? undefined,
          city: student.city ?? undefined,
          state: student.state ?? undefined,
          postalCode: student.postalCode ?? undefined,
          academicLevelId: enrollment?.academicLevelId ?? "",
          modalityId: enrollment?.modalityId ?? "",
          groupId: enrollment?.groupId ?? undefined,
          schoolCycleId: enrollment?.schoolCycleId ?? undefined,
          academicPeriodId: enrollment?.academicPeriodId ?? undefined,
          grade: enrollment?.grade ?? undefined,
          fourMonthPeriod: enrollment?.fourMonthPeriod ?? undefined,
          enrollmentDate: dateInput(enrollment?.enrollmentDate),
          startDate: dateInput(enrollment?.startDate),
          registrationFee: enrollment ? Number(enrollment.registrationFee) : undefined,
          weeklyFee: enrollment ? Number(enrollment.weeklyFee) : undefined,
          lateFeePercentage: enrollment ? Number(enrollment.lateFeePercentage) : undefined,
          paymentDay: enrollment?.paymentDay ?? undefined,
          observations: student.observations ?? undefined,
          guardianFullName: student.guardian?.fullName ?? undefined,
          guardianRelationship: student.guardian?.relationship ?? undefined,
          guardianPrimaryPhone: student.guardian?.primaryPhone ?? undefined,
          guardianAlternatePhone: student.guardian?.alternatePhone ?? undefined,
          guardianEmail: student.guardian?.email ?? undefined,
          guardianObservations: student.guardian?.observations ?? undefined,
          previousAcademicLevelId:
            student.academicBackground?.previousAcademicLevelId ?? undefined,
          previousSchool: student.academicBackground?.previousSchool ?? undefined,
          lastGrade: student.academicBackground?.lastGrade ?? undefined,
          previousSchoolCycle:
            student.academicBackground?.previousSchoolCycle ?? undefined,
          academicBackgroundObservations:
            student.academicBackground?.observations ?? undefined,
          documents: student.documents.map((document) => ({
            id: document.id,
            documentTypeId: document.documentTypeId,
            academicLevelId: document.academicLevelId ?? undefined,
            grade: document.grade ?? undefined,
            status: document.status,
            receivedAt: dateInput(document.receivedAt),
            physicalLocation: document.physicalLocation ?? undefined,
            fileUrl: document.fileUrl ?? undefined,
            observations: document.observations ?? undefined
          }))
        }}
      />
    </div>
  );
}
