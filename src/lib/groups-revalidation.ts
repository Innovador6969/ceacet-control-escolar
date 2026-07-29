import { revalidatePath } from "next/cache";

export function revalidateGroupPaths(groupId?: string) {
  [
    "/configuracion-academica/grupos",
    "/pagos",
    "/calendario-academico",
    "/calendario-academico/asignaciones",
    "/registrar-alumno",
    "/alumnos",
    "/"
  ].forEach((path) => revalidatePath(path));

  if (groupId) {
    revalidatePath(`/configuracion-academica/grupos/${groupId}`);
  }
}
