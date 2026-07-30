import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getActiveAcademicLevels } from "@/lib/services/academic-levels";
import { getActiveModalities, modalityLabelSelect } from "@/lib/services/modalities";
import { groupSchema, type GroupInput } from "@/lib/validations/group";

export const groupLabelSelect = {
  id: true,
  name: true,
  academicLevelId: true,
  modalityId: true,
  academicLevel: {
    select: {
      id: true,
      name: true
    }
  },
  modality: {
    select: {
      id: true,
      name: true
    }
  }
} satisfies Prisma.GroupSelect;

export type GroupLabelRecord = Prisma.GroupGetPayload<{
  select: typeof groupLabelSelect;
}>;

const groupCounts = {
  enrollments: true,
  reEnrollments: true,
  academicAssignments: true,
  academicEvents: true
} satisfies Prisma.GroupCountOutputTypeSelect;

const groupDetailInclude = {
  academicLevel: { select: { id: true, name: true } },
  modality: { select: { id: true, name: true, academicLevelId: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  updatedBy: { select: { id: true, name: true, email: true } },
  _count: { select: groupCounts }
} satisfies Prisma.GroupInclude;

type GroupSnapshot = {
  code?: string | null;
  name: string;
  description?: string | null;
  academicLevelId: string;
  modalityId: string;
  schedule?: string | null;
  capacity?: number | null;
  active: boolean;
};

const editableFields = [
  "code",
  "name",
  "description",
  "academicLevelId",
  "modalityId",
  "schedule",
  "capacity",
  "active"
] as const;

export async function getActiveGroups() {
  return prisma.group.findMany({
    where: { active: true },
    select: groupLabelSelect,
    orderBy: [
      { academicLevel: { name: "asc" } },
      { modality: { name: "asc" } },
      { name: "asc" }
    ]
  });
}

export async function getGroups() {
  return prisma.group.findMany({
    include: groupDetailInclude,
    orderBy: [
      { academicLevel: { name: "asc" } },
      { modality: { name: "asc" } },
      { name: "asc" }
    ]
  });
}

export async function getGroupFormCatalogs(
  currentAcademicLevelId?: string,
  currentModalityId?: string
) {
  const [activeLevels, activeModalities] = await Promise.all([
    getActiveAcademicLevels(),
    getActiveModalities()
  ]);
  const hasCurrentLevel =
    currentAcademicLevelId &&
    activeLevels.some((level) => level.id === currentAcademicLevelId);
  const hasCurrentModality =
    currentModalityId &&
    activeModalities.some((modality) => modality.id === currentModalityId);
  const [currentLevel, currentModality] = await Promise.all([
    currentAcademicLevelId && !hasCurrentLevel
      ? prisma.academicLevel.findUnique({
          where: { id: currentAcademicLevelId },
          select: {
            id: true,
            name: true,
            code: true,
            active: true,
            displayOrder: true
          }
        })
      : Promise.resolve(null),
    currentModalityId && !hasCurrentModality
      ? prisma.modality.findUnique({
          where: { id: currentModalityId },
          select: modalityLabelSelect
        })
      : Promise.resolve(null)
  ]);
  const academicLevels = currentLevel ? [...activeLevels, currentLevel] : activeLevels;
  const modalities = currentModality
    ? [...activeModalities, currentModality]
    : activeModalities;

  return { academicLevels, modalities };
}

export async function getGroupById(id: string) {
  return prisma.group.findUnique({
    where: { id },
    include: groupDetailInclude
  });
}

export async function getGroupAuditHistory(id: string) {
  return prisma.auditLog.findMany({
    where: { entity: "Group", entityId: id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" }
  });
}

function snapshot(group: GroupSnapshot) {
  return {
    code: group.code ?? null,
    name: group.name,
    description: group.description ?? null,
    academicLevelId: group.academicLevelId,
    modalityId: group.modalityId,
    schedule: group.schedule ?? null,
    capacity: group.capacity ?? null,
    active: group.active
  };
}

function changedFields(previousData: GroupSnapshot, newData: GroupSnapshot) {
  const previous = snapshot(previousData);
  const next = snapshot(newData);

  return editableFields.filter((field) => previous[field] !== next[field]);
}

async function validateLevelAndModality(
  tx: Prisma.TransactionClient,
  academicLevelId: string,
  modalityId: string
) {
  const academicLevel = await tx.academicLevel.findUniqueOrThrow({
    where: { id: academicLevelId },
    select: { id: true, active: true }
  });
  if (!academicLevel.active) {
    throw new Error("El nivel academico seleccionado esta inactivo.");
  }

  const modality = await tx.modality.findUniqueOrThrow({
    where: { id: modalityId },
    select: { id: true, academicLevelId: true, active: true }
  });
  if (!modality.active) {
    throw new Error("La modalidad seleccionada esta inactiva.");
  }

  if (modality.academicLevelId !== academicLevelId) {
    throw new Error("La modalidad seleccionada no pertenece al nivel academico.");
  }
}

async function assertNoActiveDuplicate(
  tx: Prisma.TransactionClient,
  data: {
    name: string;
    academicLevelId: string;
    modalityId: string;
    code?: string | null;
  },
  excludeId?: string
) {
  const duplicateName = await tx.group.findFirst({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      active: true,
      name: data.name,
      academicLevelId: data.academicLevelId,
      modalityId: data.modalityId
    },
    select: { id: true }
  });

  if (duplicateName) {
    throw new Error("Ya existe un grupo activo con el mismo nombre, nivel y modalidad.");
  }

  if (!data.code) return;

  const duplicateCode = await tx.group.findFirst({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      active: true,
      code: data.code
    },
    select: { id: true }
  });

  if (duplicateCode) {
    throw new Error("Ya existe un grupo activo con el mismo codigo.");
  }
}

async function dependencyCounts(tx: Prisma.TransactionClient, groupId: string) {
  const [enrollments, reEnrollments, academicAssignments, academicEvents] =
    await Promise.all([
      tx.enrollment.count({ where: { groupId } }),
      tx.reEnrollment.count({ where: { groupId } }),
      tx.academicAssignment.count({ where: { groupId } }),
      tx.academicCalendarEvent.count({ where: { groupId } })
    ]);

  return { enrollments, reEnrollments, academicAssignments, academicEvents };
}

function dependencyMessage(counts: Awaited<ReturnType<typeof dependencyCounts>>) {
  const reasons = [
    counts.enrollments ? `${counts.enrollments} inscripcion(es)` : "",
    counts.reEnrollments ? `${counts.reEnrollments} reinscripcion(es)` : "",
    counts.academicAssignments ? `${counts.academicAssignments} asignacion(es)` : "",
    counts.academicEvents ? `${counts.academicEvents} evento(s)` : ""
  ].filter(Boolean);

  return `No se puede cambiar el nivel o modalidad porque el grupo tiene ${reasons.join(", ")}.`;
}

async function writeAuditLog(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    groupId: string;
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
      entity: "Group",
      entityId: params.groupId,
      action: params.action,
      previousData: params.previousData,
      newData: params.newData,
      metadata: {
        source: "configuration-academic-groups",
        route: params.route ?? "/configuracion-academica/grupos",
        operation: params.operation,
        changedFields: params.changedFields ?? []
      }
    }
  });
}

export async function createGroup(input: GroupInput, userId: string) {
  const data = groupSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    await validateLevelAndModality(tx, data.academicLevelId, data.modalityId);
    await assertNoActiveDuplicate(tx, data);

    const group = await tx.group.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        academicLevelId: data.academicLevelId,
        modalityId: data.modalityId,
        schedule: data.schedule,
        capacity: data.capacity,
        active: data.active ?? true,
        createdById: userId,
        updatedById: userId
      },
      include: groupDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      groupId: group.id,
      action: "GROUP_CREATED",
      newData: snapshot(group),
      changedFields: editableFields.slice(),
      operation: "create"
    });

    return group;
  });
}

export async function updateGroup(id: string, input: GroupInput, userId: string) {
  const data = groupSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.group.findUnique({
      where: { id },
      include: groupDetailInclude
    });

    if (!existing) {
      throw new Error("Grupo no encontrado.");
    }

    await validateLevelAndModality(tx, data.academicLevelId, data.modalityId);

    const academicPathChanged =
      existing.academicLevelId !== data.academicLevelId ||
      existing.modalityId !== data.modalityId;

    if (academicPathChanged) {
      const counts = await dependencyCounts(tx, id);
      const hasDependencies = Object.values(counts).some((count) => count > 0);

      if (hasDependencies) {
        throw new Error(dependencyMessage(counts));
      }
    }

    await assertNoActiveDuplicate(tx, data, id);

    const updated = await tx.group.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        academicLevelId: data.academicLevelId,
        modalityId: data.modalityId,
        schedule: data.schedule,
        capacity: data.capacity,
        active: data.active ?? existing.active,
        updatedById: userId
      },
      include: groupDetailInclude
    });
    const fields = changedFields(existing, updated);

    await writeAuditLog(tx, {
      userId,
      groupId: updated.id,
      action: "GROUP_UPDATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: fields,
      operation: "update",
      route: `/configuracion-academica/grupos/${id}`
    });

    return updated;
  });
}

export async function activateGroup(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.group.findUnique({
      where: { id },
      include: groupDetailInclude
    });

    if (!existing) {
      throw new Error("Grupo no encontrado.");
    }

    await validateLevelAndModality(tx, existing.academicLevelId, existing.modalityId);
    await assertNoActiveDuplicate(tx, existing, id);

    const updated = await tx.group.update({
      where: { id },
      data: { active: true, updatedById: userId },
      include: groupDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      groupId: updated.id,
      action: "GROUP_ACTIVATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: ["active"],
      operation: "activate",
      route: `/configuracion-academica/grupos/${id}`
    });

    return updated;
  });
}

export async function deactivateGroup(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.group.findUnique({
      where: { id },
      include: groupDetailInclude
    });

    if (!existing) {
      throw new Error("Grupo no encontrado.");
    }

    await validateLevelAndModality(tx, existing.academicLevelId, existing.modalityId);

    const updated = await tx.group.update({
      where: { id },
      data: { active: false, updatedById: userId },
      include: groupDetailInclude
    });
    const counts = await dependencyCounts(tx, id);

    await writeAuditLog(tx, {
      userId,
      groupId: updated.id,
      action: "GROUP_DEACTIVATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: ["active"],
      operation: "deactivate",
      route: `/configuracion-academica/grupos/${id}`
    });

    return { group: updated, counts };
  });
}
