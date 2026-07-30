import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireUser } from "@/lib/auth/session";
import { revalidateModalityPaths } from "@/lib/modalities-revalidation";
import { createModality, getModalities } from "@/lib/services/modalities";

function canManageModalities(role: UserRole) {
  return role !== UserRole.READ_ONLY;
}

function errorResponse(error: unknown, fallback: string) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { message: "Revisa los campos marcados.", issues: error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    if (error.message.includes("Ya existe")) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: fallback }, { status: 500 });
}

export async function GET() {
  await requireUser();
  const modalities = await getModalities();
  return NextResponse.json({ modalities });
}

export async function POST(request: Request) {
  const user = await requireUser();

  if (!canManageModalities(user.role)) {
    return NextResponse.json(
      { message: "No tienes permisos para administrar modalidades." },
      { status: 403 }
    );
  }

  try {
    const payload = await request.json();
    const modality = await createModality(payload, user.id);
    revalidateModalityPaths(modality.id);
    return NextResponse.json({ id: modality.id }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "No fue posible crear la modalidad.");
  }
}
