import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireUser } from "@/lib/auth/session";
import { revalidateAcademicLevelPaths } from "@/lib/academic-levels-revalidation";
import {
  createAcademicLevel,
  getAcademicLevels
} from "@/lib/services/academic-levels";

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
    if (error.message.includes("Ya existe")) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: fallback }, { status: 500 });
}

export async function GET() {
  await requireUser();
  const academicLevels = await getAcademicLevels();
  return NextResponse.json({ academicLevels });
}

export async function POST(request: Request) {
  const user = await requireUser();

  if (!canManageAcademicLevels(user.role)) {
    return NextResponse.json(
      { message: "No tienes permisos para administrar niveles academicos." },
      { status: 403 }
    );
  }

  try {
    const payload = await request.json();
    const academicLevel = await createAcademicLevel(payload, user.id);
    revalidateAcademicLevelPaths(academicLevel.id);
    return NextResponse.json({ id: academicLevel.id }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "No fue posible crear el nivel academico.");
  }
}
