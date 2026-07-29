import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireUser } from "@/lib/auth/session";
import { registerReEnrollmentPayment } from "@/lib/services/reenrollments";

export async function POST(request: Request) {
  const user = await requireUser();

  try {
    const payload = await request.json();
    const result = await registerReEnrollmentPayment(payload, user.id);
    return NextResponse.json(result);
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
            : "No fue posible registrar el pago."
      },
      { status: 400 }
    );
  }
}
