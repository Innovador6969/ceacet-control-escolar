import type { Prisma } from "@prisma/client";

export type CatalogUserSummary = {
  name: string;
  email: string;
} | null;

export type CatalogMetadataRecord = {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: CatalogUserSummary;
  updatedBy?: CatalogUserSummary;
};

export type CatalogAuditValue = string | number | boolean | null | undefined;

export type CatalogAuditEntry = {
  id: string;
  action: string;
  createdAt: Date | string;
  previousData?: Prisma.JsonValue;
  newData?: Prisma.JsonValue;
  metadata?: Prisma.JsonValue;
  user?: CatalogUserSummary;
};

export type AcademicLevelOption = {
  id: string;
  name: string;
};

export type ModalityOption = {
  id: string;
  name: string;
  academicLevelId: string;
};

export type GroupOption = {
  id: string;
  name: string;
  academicLevel: AcademicLevelOption;
  modality: { id: string; name: string };
};
