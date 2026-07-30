import { revalidatePath } from "next/cache";

export function revalidateModalityPaths(modalityId?: string) {
  [
    "/configuracion-academica/modalidades",
    "/configuracion-academica/grupos",
    "/pagos",
    "/calendario-academico",
    "/calendario-academico/asignaciones",
    "/registrar-alumno",
    "/alumnos",
    "/"
  ].forEach((path) => revalidatePath(path));

  if (modalityId) {
    revalidatePath(`/configuracion-academica/modalidades/${modalityId}`);
  }
}
