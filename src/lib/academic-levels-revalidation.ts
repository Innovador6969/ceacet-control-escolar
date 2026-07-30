import { revalidatePath } from "next/cache";

const academicLevelAffectedPaths = [
  "/configuracion-academica/niveles-academicos",
  "/configuracion-academica/modalidades",
  "/configuracion-academica/grupos",
  "/pagos",
  "/calendario-academico",
  "/calendario-academico/asignaciones",
  "/registrar-alumno",
  "/alumnos",
  "/"
];

export function revalidateAcademicLevelPaths(id?: string) {
  for (const path of academicLevelAffectedPaths) {
    revalidatePath(path);
  }

  if (id) {
    revalidatePath(`/configuracion-academica/niveles-academicos/${id}`);
  }
}
