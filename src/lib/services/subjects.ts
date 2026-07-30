import { AcademicEventStatus, Prisma } from "@prisma/client";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { getActiveAcademicLevels } from "@/lib/services/academic-levels";
import { getActiveModalities, modalityLabelSelect } from "@/lib/services/modalities";
import { normalizeCatalogName } from "@/lib/validation/catalog-normalization";
import { subjectSchema, type SubjectInput } from "@/lib/validations/subject";

export const subjectLabelSelect = {
  id: true,
  code: true,
  name: true,
  academicLevelId: true,
  modalityId: true,
  active: true,
  academicLevel: { select: { id: true, name: true } },
  modality: { select: { id: true, name: true, academicLevelId: true } }
} satisfies Prisma.SubjectSelect;

const subjectCounts = {
  academicAssignments: true,
  academicEvents: true
} satisfies Prisma.SubjectCountOutputTypeSelect;

const subjectDetailInclude = {
  academicLevel: { select: { id: true, name: true } },
  modality: { select: { id: true, name: true, academicLevelId: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  updatedBy: { select: { id: true, name: true, email: true } },
  _count: { select: subjectCounts }
} satisfies Prisma.SubjectInclude;

const editableFields = [
  "code",
  "name",
  "description",
  "academicLevelId",
  "modalityId",
  "active"
] as const;

type SubjectSnapshot = {
  code: string;
  name: string;
  description?: string | null;
  academicLevelId: string;
  modalityId?: string | null;
  active: boolean;
};

function snapshot(subject: SubjectSnapshot) {
  return {
    code: subject.code,
    name: subject.name,
    description: subject.description ?? null,
    academicLevelId: subject.academicLevelId,
    modalityId: subject.modalityId ?? null,
    active: subject.active
  };
}

function changedFields(previousData: SubjectSnapshot, newData: SubjectSnapshot) {
  const previous = snapshot(previousData);
  const next = snapshot(newData);

  return editableFields.filter((field) => previous[field] !== next[field]);
}

export const getActiveSubjects = cache(async () => {
  return prisma.subject.findMany({
    where: { active: true },
    select: subjectLabelSelect,
    orderBy: [{ academicLevel: { name: "asc" } }, { name: "asc" }]
  });
});

export async function getSubjects() {
  return prisma.subject.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      active: true,
      updatedAt: true,
      academicLevel: { select: { id: true, name: true } },
      modality: { select: { id: true, name: true } },
      updatedBy: { select: { name: true } },
      _count: { select: subjectCounts }
    },
    orderBy: [{ academicLevel: { name: "asc" } }, { name: "asc" }]
  });
}

export async function getSubjectById(id: string) {
  const subject = await prisma.subject.findUnique({
    where: { id },
    include: subjectDetailInclude
  });

  if (!subject) return null;

  const dependencies = await getSubjectDependencies(id);
  return { ...subject, dependencies };
}

export async function getSubjectFormCatalogs(
  currentAcademicLevelId?: string,
  currentModalityId?: string | null
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
          select: { id: true, name: true, code: true, active: true, displayOrder: true }
        })
      : Promise.resolve(null),
    currentModalityId && !hasCurrentModality
      ? prisma.modality.findUnique({ where: { id: currentModalityId }, select: modalityLabelSelect })
      : Promise.resolve(null)
  ]);

  return {
    academicLevels: currentLevel ? [...activeLevels, currentLevel] : activeLevels,
    modalities: currentModality ? [...activeModalities, currentModality] : activeModalities
  };
}

async function validateAcademicContext(
  tx: Prisma.TransactionClient,
  academicLevelId: string,
  modalityId?: string | null
) {
  const level = await tx.academicLevel.findUniqueOrThrow({
    where: { id: academicLevelId },
    select: { active: true }
  });

  if (!level.active) {
    throw new Error("El nivel academico seleccionado esta inactivo.");
  }

  if (!modalityId) return;

  const modality = await tx.modality.findUniqueOrThrow({
    where: { id: modalityId },
    select: { academicLevelId: true, active: true }
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
  data: { code: string; name: string; academicLevelId: string; modalityId?: string | null },
  excludeId?: string
) {
  const duplicateCode = await tx.subject.findFirst({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      active: true,
      code: data.code
    },
    select: { id: true }
  });

  if (duplicateCode) {
    throw new Error("Ya existe una materia activa con el mismo codigo.");
  }

  const activeSubjects = await tx.subject.findMany({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      active: true,
      academicLevelId: data.academicLevelId,
      modalityId: data.modalityId ?? null
    },
    select: { id: true, name: true }
  });
  const normalizedName = normalizeCatalogName(data.name);

  if (activeSubjects.some((subject) => normalizeCatalogName(subject.name) === normalizedName)) {
    throw new Error("Ya existe una materia activa con el mismo nombre en el contexto academico.");
  }
}

async function subjectDependencyCounts(tx: Prisma.TransactionClient | typeof prisma, id: string) {
  const [academicAssignments, activeAssignments, scheduledEvents] = await Promise.all([
    tx.academicAssignment.count({ where: { subjectId: id } }),
    tx.academicAssignment.count({ where: { subjectId: id, active: true } }),
    tx.academicCalendarEvent.count({
      where: { subjectId: id, status: AcademicEventStatus.SCHEDULED }
    })
  ]);

  return { academicAssignments, activeAssignments, scheduledEvents };
}

export async function getSubjectDependencies(id: string) {
  return subjectDependencyCounts(prisma, id);
}

async function writeAuditLog(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    subjectId: string;
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
      entity: "Subject",
      entityId: params.subjectId,
      action: params.action,
      previousData: params.previousData,
      newData: params.newData,
      metadata: {
        source: "configuration-subjects",
        route: params.route ?? "/configuracion-academica/materias",
        operation: params.operation,
        changedFields: params.changedFields ?? []
      }
    }
  });
}

export async function createSubject(input: SubjectInput, userId: string) {
  const data = subjectSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    await validateAcademicContext(tx, data.academicLevelId, data.modalityId);
    await assertNoActiveDuplicate(tx, data);

    const subject = await tx.subject.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        academicLevelId: data.academicLevelId,
        modalityId: data.modalityId,
        active: data.active ?? true,
        createdById: userId,
        updatedById: userId
      },
      include: subjectDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      subjectId: subject.id,
      action: "SUBJECT_CREATED",
      newData: snapshot(subject),
      changedFields: editableFields.slice(),
      operation: "create"
    });

    return subject;
  });
}

export async function updateSubject(id: string, input: SubjectInput, userId: string) {
  const data = subjectSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.subject.findUnique({ where: { id }, include: subjectDetailInclude });
    if (!existing) throw new Error("Materia no encontrada.");

    await validateAcademicContext(tx, data.academicLevelId, data.modalityId);
    await assertNoActiveDuplicate(tx, data, id);

    const updated = await tx.subject.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        academicLevelId: data.academicLevelId,
        modalityId: data.modalityId,
        active: data.active ?? existing.active,
        updatedById: userId
      },
      include: subjectDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      subjectId: updated.id,
      action: "SUBJECT_UPDATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: changedFields(existing, updated),
      operation: "update",
      route: `/configuracion-academica/materias/${id}`
    });

    return updated;
  });
}

export async function activateSubject(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.subject.findUnique({ where: { id }, include: subjectDetailInclude });
    if (!existing) throw new Error("Materia no encontrada.");

    await validateAcademicContext(tx, existing.academicLevelId, existing.modalityId);
    await assertNoActiveDuplicate(tx, existing, id);

    const updated = await tx.subject.update({
      where: { id },
      data: { active: true, updatedById: userId },
      include: subjectDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      subjectId: updated.id,
      action: "SUBJECT_ACTIVATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: ["active"],
      operation: "activate",
      route: `/configuracion-academica/materias/${id}`
    });

    return updated;
  });
}

export async function deactivateSubject(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.subject.findUnique({ where: { id }, include: subjectDetailInclude });
    if (!existing) throw new Error("Materia no encontrada.");

    const activeAssignments = await tx.academicAssignment.count({
      where: { subjectId: id, active: true }
    });
    if (activeAssignments > 0) {
      throw new Error(
        `No se puede desactivar la materia porque tiene ${activeAssignments} asignacion(es) activa(s).`
      );
    }

    const updated = await tx.subject.update({
      where: { id },
      data: { active: false, updatedById: userId },
      include: subjectDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      subjectId: updated.id,
      action: "SUBJECT_DEACTIVATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: ["active"],
      operation: "deactivate",
      route: `/configuracion-academica/materias/${id}`
    });

    return { subject: updated, dependencies: await subjectDependencyCounts(tx, id) };
  });
}
