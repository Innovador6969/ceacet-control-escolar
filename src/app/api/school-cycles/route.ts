import { Prisma, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { revalidateSchoolCycleCatalogPaths } from "@/lib/catalog-revalidation";
import { apiErrorResponse } from "@/lib/http/api-errors";
import { createSchoolCycle, getSchoolCycles } from "@/lib/services/school-cycles";

function canManageSchoolCycles(role: UserRole) {
  return role !== UserRole.READ_ONLY;
}

export async function GET() {
  await requireUser();
  const schoolCycles = await getSchoolCycles();
  return NextResponse.json({ schoolCycles });
}

export async function POST(request: Request) {
  const user = await requireUser();

  if (!canManageSchoolCycles(user.role)) {
    return NextResponse.json(
      { message: "No tienes permisos para administrar ciclos escolares." },
      { status: 403 }
    );
  }

  try {
    const payload = await request.json();
    const schoolCycle = await createSchoolCycle(payload, user.id);
    revalidateSchoolCycleCatalogPaths(schoolCycle.id);
    return NextResponse.json({ id: schoolCycle.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { message: "Ya existe un ciclo escolar marcado como actual. Intenta nuevamente." },
        { status: 409 }
      );
    }

    return apiErrorResponse(error, {
      fallback: "No fue posible crear el ciclo escolar.",
      conflictIncludes: ["Ya existe"]
    });
  }
}
