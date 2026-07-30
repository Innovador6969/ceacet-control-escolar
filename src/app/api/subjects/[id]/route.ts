import { Prisma, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { revalidateSubjectCatalogPaths } from "@/lib/catalog-revalidation";
import { apiErrorResponse } from "@/lib/http/api-errors";
import {
  activateSubject,
  deactivateSubject,
  getSubjectById,
  updateSubject
} from "@/lib/services/subjects";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function canManage(role: UserRole) {
  return role !== UserRole.READ_ONLY;
}

export async function GET(_request: Request, context: RouteContext) {
  await requireUser();
  const { id } = await context.params;
  const subject = await getSubjectById(id);

  if (!subject) {
    return NextResponse.json({ message: "Materia no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ subject });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await requireUser();

  if (!canManage(user.role)) {
    return NextResponse.json({ message: "No tienes permisos para administrar materias." }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const payload = await request.json();
    const operation = String(payload.operation ?? "update");

    if (operation === "activate") {
      const subject = await activateSubject(id, user.id);
      revalidateSubjectCatalogPaths(subject.id);
      return NextResponse.json({ id: subject.id });
    }

    if (operation === "deactivate") {
      const result = await deactivateSubject(id, user.id);
      revalidateSubjectCatalogPaths(result.subject.id);
      return NextResponse.json({ id: result.subject.id, dependencies: result.dependencies });
    }

    const subject = await updateSubject(id, payload, user.id);
    revalidateSubjectCatalogPaths(subject.id);
    return NextResponse.json({ id: subject.id });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "Ya existe una materia con esos datos." }, { status: 409 });
    }

    return apiErrorResponse(error, {
      fallback: "No fue posible actualizar la materia.",
      notFoundMessages: ["Materia no encontrada."],
      conflictIncludes: ["Ya existe", "No se"]
    });
  }
}
