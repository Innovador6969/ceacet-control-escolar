import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { revalidateAcademicLevelPaths } from "@/lib/academic-levels-revalidation";
import { apiErrorResponse } from "@/lib/http/api-errors";
import {
  createAcademicLevel,
  getAcademicLevels
} from "@/lib/services/academic-levels";

function canManageAcademicLevels(role: UserRole) {
  return role !== UserRole.READ_ONLY;
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
    return apiErrorResponse(error, {
      fallback: "No fue posible crear el nivel academico.",
      conflictIncludes: ["Ya existe"]
    });
  }
}
