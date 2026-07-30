import { revalidatePath } from "next/cache";

const academicCatalogPaths = [
  "/configuracion-academica/niveles-academicos",
  "/configuracion-academica/modalidades",
  "/configuracion-academica/grupos"
];

const studentOperationPaths = ["/registrar-alumno", "/alumnos"];

const academicOperationPaths = [
  "/calendario-academico",
  "/calendario-academico/asignaciones"
];

const paymentOperationPaths = ["/pagos"];
const reEnrollmentOperationPaths = ["/pagos"];

function revalidateMany(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path);
  }
}

export function revalidateAcademicLevelCatalogPaths(id?: string) {
  revalidateMany([
    ...academicCatalogPaths,
    ...studentOperationPaths,
    ...academicOperationPaths,
    ...paymentOperationPaths
  ]);

  if (id) {
    revalidatePath(`/configuracion-academica/niveles-academicos/${id}`);
  }
}

export function revalidateModalityCatalogPaths(id?: string) {
  revalidateMany([
    "/configuracion-academica/modalidades",
    "/configuracion-academica/grupos",
    ...studentOperationPaths,
    ...academicOperationPaths,
    ...paymentOperationPaths
  ]);

  if (id) {
    revalidatePath(`/configuracion-academica/modalidades/${id}`);
  }
}

export function revalidateGroupCatalogPaths(id?: string) {
  revalidateMany([
    "/configuracion-academica/grupos",
    ...studentOperationPaths,
    ...academicOperationPaths,
    ...paymentOperationPaths
  ]);

  if (id) {
    revalidatePath(`/configuracion-academica/grupos/${id}`);
  }
}

export function revalidateSchoolCycleCatalogPaths(id?: string) {
  revalidateMany([
    "/configuracion-academica/ciclos-escolares",
    "/configuracion-academica/periodos-academicos",
    ...reEnrollmentOperationPaths,
    ...academicOperationPaths
  ]);

  if (id) {
    revalidatePath(`/configuracion-academica/ciclos-escolares/${id}`);
  }
}

export function revalidateAcademicPeriodCatalogPaths(id?: string) {
  revalidateMany([
    "/configuracion-academica/periodos-academicos",
    ...reEnrollmentOperationPaths,
    ...academicOperationPaths
  ]);

  if (id) {
    revalidatePath(`/configuracion-academica/periodos-academicos/${id}`);
  }
}

export function revalidateSubjectCatalogPaths(id?: string) {
  revalidateMany([
    "/configuracion-academica/materias",
    "/calendario-academico/asignaciones"
  ]);

  if (id) {
    revalidatePath(`/configuracion-academica/materias/${id}`);
  }
}

export function revalidateTeacherCatalogPaths(id?: string) {
  revalidateMany([
    "/configuracion-academica/docentes",
    "/calendario-academico/asignaciones"
  ]);

  if (id) {
    revalidatePath(`/configuracion-academica/docentes/${id}`);
  }
}

export function revalidateClassroomCatalogPaths(id?: string) {
  revalidateMany([
    "/configuracion-academica/aulas",
    "/calendario-academico/asignaciones"
  ]);

  if (id) {
    revalidatePath(`/configuracion-academica/aulas/${id}`);
  }
}
