import { prisma } from "@/lib/db";

export const catalogAuditEntities = ["AcademicLevel", "Modality", "Group"] as const;

export type CatalogAuditEntity = (typeof catalogAuditEntities)[number];

export function isCatalogAuditEntity(value: string): value is CatalogAuditEntity {
  return catalogAuditEntities.some((entity) => entity === value);
}

export async function getCatalogAuditHistory(entity: CatalogAuditEntity, entityId: string) {
  return prisma.auditLog.findMany({
    where: { entity, entityId },
    select: {
      id: true,
      action: true,
      createdAt: true,
      previousData: true,
      newData: true,
      metadata: true,
      user: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function countCatalogAuditEntries(entity: CatalogAuditEntity, entityId: string) {
  return prisma.auditLog.count({
    where: { entity, entityId }
  });
}
