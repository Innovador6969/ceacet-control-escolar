import { Prisma, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { revalidateSchoolCycleCatalogPaths } from "@/lib/catalog-revalidation";
import { apiErrorResponse } from "@/lib/http/api-errors";
import {
  activateSchoolCycle,
  deactivateSchoolCycle,
  getSchoolCycleById,
  setCurrentSchoolCycle,
  updateSchoolCycle
} from "@/lib/services/school-cycles";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function canManageSchoolCycles(role: UserRole) {
  return role !== UserRole.READ_ONLY;
}

export async function GET(_request: Request, context: RouteContext) {
  await requireUser();
  const { id } = await context.params;
  const schoolCycle = await getSchoolCycleById(id);

  if (!schoolCycle) {
    return NextResponse.json({ message: "Ciclo escolar no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ schoolCycle });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await requireUser();

  if (!canManageSchoolCycles(user.role)) {
    return NextResponse.json(
      { message: "No tienes permisos para administrar ciclos escolares." },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  try {
    const payload = await request.json();
    const operation = String(payload.operation ?? "update");

    if (operation === "activate") {
      const schoolCycle = await activateSchoolCycle(id, user.id);
      revalidateSchoolCycleCatalogPaths(schoolCycle.id);
      return NextResponse.json({ id: schoolCycle.id });
    }

    if (operation === "deactivate") {
      const result = await deactivateSchoolCycle(id, user.id);
      revalidateSchoolCycleCatalogPaths(result.schoolCycle.id);
      return NextResponse.json({ id: result.schoolCycle.id, dependencies: result.dependencies });
    }

    if (operation === "set-current") {
      const schoolCycle = await setCurrentSchoolCycle(id, user.id);
      revalidateSchoolCycleCatalogPaths(schoolCycle.id);
      return NextResponse.json({ id: schoolCycle.id });
    }

    const schoolCycle = await updateSchoolCycle(id, payload, user.id);
    revalidateSchoolCycleCatalogPaths(schoolCycle.id);
    return NextResponse.json({ id: schoolCycle.id });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { message: "Ya existe un ciclo escolar marcado como actual. Intenta nuevamente." },
        { status: 409 }
      );
    }

    return apiErrorResponse(error, {
      fallback: "No fue posible actualizar el ciclo escolar.",
      notFoundMessages: ["Ciclo escolar no encontrado."],
      conflictIncludes: ["Ya existe", "No se"]
    });
  }
}
