import { Prisma, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { revalidateClassroomCatalogPaths } from "@/lib/catalog-revalidation";
import { apiErrorResponse } from "@/lib/http/api-errors";
import {
  activateClassroom,
  deactivateClassroom,
  getClassroomById,
  updateClassroom
} from "@/lib/services/classrooms";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function canManage(role: UserRole) {
  return role !== UserRole.READ_ONLY;
}

export async function GET(_request: Request, context: RouteContext) {
  await requireUser();
  const { id } = await context.params;
  const classroom = await getClassroomById(id);

  if (!classroom) {
    return NextResponse.json({ message: "Aula no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ classroom });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await requireUser();

  if (!canManage(user.role)) {
    return NextResponse.json({ message: "No tienes permisos para administrar aulas." }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const payload = await request.json();
    const operation = String(payload.operation ?? "update");

    if (operation === "activate") {
      const classroom = await activateClassroom(id, user.id);
      revalidateClassroomCatalogPaths(classroom.id);
      return NextResponse.json({ id: classroom.id });
    }

    if (operation === "deactivate") {
      const result = await deactivateClassroom(id, user.id);
      revalidateClassroomCatalogPaths(result.classroom.id);
      return NextResponse.json({ id: result.classroom.id, dependencies: result.dependencies });
    }

    const classroom = await updateClassroom(id, payload, user.id);
    revalidateClassroomCatalogPaths(classroom.id);
    return NextResponse.json({ id: classroom.id });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "Ya existe un aula con esos datos." }, { status: 409 });
    }

    return apiErrorResponse(error, {
      fallback: "No fue posible actualizar el aula.",
      notFoundMessages: ["Aula no encontrada."],
      conflictIncludes: ["Ya existe", "No se"]
    });
  }
}
