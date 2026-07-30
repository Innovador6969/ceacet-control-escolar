-- Convierte materias, docentes y aulas en catalogos administrativos auditables.
-- Las reglas de duplicidad activa se validan transaccionalmente en servicios.
DROP INDEX IF EXISTS "Subject_code_key";
DROP INDEX IF EXISTS "Teacher_email_key";
DROP INDEX IF EXISTS "Classroom_name_key";

ALTER TABLE "Subject"
ADD COLUMN "description" TEXT,
ADD COLUMN "createdById" TEXT,
ADD COLUMN "updatedById" TEXT,
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Teacher"
ADD COLUMN "code" TEXT,
ADD COLUMN "specialty" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "createdById" TEXT,
ADD COLUMN "updatedById" TEXT,
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Classroom"
ADD COLUMN "code" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "createdById" TEXT,
ADD COLUMN "updatedById" TEXT,
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX "Subject_active_code_key"
ON "Subject"("code")
WHERE "active" = true;
CREATE UNIQUE INDEX "Subject_active_name_context_key"
ON "Subject"(LOWER("name"), "academicLevelId", (COALESCE("modalityId", '')))
WHERE "active" = true;
CREATE INDEX "Subject_createdById_idx" ON "Subject"("createdById");
CREATE INDEX "Subject_updatedById_idx" ON "Subject"("updatedById");

CREATE UNIQUE INDEX "Teacher_active_code_key"
ON "Teacher"("code")
WHERE "active" = true AND "code" IS NOT NULL;
CREATE UNIQUE INDEX "Teacher_active_email_key"
ON "Teacher"(LOWER("email"))
WHERE "active" = true AND "email" IS NOT NULL;
CREATE UNIQUE INDEX "Teacher_active_name_without_identifier_key"
ON "Teacher"(LOWER("name"))
WHERE "active" = true AND "code" IS NULL AND "email" IS NULL;
CREATE INDEX "Teacher_createdById_idx" ON "Teacher"("createdById");
CREATE INDEX "Teacher_updatedById_idx" ON "Teacher"("updatedById");

CREATE UNIQUE INDEX "Classroom_active_code_key"
ON "Classroom"("code")
WHERE "active" = true AND "code" IS NOT NULL;
CREATE UNIQUE INDEX "Classroom_active_location_name_key"
ON "Classroom"((COALESCE("location", '')), LOWER("name"))
WHERE "active" = true;
CREATE INDEX "Classroom_createdById_idx" ON "Classroom"("createdById");
CREATE INDEX "Classroom_updatedById_idx" ON "Classroom"("updatedById");

ALTER TABLE "Subject"
ADD CONSTRAINT "Subject_createdById_fkey"
FOREIGN KEY ("createdById")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Subject"
ADD CONSTRAINT "Subject_updatedById_fkey"
FOREIGN KEY ("updatedById")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Teacher"
ADD CONSTRAINT "Teacher_createdById_fkey"
FOREIGN KEY ("createdById")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Teacher"
ADD CONSTRAINT "Teacher_updatedById_fkey"
FOREIGN KEY ("updatedById")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Classroom"
ADD CONSTRAINT "Classroom_createdById_fkey"
FOREIGN KEY ("createdById")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Classroom"
ADD CONSTRAINT "Classroom_updatedById_fkey"
FOREIGN KEY ("updatedById")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
