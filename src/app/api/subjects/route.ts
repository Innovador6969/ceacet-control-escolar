import { Prisma, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { revalidateSubjectCatalogPaths } from "@/lib/catalog-revalidation";
import { apiErrorResponse } from "@/lib/http/api-errors";
import { createSubject, getSubjects } from "@/lib/services/subjects";

function canManage(role: UserRole) {
  return role !== UserRole.READ_ONLY;
}

export async function GET() {
  await requireUser();
  const subjects = await getSubjects();
  return NextResponse.json({ subjects });
}

export async function POST(request: Request) {
  const user = await requireUser();

  if (!canManage(user.role)) {
    return NextResponse.json({ message: "No tienes permisos para administrar materias." }, { status: 403 });
  }

  try {
    const payload = await request.json();
    const subject = await createSubject(payload, user.id);
    revalidateSubjectCatalogPaths(subject.id);
    return NextResponse.json({ id: subject.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "Ya existe una materia con esos datos." }, { status: 409 });
    }

    return apiErrorResponse(error, {
      fallback: "No fue posible crear la materia.",
      conflictIncludes: ["Ya existe"]
    });
  }
}
