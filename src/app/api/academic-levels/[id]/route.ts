import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireUser } from "@/lib/auth/session";
import { revalidateAcademicLevelPaths } from "@/lib/academic-levels-revalidation";
import {
  activateAcademicLevel,
  deactivateAcademicLevel,
  getAcademicLevelById,
  updateAcademicLevel
} from "@/lib/services/academic-levels";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function canManageAcademicLevels(role: UserRole) {
  return role !== UserRole.READ_ONLY;
}

function errorResponse(error: unknown, fallback: string) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { message: "Revisa los campos marcados.", issues: error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    if (error.message === "Nivel academico no encontrado.") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error.message.includes("Ya existe") || error.message.includes("No se")) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: fallback }, { status: 500 });
}

export async function GET(_request: Request, context: RouteContext) {
  await requireUser();
  const { id } = await context.params;
  const academicLevel = await getAcademicLevelById(id);

  if (!academicLevel) {
    return NextResponse.json({ message: "Nivel academico no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ academicLevel });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await requireUser();

  if (!canManageAcademicLevels(user.role)) {
    return NextResponse.json(
      { message: "No tienes permisos para administrar niveles academicos." },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  try {
    const payload = await request.json();
    const operation = String(payload.operation ?? "update");

    if (operation === "activate") {
      const academicLevel = await activateAcademicLevel(id, user.id);
      revalidateAcademicLevelPaths(academicLevel.id);
      return NextResponse.json({ id: academicLevel.id });
    }

    if (operation === "deactivate") {
      const result = await deactivateAcademicLevel(id, user.id);
      revalidateAcademicLevelPaths(result.academicLevel.id);
      return NextResponse.json({ id: result.academicLevel.id, counts: result.counts });
    }

    const academicLevel = await updateAcademicLevel(id, payload, user.id);
    revalidateAcademicLevelPaths(academicLevel.id);
    return NextResponse.json({ id: academicLevel.id });
  } catch (error) {
    return errorResponse(error, "No fue posible actualizar el nivel academico.");
  }
}
