import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireUser } from "@/lib/auth/session";
import { revalidateGroupPaths } from "@/lib/groups-revalidation";
import { createGroup, getGroups } from "@/lib/services/groups";

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
    if (error.message.includes("Ya existe")) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: fallback }, { status: 500 });
}

export async function GET() {
  await requireUser();
  const groups = await getGroups();
  return NextResponse.json({ groups });
}

export async function POST(request: Request) {
  const user = await requireUser();

  if (!canManageGroups(user.role)) {
    return NextResponse.json(
      { message: "No tienes permisos para administrar grupos." },
      { status: 403 }
    );
  }

  try {
    const payload = await request.json();
    const group = await createGroup(payload, user.id);
    revalidateGroupPaths(group.id);
    return NextResponse.json({ id: group.id }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "No fue posible crear el grupo.");
  }
}
