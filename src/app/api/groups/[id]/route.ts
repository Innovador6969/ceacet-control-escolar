import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { revalidateGroupPaths } from "@/lib/groups-revalidation";
import { apiErrorResponse } from "@/lib/http/api-errors";
import {
  activateGroup,
  deactivateGroup,
  getGroupById,
  updateGroup
} from "@/lib/services/groups";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function canManageGroups(role: UserRole) {
  return role !== UserRole.READ_ONLY;
}

export async function GET(_request: Request, context: RouteContext) {
  await requireUser();
  const { id } = await context.params;
  const group = await getGroupById(id);

  if (!group) {
    return NextResponse.json({ message: "Grupo no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ group });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await requireUser();

  if (!canManageGroups(user.role)) {
    return NextResponse.json(
      { message: "No tienes permisos para administrar grupos." },
      { status: 403 }
    );
  }

  const { id } = await context.params;

  try {
    const payload = await request.json();
    const operation = String(payload.operation ?? "update");

    if (operation === "activate") {
      const group = await activateGroup(id, user.id);
      revalidateGroupPaths(group.id);
      return NextResponse.json({ id: group.id });
    }

    if (operation === "deactivate") {
      const result = await deactivateGroup(id, user.id);
      revalidateGroupPaths(result.group.id);
      return NextResponse.json({ id: result.group.id, counts: result.counts });
    }

    const group = await updateGroup(id, payload, user.id);
    revalidateGroupPaths(group.id);
    return NextResponse.json({ id: group.id });
  } catch (error) {
    return apiErrorResponse(error, {
      fallback: "No fue posible actualizar el grupo.",
      notFoundMessages: ["Grupo no encontrado."],
      conflictIncludes: ["Ya existe", "No se puede"]
    });
  }
}
