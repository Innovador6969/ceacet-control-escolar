import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { revalidateModalityPaths } from "@/lib/modalities-revalidation";
import { apiErrorResponse } from "@/lib/http/api-errors";
import { createModality, getModalities } from "@/lib/services/modalities";

function canManageModalities(role: UserRole) {
  return role !== UserRole.READ_ONLY;
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
    return apiErrorResponse(error, {
      fallback: "No fue posible crear la modalidad.",
      conflictIncludes: ["Ya existe"]
    });
  }
}
