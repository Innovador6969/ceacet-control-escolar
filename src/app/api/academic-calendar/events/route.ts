import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireUser } from "@/lib/auth/session";
import { createCalendarEvent } from "@/lib/services/academic-calendar";

export async function POST(request: Request) {
  const user = await requireUser();

  try {
    const payload = await request.json();
    const event = await createCalendarEvent(payload, user.id);
    return NextResponse.json({ id: event.id });
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
          error instanceof Error ? error.message : "No fue posible crear el evento."
      },
      { status: 400 }
    );
  }
}
