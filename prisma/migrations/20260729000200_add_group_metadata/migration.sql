-- Add metadata fields for academic groups and optional audit metadata.
ALTER TABLE "Group"
ADD COLUMN "code" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "createdById" TEXT,
ADD COLUMN "updatedById" TEXT,
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "AuditLog"
ADD COLUMN "metadata" JSONB;

CREATE INDEX "Group_active_academicLevelId_modalityId_idx" ON "Group"("active", "academicLevelId", "modalityId");
CREATE INDEX "Group_active_code_idx" ON "Group"("active", "code");
CREATE INDEX "Group_createdById_idx" ON "Group"("createdById");
CREATE INDEX "Group_updatedById_idx" ON "Group"("updatedById");

ALTER TABLE "Group"
ADD CONSTRAINT "Group_createdById_fkey"
FOREIGN KEY ("createdById")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Group"
ADD CONSTRAINT "Group_updatedById_fkey"
FOREIGN KEY ("updatedById")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
