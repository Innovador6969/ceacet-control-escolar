import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireUser } from "@/lib/auth/session";
import { createAcademicAssignment } from "@/lib/services/academic-calendar";

export async function POST(request: Request) {
  await requireUser();

  try {
    const payload = await request.json();
    const assignment = await createAcademicAssignment(payload);
    return NextResponse.json({ id: assignment.id });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Revisa los campos marcados.", issues: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "No fue posible crear la asignacion."
      },
      { status: 400 }
    );
  }
}
