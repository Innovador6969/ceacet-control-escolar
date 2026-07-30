import { Prisma } from "@prisma/client";
import { cache } from "react";
import { prisma } from "@/lib/db";
import {
  academicLevelSchema,
  type AcademicLevelInput
} from "@/lib/validations/academic-level";
import { normalizeCatalogName } from "@/lib/validation/catalog-normalization";

export const academicLevelLabelSelect = {
  id: true,
  name: true,
  code: true,
  active: true,
  displayOrder: true
} satisfies Prisma.AcademicLevelSelect;

export type AcademicLevelLabelRecord = Prisma.AcademicLevelGetPayload<{
  select: typeof academicLevelLabelSelect;
}>;

const academicLevelCounts = {
  modalities: true,
  groups: true,
  enrollments: true,
  reEnrollments: true,
  subjects: true,
  academicAssignments: true,
  academicEvents: true
} satisfies Prisma.AcademicLevelCountOutputTypeSelect;

const academicLevelDetailInclude = {
  createdBy: { select: { id: true, name: true, email: true } },
  updatedBy: { select: { id: true, name: true, email: true } },
  _count: { select: academicLevelCounts }
} satisfies Prisma.AcademicLevelInclude;

type AcademicLevelSnapshot = {
  code?: string | null;
  name: string;
  description?: string | null;
  displayOrder: number;
  active: boolean;
};

const editableFields = ["code", "name", "description", "displayOrder", "active"] as const;

export function normalizeAcademicLevelName(value: string) {
  return normalizeCatalogName(value);
}

function snapshot(level: AcademicLevelSnapshot) {
  return {
    code: level.code ?? null,
    name: level.name,
    description: level.description ?? null,
    displayOrder: level.displayOrder,
    active: level.active
  };
}

function changedFields(previousData: AcademicLevelSnapshot, newData: AcademicLevelSnapshot) {
  const previous = snapshot(previousData);
  const next = snapshot(newData);

  return editableFields.filter((field) => previous[field] !== next[field]);
}

export const getActiveAcademicLevels = cache(async () => {
  return prisma.academicLevel.findMany({
    where: { active: true },
    select: academicLevelLabelSelect,
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }]
  });
});

export async function getAcademicLevels() {
  const [levels, activeModalityCounts, activeGroupCounts] = await Promise.all([
    prisma.academicLevel.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        displayOrder: true,
        active: true,
        updatedAt: true,
        updatedBy: { select: { name: true } },
        _count: { select: academicLevelCounts }
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }]
    }),
    prisma.modality.groupBy({
      by: ["academicLevelId"],
      where: { active: true },
      _count: { _all: true }
    }),
    prisma.group.groupBy({
      by: ["academicLevelId"],
      where: { active: true },
      _count: { _all: true }
    })
  ]);
  const activeModalitiesByLevel = new Map(
    activeModalityCounts.map((item) => [item.academicLevelId, item._count._all])
  );
  const activeGroupsByLevel = new Map(
    activeGroupCounts.map((item) => [item.academicLevelId, item._count._all])
  );

  return levels.map((level) => ({
    ...level,
    activeModalityCount: activeModalitiesByLevel.get(level.id) ?? 0,
    activeGroupCount: activeGroupsByLevel.get(level.id) ?? 0
  }));
}

export async function getAcademicLevelById(id: string) {
  const level = await prisma.academicLevel.findUnique({
    where: { id },
    include: {
      ...academicLevelDetailInclude,
      modalities: {
        select: { id: true, code: true, name: true, active: true },
        orderBy: [{ active: "desc" }, { name: "asc" }]
      },
      groups: {
        select: {
          id: true,
          code: true,
          name: true,
          active: true,
          schedule: true,
          capacity: true,
          modality: { select: { id: true, name: true } }
        },
        orderBy: [{ active: "desc" }, { name: "asc" }]
      }
    }
  });

  if (!level) return null;

  const [activeModalityCount, activeGroupCount] = await Promise.all([
    prisma.modality.count({ where: { academicLevelId: id, active: true } }),
    prisma.group.count({ where: { academicLevelId: id, active: true } })
  ]);

  return { ...level, activeModalityCount, activeGroupCount };
}

export async function getAcademicLevelDependencies(id: string) {
  return dependencyCounts(prisma, id);
}

async function assertNoActiveDuplicate(
  tx: Prisma.TransactionClient,
  data: { name: string; code?: string | null },
  excludeId?: string
) {
  const activeLevels = await tx.academicLevel.findMany({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      active: true
    },
    select: { id: true, name: true }
  });
  const normalizedName = normalizeAcademicLevelName(data.name);
  const duplicateName = activeLevels.find(
    (level) => normalizeAcademicLevelName(level.name) === normalizedName
  );

  if (duplicateName) {
    throw new Error("Ya existe un nivel academico activo con el mismo nombre.");
  }

  if (!data.code) return;

  const duplicateCode = await tx.academicLevel.findFirst({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      active: true,
      code: data.code
    },
    select: { id: true }
  });

  if (duplicateCode) {
    throw new Error("Ya existe un nivel academico activo con el mismo codigo.");
  }
}

async function dependencyCounts(
  tx: Prisma.TransactionClient | typeof prisma,
  academicLevelId: string
) {
  const [
    modalities,
    activeModalities,
    groups,
    activeGroups,
    enrollments,
    reEnrollments,
    subjects,
    academicAssignments,
    academicEvents
  ] = await Promise.all([
    tx.modality.count({ where: { academicLevelId } }),
    tx.modality.count({ where: { academicLevelId, active: true } }),
    tx.group.count({ where: { academicLevelId } }),
    tx.group.count({ where: { academicLevelId, active: true } }),
    tx.enrollment.count({ where: { academicLevelId } }),
    tx.reEnrollment.count({ where: { academicLevelId } }),
    tx.subject.count({ where: { academicLevelId } }),
    tx.academicAssignment.count({ where: { academicLevelId } }),
    tx.academicCalendarEvent.count({ where: { academicLevelId } })
  ]);

  return {
    modalities,
    activeModalities,
    groups,
    activeGroups,
    enrollments,
    reEnrollments,
    subjects,
    academicAssignments,
    academicEvents
  };
}

function hasHistoricalDependencies(counts: Awaited<ReturnType<typeof dependencyCounts>>) {
  return [
    counts.modalities,
    counts.groups,
    counts.enrollments,
    counts.reEnrollments,
    counts.subjects,
    counts.academicAssignments,
    counts.academicEvents
  ].some((count) => count > 0);
}

function nameChangeDependencyMessage(counts: Awaited<ReturnType<typeof dependencyCounts>>) {
  const reasons = [
    counts.modalities ? `${counts.modalities} modalidad(es)` : "",
    counts.groups ? `${counts.groups} grupo(s)` : "",
    counts.enrollments ? `${counts.enrollments} inscripcion(es)` : "",
    counts.reEnrollments ? `${counts.reEnrollments} reinscripcion(es)` : "",
    counts.subjects ? `${counts.subjects} materia(s)` : "",
    counts.academicAssignments ? `${counts.academicAssignments} asignacion(es)` : "",
    counts.academicEvents ? `${counts.academicEvents} evento(s)` : ""
  ].filter(Boolean);

  return `No se puede cambiar el nombre porque el nivel academico tiene ${reasons.join(", ")}.`;
}

async function writeAuditLog(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    academicLevelId: string;
    action: string;
    previousData?: Prisma.InputJsonValue;
    newData?: Prisma.InputJsonValue;
    changedFields?: string[];
    route?: string;
    operation: string;
  }
) {
  await tx.auditLog.create({
    data: {
      userId: params.userId,
      entity: "AcademicLevel",
      entityId: params.academicLevelId,
      action: params.action,
      previousData: params.previousData,
      newData: params.newData,
      metadata: {
        source: "configuration-academic-levels",
        route: params.route ?? "/configuracion-academica/niveles-academicos",
        operation: params.operation,
        changedFields: params.changedFields ?? []
      }
    }
  });
}

export async function createAcademicLevel(input: AcademicLevelInput, userId: string) {
  const data = academicLevelSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    await assertNoActiveDuplicate(tx, data);

    const level = await tx.academicLevel.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        displayOrder: data.displayOrder,
        active: data.active ?? true,
        createdById: userId,
        updatedById: userId
      },
      include: academicLevelDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      academicLevelId: level.id,
      action: "ACADEMIC_LEVEL_CREATED",
      newData: snapshot(level),
      changedFields: editableFields.slice(),
      operation: "create"
    });

    return level;
  });
}

export async function updateAcademicLevel(
  id: string,
  input: AcademicLevelInput,
  userId: string
) {
  const data = academicLevelSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.academicLevel.findUnique({
      where: { id },
      include: academicLevelDetailInclude
    });

    if (!existing) {
      throw new Error("Nivel academico no encontrado.");
    }

    if (normalizeAcademicLevelName(existing.name) !== normalizeAcademicLevelName(data.name)) {
      const counts = await dependencyCounts(tx, id);

      if (hasHistoricalDependencies(counts)) {
        throw new Error(nameChangeDependencyMessage(counts));
      }
    }

    await assertNoActiveDuplicate(tx, data, id);

    const updated = await tx.academicLevel.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        displayOrder: data.displayOrder,
        active: data.active ?? existing.active,
        updatedById: userId
      },
      include: academicLevelDetailInclude
    });
    const fields = changedFields(existing, updated);

    await writeAuditLog(tx, {
      userId,
      academicLevelId: updated.id,
      action: "ACADEMIC_LEVEL_UPDATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: fields,
      operation: "update",
      route: `/configuracion-academica/niveles-academicos/${id}`
    });

    return updated;
  });
}

export async function activateAcademicLevel(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.academicLevel.findUnique({
      where: { id },
      include: academicLevelDetailInclude
    });

    if (!existing) {
      throw new Error("Nivel academico no encontrado.");
    }

    await assertNoActiveDuplicate(tx, existing, id);

    const updated = await tx.academicLevel.update({
      where: { id },
      data: { active: true, updatedById: userId },
      include: academicLevelDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      academicLevelId: updated.id,
      action: "ACADEMIC_LEVEL_ACTIVATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: ["active"],
      operation: "activate",
      route: `/configuracion-academica/niveles-academicos/${id}`
    });

    return updated;
  });
}

export async function deactivateAcademicLevel(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.academicLevel.findUnique({
      where: { id },
      include: academicLevelDetailInclude
    });

    if (!existing) {
      throw new Error("Nivel academico no encontrado.");
    }

    const counts = await dependencyCounts(tx, id);

    if (counts.activeModalities > 0 || counts.activeGroups > 0) {
      throw new Error(
        `No es posible desactivar este nivel academico porque tiene ${counts.activeModalities} modalidad(es) activa(s) y ${counts.activeGroups} grupo(s) activo(s).`
      );
    }

    const updated = await tx.academicLevel.update({
      where: { id },
      data: { active: false, updatedById: userId },
      include: academicLevelDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      academicLevelId: updated.id,
      action: "ACADEMIC_LEVEL_DEACTIVATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: ["active"],
      operation: "deactivate",
      route: `/configuracion-academica/niveles-academicos/${id}`
    });

    return { academicLevel: updated, counts };
  });
}
