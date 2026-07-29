import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireUser } from "@/lib/auth/session";
import { revalidateGroupPaths } from "@/lib/groups-revalidation";
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

function errorResponse(error: unknown, fallback: string) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { message: "Revisa los campos marcados.", issues: error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    if (error.message === "Grupo no encontrado.") {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error.message.includes("Ya existe") || error.message.includes("No se puede")) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: fallback }, { status: 500 });
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
    return errorResponse(error, "No fue posible actualizar el grupo.");
  }
}
