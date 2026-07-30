import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { revalidateAcademicPeriodCatalogPaths } from "@/lib/catalog-revalidation";
import { apiErrorResponse } from "@/lib/http/api-errors";
import {
  createAcademicPeriod,
  getAcademicPeriods
} from "@/lib/services/academic-periods";

function canManageAcademicPeriods(role: UserRole) {
  return role !== UserRole.READ_ONLY;
}

export async function GET() {
  await requireUser();
  const academicPeriods = await getAcademicPeriods();
  return NextResponse.json({ academicPeriods });
}

export async function POST(request: Request) {
  const user = await requireUser();

  if (!canManageAcademicPeriods(user.role)) {
    return NextResponse.json(
      { message: "No tienes permisos para administrar periodos academicos." },
      { status: 403 }
    );
  }

  try {
    const payload = await request.json();
    const academicPeriod = await createAcademicPeriod(payload, user.id);
    revalidateAcademicPeriodCatalogPaths(academicPeriod.id);
    return NextResponse.json({ id: academicPeriod.id }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, {
      fallback: "No fue posible crear el periodo academico.",
      conflictIncludes: ["Ya existe"]
    });
  }
}
