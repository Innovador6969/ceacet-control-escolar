import { Prisma, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { revalidateTeacherCatalogPaths } from "@/lib/catalog-revalidation";
import { apiErrorResponse } from "@/lib/http/api-errors";
import { createTeacher, getTeachers } from "@/lib/services/teachers";

function canManage(role: UserRole) {
  return role !== UserRole.READ_ONLY;
}

export async function GET() {
  await requireUser();
  const teachers = await getTeachers();
  return NextResponse.json({ teachers });
}

export async function POST(request: Request) {
  const user = await requireUser();

  if (!canManage(user.role)) {
    return NextResponse.json({ message: "No tienes permisos para administrar docentes." }, { status: 403 });
  }

  try {
    const payload = await request.json();
    const teacher = await createTeacher(payload, user.id);
    revalidateTeacherCatalogPaths(teacher.id);
    return NextResponse.json({ id: teacher.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "Ya existe un docente con esos datos." }, { status: 409 });
    }

    return apiErrorResponse(error, {
      fallback: "No fue posible crear el docente.",
      conflictIncludes: ["Ya existe"]
    });
  }
}
