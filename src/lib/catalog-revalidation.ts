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
