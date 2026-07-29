import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { StudentFiltersTable } from "@/components/students/student-filters-table";
import { requireUser } from "@/lib/auth/session";
import {
  getActiveEnrollment,
  getMissingDocumentCount,
  getStudentBalance,
  getStudents
} from "@/lib/services/students";
import { administrativeStatusLabels, formatGroupLabel } from "@/lib/labels";

export default async function StudentsPage() {
  await requireUser();
  const students = await getStudents();
  const rows = students.map((student) => {
    const enrollment = getActiveEnrollment(student);
    const balance = getStudentBalance(student);
    const missingDocuments = getMissingDocumentCount(student);

    return {
      id: student.id,
      fullName: `${student.paternalLastName} ${student.maternalLastName ?? ""} ${student.firstName}`,
      enrollmentNumber: student.enrollmentNumber,
      academicLevel: enrollment?.academicLevel.name ?? "Sin nivel",
      modality: enrollment?.modality.name ?? "Sin modalidad",
      groupId: enrollment?.group?.id ?? "",
      group: enrollment?.group ? formatGroupLabel(enrollment.group) : "Sin grupo",
      phone: student.phone ?? "",
      paymentStatus: balance > 0 ? "Con adeudo" : "Al corriente",
      documentStatus: missingDocuments > 0 ? "Incompleto" : "Completo",
      administrativeStatus:
        administrativeStatusLabels[student.administrativeStatus],
      balance
    };
  });

  const levels = Array.from(new Set(rows.map((row) => row.academicLevel)));
  const modalities = Array.from(new Set(rows.map((row) => row.modality)));
  const groups = rows.reduce<Array<{ id: string; name: string }>>((options, row) => {
    if (!row.groupId || options.some((option) => option.id === row.groupId)) {
      return options;
    }

    options.push({ id: row.groupId, name: row.group });
    return options;
  }, []);
  const statuses = Array.from(
    new Set(rows.map((row) => row.administrativeStatus))
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-600">Alumnos</p>
          <h2 className="mt-1 text-2xl font-extrabold text-ink">
            Listado de alumnos
          </h2>
          <p className="mt-2 text-sm text-muted">
            Consulta expedientes, estados de pago y datos escolares.
          </p>
        </div>
        <Link
          href="/registrar-alumno"
          className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
        >
          <PlusCircle className="h-4 w-4" aria-hidden="true" />
          Registrar alumno
        </Link>
      </div>
      <StudentFiltersTable
        students={rows}
        levels={levels}
        modalities={modalities}
        groups={groups}
        statuses={statuses}
      />
    </div>
  );
}
