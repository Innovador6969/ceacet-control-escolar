import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import {
  getCatalogAuditHistory,
  isCatalogAuditEntity
} from "@/lib/services/catalog-audit";

type RouteContext = {
  params: Promise<{ entity: string; id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  await requireUser();
  const { entity, id } = await context.params;

  if (!isCatalogAuditEntity(entity)) {
    return NextResponse.json({ message: "Entidad de auditoria no valida." }, { status: 400 });
  }

  const entries = await getCatalogAuditHistory(entity, id);
  return NextResponse.json({ entries });
}
