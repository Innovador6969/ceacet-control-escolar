import { Prisma, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { getStudentById, updateStudent } from "@/lib/services/students";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function studentApiError(error: unknown, fallback: string) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        message: "Revisa los campos marcados.",
        issues: error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Ya existe un registro con los mismos datos." },
        { status: 409 }
      );
    }

    return NextResponse.json({ message: fallback }, { status: 500 });
  }

  if (error instanceof Error) {
    if (error.message === "Alumno no encontrado.") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    const isConflict = [
      "Ya existe",
      "No se puede registrar dos veces",
      "No fue posible generar una matricula unica"
    ].some((fragment) => error.message.includes(fragment));

    return NextResponse.json(
      { message: error.message },
      { status: isConflict ? 409 : 400 }
    );
  }

  return NextResponse.json({ message: fallback }, { status: 500 });
}

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const student = await getStudentById(id);

    if (!student) {
      return NextResponse.json({ message: "Alumno no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch {
    return NextResponse.json(
      { message: "No fue posible consultar el alumno." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  }

  if (user.role === UserRole.READ_ONLY) {
    return NextResponse.json(
      { message: "No tienes permisos para editar alumnos." },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  try {
    const payload = await request.json();
    const student = await updateStudent(id, payload, user.id);
    return NextResponse.json({ id: student.id });
  } catch (error) {
    return studentApiError(error, "No fue posible actualizar el alumno.");
  }
}
