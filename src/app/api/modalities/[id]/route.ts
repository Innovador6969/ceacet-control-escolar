import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { revalidateModalityPaths } from "@/lib/modalities-revalidation";
import { apiErrorResponse } from "@/lib/http/api-errors";
import {
  activateModality,
  deactivateModality,
  getModalityById,
  updateModality
} from "@/lib/services/modalities";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function canManageModalities(role: UserRole) {
  return role !== UserRole.READ_ONLY;
}

export async function GET(_request: Request, context: RouteContext) {
  await requireUser();
  const { id } = await context.params;
  const modality = await getModalityById(id);

  if (!modality) {
    return NextResponse.json({ message: "Modalidad no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ modality });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await requireUser();

  if (!canManageModalities(user.role)) {
    return NextResponse.json(
      { message: "No tienes permisos para administrar modalidades." },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  try {
    const payload = await request.json();
    const operation = String(payload.operation ?? "update");

    if (operation === "activate") {
      const modality = await activateModality(id, user.id);
      revalidateModalityPaths(modality.id);
      return NextResponse.json({ id: modality.id });
    }

    if (operation === "deactivate") {
      const result = await deactivateModality(id, user.id);
      revalidateModalityPaths(result.modality.id);
      return NextResponse.json({ id: result.modality.id, counts: result.counts });
    }

    const modality = await updateModality(id, payload, user.id);
    revalidateModalityPaths(modality.id);
    return NextResponse.json({ id: modality.id });
  } catch (error) {
    return apiErrorResponse(error, {
      fallback: "No fue posible actualizar la modalidad.",
      notFoundMessages: ["Modalidad no encontrada."],
      conflictIncludes: ["Ya existe", "No se puede"]
    });
  }
}
