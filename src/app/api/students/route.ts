import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireUser } from "@/lib/auth/session";
import { createStudent } from "@/lib/services/students";

export async function POST(request: Request) {
  await requireUser();

  try {
    const payload = await request.json();
    const student = await createStudent(payload);

    return NextResponse.json({
      id: student.id,
      enrollmentNumber: student.enrollmentNumber
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: "Revisa los campos marcados.",
          issues: error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "No fue posible registrar el alumno."
      },
      { status: 400 }
    );
  }
}
