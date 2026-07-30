import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getActiveAcademicLevels } from "@/lib/services/academic-levels";
import { modalitySchema, type ModalityInput } from "@/lib/validations/modality";

export const modalityLabelSelect = {
  id: true,
  name: true,
  code: true,
  academicLevelId: true,
  academicLevel: {
    select: {
      id: true,
      name: true
    }
  }
} satisfies Prisma.ModalitySelect;

export type ModalityLabelRecord = Prisma.ModalityGetPayload<{
  select: typeof modalityLabelSelect;
}>;

const modalityCounts = {
  groups: true,
  enrollments: true,
  reEnrollments: true,
  subjects: true,
  academicAssignments: true,
  academicEvents: true
} satisfies Prisma.ModalityCountOutputTypeSelect;

const modalityDetailInclude = {
  academicLevel: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  updatedBy: { select: { id: true, name: true, email: true } },
  _count: { select: modalityCounts }
} satisfies Prisma.ModalityInclude;

type ModalitySnapshot = {
  code?: string | null;
  name: string;
  description?: string | null;
  academicLevelId: string;
  active: boolean;
};

const editableFields = ["code", "name", "description", "academicLevelId", "active"] as const;

export function normalizeModalityName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function snapshot(modality: ModalitySnapshot) {
  return {
    code: modality.code ?? null,
    name: modality.name,
    description: modality.description ?? null,
    academicLevelId: modality.academicLevelId,
    active: modality.active
  };
}

function changedFields(previousData: ModalitySnapshot, newData: ModalitySnapshot) {
  const previous = snapshot(previousData);
  const next = snapshot(newData);

  return editableFields.filter((field) => previous[field] !== next[field]);
}

export async function getActiveModalities() {
  return prisma.modality.findMany({
    where: { active: true },
    select: modalityLabelSelect,
    orderBy: [{ academicLevel: { name: "asc" } }, { name: "asc" }]
  });
}

export async function getModalitiesByAcademicLevel(academicLevelId: string) {
  return prisma.modality.findMany({
    where: { active: true, academicLevelId },
    select: modalityLabelSelect,
    orderBy: { name: "asc" }
  });
}

export async function getModalities() {
  const modalities = await prisma.modality.findMany({
    include: modalityDetailInclude,
    orderBy: [{ academicLevel: { name: "asc" } }, { name: "asc" }]
  });
  const activeGroupCounts = await prisma.group.groupBy({
    by: ["modalityId"],
    where: { active: true },
    _count: { _all: true }
  });
  const activeGroupsByModality = new Map(
    activeGroupCounts.map((item) => [item.modalityId, item._count._all])
  );

  return modalities.map((modality) => ({
    ...modality,
    activeGroupCount: activeGroupsByModality.get(modality.id) ?? 0
  }));
}

export async function getModalityById(id: string) {
  const modality = await prisma.modality.findUnique({
    where: { id },
    include: {
      ...modalityDetailInclude,
      groups: {
        select: { id: true, name: true, active: true, schedule: true, capacity: true },
        orderBy: [{ active: "desc" }, { name: "asc" }]
      }
    }
  });

  if (!modality) return null;

  const activeGroupCount = await prisma.group.count({
    where: { modalityId: id, active: true }
  });

  return { ...modality, activeGroupCount };
}

export async function getModalityFormCatalogs(currentAcademicLevelId?: string) {
  const activeLevels = await getActiveAcademicLevels();
  const hasCurrentLevel =
    currentAcademicLevelId &&
    activeLevels.some((level) => level.id === currentAcademicLevelId);
  const currentLevel =
    currentAcademicLevelId && !hasCurrentLevel
      ? await prisma.academicLevel.findUnique({
          where: { id: currentAcademicLevelId },
          select: {
            id: true,
            name: true,
            code: true,
            active: true,
            displayOrder: true
          }
        })
      : null;
  const academicLevels = currentLevel ? [...activeLevels, currentLevel] : activeLevels;

  return { academicLevels };
}

export async function getModalityAuditHistory(id: string) {
  return prisma.auditLog.findMany({
    where: { entity: "Modality", entityId: id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" }
  });
}

async function validateAcademicLevel(tx: Prisma.TransactionClient, academicLevelId: string) {
  const academicLevel = await tx.academicLevel.findUniqueOrThrow({
    where: { id: academicLevelId },
    select: { id: true, active: true }
  });

  if (!academicLevel.active) {
    throw new Error("El nivel academico seleccionado esta inactivo.");
  }
}

async function assertNoActiveDuplicate(
  tx: Prisma.TransactionClient,
  data: { name: string; academicLevelId: string; code?: string | null },
  excludeId?: string
) {
  const activeModalities = await tx.modality.findMany({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      active: true,
      academicLevelId: data.academicLevelId
    },
    select: { id: true, name: true }
  });
  const normalizedName = normalizeModalityName(data.name);
  const duplicateName = activeModalities.find(
    (modality) => normalizeModalityName(modality.name) === normalizedName
  );

  if (duplicateName) {
    throw new Error("Ya existe una modalidad activa con el mismo nombre y nivel academico.");
  }

  if (!data.code) return;

  const duplicateCode = await tx.modality.findFirst({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      active: true,
      code: data.code
    },
    select: { id: true }
  });

  if (duplicateCode) {
    throw new Error("Ya existe una modalidad activa con el mismo codigo.");
  }
}

async function dependencyCounts(tx: Prisma.TransactionClient, modalityId: string) {
  const [
    groups,
    activeGroups,
    enrollments,
    reEnrollments,
    subjects,
    academicAssignments,
    academicEvents
  ] = await Promise.all([
    tx.group.count({ where: { modalityId } }),
    tx.group.count({ where: { modalityId, active: true } }),
    tx.enrollment.count({ where: { modalityId } }),
    tx.reEnrollment.count({ where: { modalityId } }),
    tx.subject.count({ where: { modalityId } }),
    tx.academicAssignment.count({ where: { modalityId } }),
    tx.academicCalendarEvent.count({ where: { modalityId } })
  ]);

  return {
    groups,
    activeGroups,
    enrollments,
    reEnrollments,
    subjects,
    academicAssignments,
    academicEvents
  };
}

function dependencyMessage(counts: Awaited<ReturnType<typeof dependencyCounts>>) {
  const reasons = [
    counts.groups ? `${counts.groups} grupo(s)` : "",
    counts.enrollments ? `${counts.enrollments} inscripcion(es)` : "",
    counts.reEnrollments ? `${counts.reEnrollments} reinscripcion(es)` : "",
    counts.subjects ? `${counts.subjects} materia(s)` : "",
    counts.academicAssignments ? `${counts.academicAssignments} asignacion(es)` : "",
    counts.academicEvents ? `${counts.academicEvents} evento(s)` : ""
  ].filter(Boolean);

  return `No se puede cambiar el nivel academico porque la modalidad tiene ${reasons.join(", ")}.`;
}

async function writeAuditLog(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    modalityId: string;
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
      entity: "Modality",
      entityId: params.modalityId,
      action: params.action,
      previousData: params.previousData,
      newData: params.newData,
      metadata: {
        source: "configuration-academic-modalities",
        route: params.route ?? "/configuracion-academica/modalidades",
        operation: params.operation,
        changedFields: params.changedFields ?? []
      }
    }
  });
}

export async function createModality(input: ModalityInput, userId: string) {
  const data = modalitySchema.parse(input);

  return prisma.$transaction(async (tx) => {
    await validateAcademicLevel(tx, data.academicLevelId);
    await assertNoActiveDuplicate(tx, data);

    const modality = await tx.modality.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        academicLevelId: data.academicLevelId,
        active: data.active ?? true,
        createdById: userId,
        updatedById: userId
      },
      include: modalityDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      modalityId: modality.id,
      action: "MODALITY_CREATED",
      newData: snapshot(modality),
      changedFields: editableFields.slice(),
      operation: "create"
    });

    return modality;
  });
}

export async function updateModality(id: string, input: ModalityInput, userId: string) {
  const data = modalitySchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.modality.findUnique({
      where: { id },
      include: modalityDetailInclude
    });

    if (!existing) {
      throw new Error("Modalidad no encontrada.");
    }

    await validateAcademicLevel(tx, data.academicLevelId);

    if (existing.academicLevelId !== data.academicLevelId) {
      const counts = await dependencyCounts(tx, id);
      const hasDependencies = Object.entries(counts).some(
        ([key, count]) => key !== "activeGroups" && count > 0
      );

      if (hasDependencies) {
        throw new Error(dependencyMessage(counts));
      }
    }

    await assertNoActiveDuplicate(tx, data, id);

    const updated = await tx.modality.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        academicLevelId: data.academicLevelId,
        active: data.active ?? existing.active,
        updatedById: userId
      },
      include: modalityDetailInclude
    });
    const fields = changedFields(existing, updated);

    await writeAuditLog(tx, {
      userId,
      modalityId: updated.id,
      action: "MODALITY_UPDATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: fields,
      operation: "update",
      route: `/configuracion-academica/modalidades/${id}`
    });

    return updated;
  });
}

export async function activateModality(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.modality.findUnique({
      where: { id },
      include: modalityDetailInclude
    });

    if (!existing) {
      throw new Error("Modalidad no encontrada.");
    }

    await validateAcademicLevel(tx, existing.academicLevelId);
    await assertNoActiveDuplicate(tx, existing, id);

    const updated = await tx.modality.update({
      where: { id },
      data: { active: true, updatedById: userId },
      include: modalityDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      modalityId: updated.id,
      action: "MODALITY_ACTIVATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: ["active"],
      operation: "activate",
      route: `/configuracion-academica/modalidades/${id}`
    });

    return updated;
  });
}

export async function deactivateModality(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.modality.findUnique({
      where: { id },
      include: modalityDetailInclude
    });

    if (!existing) {
      throw new Error("Modalidad no encontrada.");
    }

    const counts = await dependencyCounts(tx, id);

    if (counts.activeGroups > 0) {
      throw new Error(
        `No se puede desactivar la modalidad porque tiene ${counts.activeGroups} grupo(s) activo(s).`
      );
    }

    const updated = await tx.modality.update({
      where: { id },
      data: { active: false, updatedById: userId },
      include: modalityDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      modalityId: updated.id,
      action: "MODALITY_DEACTIVATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: ["active"],
      operation: "deactivate",
      route: `/configuracion-academica/modalidades/${id}`
    });

    return { modality: updated, counts };
  });
}
