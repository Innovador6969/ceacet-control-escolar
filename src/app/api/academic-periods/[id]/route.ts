import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { revalidateAcademicPeriodCatalogPaths } from "@/lib/catalog-revalidation";
import { apiErrorResponse } from "@/lib/http/api-errors";
import {
  activateAcademicPeriod,
  deactivateAcademicPeriod,
  getAcademicPeriodById,
  updateAcademicPeriod
} from "@/lib/services/academic-periods";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function canManageAcademicPeriods(role: UserRole) {
  return role !== UserRole.READ_ONLY;
}

export async function GET(_request: Request, context: RouteContext) {
  await requireUser();
  const { id } = await context.params;
  const academicPeriod = await getAcademicPeriodById(id);

  if (!academicPeriod) {
    return NextResponse.json({ message: "Periodo academico no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ academicPeriod });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await requireUser();

  if (!canManageAcademicPeriods(user.role)) {
    return NextResponse.json(
      { message: "No tienes permisos para administrar periodos academicos." },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  try {
    const payload = await request.json();
    const operation = String(payload.operation ?? "update");

    if (operation === "activate") {
      const academicPeriod = await activateAcademicPeriod(id, user.id);
      revalidateAcademicPeriodCatalogPaths(academicPeriod.id);
      return NextResponse.json({ id: academicPeriod.id });
    }

    if (operation === "deactivate") {
      const result = await deactivateAcademicPeriod(id, user.id);
      revalidateAcademicPeriodCatalogPaths(result.academicPeriod.id);
      return NextResponse.json({
        id: result.academicPeriod.id,
        dependencies: result.dependencies
      });
    }

    const academicPeriod = await updateAcademicPeriod(id, payload, user.id);
    revalidateAcademicPeriodCatalogPaths(academicPeriod.id);
    return NextResponse.json({ id: academicPeriod.id });
  } catch (error) {
    return apiErrorResponse(error, {
      fallback: "No fue posible actualizar el periodo academico.",
      notFoundMessages: ["Periodo academico no encontrado."],
      conflictIncludes: ["Ya existe", "No se"]
    });
  }
}
