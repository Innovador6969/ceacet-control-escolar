import { Prisma, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { revalidateTeacherCatalogPaths } from "@/lib/catalog-revalidation";
import { apiErrorResponse } from "@/lib/http/api-errors";
import {
  activateTeacher,
  deactivateTeacher,
  getTeacherById,
  updateTeacher
} from "@/lib/services/teachers";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function canManage(role: UserRole) {
  return role !== UserRole.READ_ONLY;
}

export async function GET(_request: Request, context: RouteContext) {
  await requireUser();
  const { id } = await context.params;
  const teacher = await getTeacherById(id);

  if (!teacher) {
    return NextResponse.json({ message: "Docente no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ teacher });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await requireUser();

  if (!canManage(user.role)) {
    return NextResponse.json({ message: "No tienes permisos para administrar docentes." }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const payload = await request.json();
    const operation = String(payload.operation ?? "update");

    if (operation === "activate") {
      const teacher = await activateTeacher(id, user.id);
      revalidateTeacherCatalogPaths(teacher.id);
      return NextResponse.json({ id: teacher.id });
    }

    if (operation === "deactivate") {
      const result = await deactivateTeacher(id, user.id);
      revalidateTeacherCatalogPaths(result.teacher.id);
      return NextResponse.json({ id: result.teacher.id, dependencies: result.dependencies });
    }

    const teacher = await updateTeacher(id, payload, user.id);
    revalidateTeacherCatalogPaths(teacher.id);
    return NextResponse.json({ id: teacher.id });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "Ya existe un docente con esos datos." }, { status: 409 });
    }

    return apiErrorResponse(error, {
      fallback: "No fue posible actualizar el docente.",
      notFoundMessages: ["Docente no encontrado."],
      conflictIncludes: ["Ya existe", "No se"]
    });
  }
}
