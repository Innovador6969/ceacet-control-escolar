import { Prisma, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { revalidateClassroomCatalogPaths } from "@/lib/catalog-revalidation";
import { apiErrorResponse } from "@/lib/http/api-errors";
import { createClassroom, getClassrooms } from "@/lib/services/classrooms";

function canManage(role: UserRole) {
  return role !== UserRole.READ_ONLY;
}

export async function GET() {
  await requireUser();
  const classrooms = await getClassrooms();
  return NextResponse.json({ classrooms });
}

export async function POST(request: Request) {
  const user = await requireUser();

  if (!canManage(user.role)) {
    return NextResponse.json({ message: "No tienes permisos para administrar aulas." }, { status: 403 });
  }

  try {
    const payload = await request.json();
    const classroom = await createClassroom(payload, user.id);
    revalidateClassroomCatalogPaths(classroom.id);
    return NextResponse.json({ id: classroom.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "Ya existe un aula con esos datos." }, { status: 409 });
    }

    return apiErrorResponse(error, {
      fallback: "No fue posible crear el aula.",
      conflictIncludes: ["Ya existe"]
    });
  }
}
