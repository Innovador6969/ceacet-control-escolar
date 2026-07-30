import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { revalidateGroupPaths } from "@/lib/groups-revalidation";
import { apiErrorResponse } from "@/lib/http/api-errors";
import { createGroup, getGroups } from "@/lib/services/groups";

function canManageGroups(role: UserRole) {
  return role !== UserRole.READ_ONLY;
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
    return apiErrorResponse(error, {
      fallback: "No fue posible crear el grupo.",
      conflictIncludes: ["Ya existe"]
    });
  }
}
