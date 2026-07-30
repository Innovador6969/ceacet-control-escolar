import { AcademicEventStatus, Prisma } from "@prisma/client";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { normalizeCatalogName } from "@/lib/validation/catalog-normalization";
import { classroomSchema, type ClassroomInput } from "@/lib/validations/classroom";

export const classroomLabelSelect = {
  id: true,
  code: true,
  name: true,
  location: true,
  capacity: true,
  active: true
} satisfies Prisma.ClassroomSelect;

const classroomCounts = {
  academicAssignments: true,
  academicEvents: true
} satisfies Prisma.ClassroomCountOutputTypeSelect;

const classroomDetailInclude = {
  createdBy: { select: { id: true, name: true, email: true } },
  updatedBy: { select: { id: true, name: true, email: true } },
  _count: { select: classroomCounts }
} satisfies Prisma.ClassroomInclude;

const editableFields = ["code", "name", "location", "capacity", "description", "active"] as const;

type ClassroomSnapshot = {
  code?: string | null;
  name: string;
  location?: string | null;
  capacity?: number | null;
  description?: string | null;
  active: boolean;
};

function snapshot(classroom: ClassroomSnapshot) {
  return {
    code: classroom.code ?? null,
    name: classroom.name,
    location: classroom.location ?? null,
    capacity: classroom.capacity ?? null,
    description: classroom.description ?? null,
    active: classroom.active
  };
}

function changedFields(previousData: ClassroomSnapshot, newData: ClassroomSnapshot) {
  const previous = snapshot(previousData);
  const next = snapshot(newData);

  return editableFields.filter((field) => previous[field] !== next[field]);
}

export const getActiveClassrooms = cache(async () => {
  return prisma.classroom.findMany({
    where: { active: true },
    select: classroomLabelSelect,
    orderBy: { name: "asc" }
  });
});

export async function getClassrooms() {
  return prisma.classroom.findMany({
    select: {
      id: true,
      code: true,
      name: true,
      location: true,
      capacity: true,
      description: true,
      active: true,
      updatedAt: true,
      updatedBy: { select: { name: true } },
      _count: { select: classroomCounts }
    },
    orderBy: { name: "asc" }
  });
}

export async function getClassroomById(id: string) {
  const classroom = await prisma.classroom.findUnique({
    where: { id },
    include: classroomDetailInclude
  });

  if (!classroom) return null;

  const dependencies = await getClassroomDependencies(id);
  return { ...classroom, dependencies };
}

async function assertNoActiveDuplicate(
  tx: Prisma.TransactionClient,
  data: { code?: string | null; name: string; location?: string | null },
  excludeId?: string
) {
  if (data.code) {
    const duplicateCode = await tx.classroom.findFirst({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
        active: true,
        code: data.code
      },
      select: { id: true }
    });

    if (duplicateCode) {
      throw new Error("Ya existe un aula activa con el mismo codigo.");
    }
  }

  const activeClassrooms = await tx.classroom.findMany({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      active: true,
      location: data.location ?? null
    },
    select: { id: true, name: true }
  });
  const normalizedName = normalizeCatalogName(data.name);

  if (activeClassrooms.some((classroom) => normalizeCatalogName(classroom.name) === normalizedName)) {
    throw new Error("Ya existe un aula activa con el mismo nombre y ubicacion.");
  }
}

async function classroomDependencyCounts(tx: Prisma.TransactionClient | typeof prisma, id: string) {
  const [academicAssignments, activeAssignments, scheduledEvents] = await Promise.all([
    tx.academicAssignment.count({ where: { classroomId: id } }),
    tx.academicAssignment.count({ where: { classroomId: id, active: true } }),
    tx.academicCalendarEvent.count({
      where: { classroomId: id, status: AcademicEventStatus.SCHEDULED }
    })
  ]);

  return { academicAssignments, activeAssignments, scheduledEvents };
}

export async function getClassroomDependencies(id: string) {
  return classroomDependencyCounts(prisma, id);
}

async function writeAuditLog(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    classroomId: string;
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
      entity: "Classroom",
      entityId: params.classroomId,
      action: params.action,
      previousData: params.previousData,
      newData: params.newData,
      metadata: {
        source: "configuration-classrooms",
        route: params.route ?? "/configuracion-academica/aulas",
        operation: params.operation,
        changedFields: params.changedFields ?? []
      }
    }
  });
}

export async function createClassroom(input: ClassroomInput, userId: string) {
  const data = classroomSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    await assertNoActiveDuplicate(tx, data);

    const classroom = await tx.classroom.create({
      data: {
        code: data.code,
        name: data.name,
        location: data.location,
        capacity: data.capacity,
        description: data.description,
        active: data.active ?? true,
        createdById: userId,
        updatedById: userId
      },
      include: classroomDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      classroomId: classroom.id,
      action: "CLASSROOM_CREATED",
      newData: snapshot(classroom),
      changedFields: editableFields.slice(),
      operation: "create"
    });

    return classroom;
  });
}

export async function updateClassroom(id: string, input: ClassroomInput, userId: string) {
  const data = classroomSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.classroom.findUnique({ where: { id }, include: classroomDetailInclude });
    if (!existing) throw new Error("Aula no encontrada.");

    await assertNoActiveDuplicate(tx, data, id);

    const updated = await tx.classroom.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        location: data.location,
        capacity: data.capacity,
        description: data.description,
        active: data.active ?? existing.active,
        updatedById: userId
      },
      include: classroomDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      classroomId: updated.id,
      action: "CLASSROOM_UPDATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: changedFields(existing, updated),
      operation: "update",
      route: `/configuracion-academica/aulas/${id}`
    });

    return updated;
  });
}

export async function activateClassroom(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.classroom.findUnique({ where: { id }, include: classroomDetailInclude });
    if (!existing) throw new Error("Aula no encontrada.");

    await assertNoActiveDuplicate(tx, existing, id);

    const updated = await tx.classroom.update({
      where: { id },
      data: { active: true, updatedById: userId },
      include: classroomDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      classroomId: updated.id,
      action: "CLASSROOM_ACTIVATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: ["active"],
      operation: "activate",
      route: `/configuracion-academica/aulas/${id}`
    });

    return updated;
  });
}

export async function deactivateClassroom(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.classroom.findUnique({ where: { id }, include: classroomDetailInclude });
    if (!existing) throw new Error("Aula no encontrada.");

    const activeAssignments = await tx.academicAssignment.count({
      where: { classroomId: id, active: true }
    });
    if (activeAssignments > 0) {
      throw new Error(
        `No se puede desactivar el aula porque tiene ${activeAssignments} asignacion(es) activa(s).`
      );
    }

    const updated = await tx.classroom.update({
      where: { id },
      data: { active: false, updatedById: userId },
      include: classroomDetailInclude
    });

    await writeAuditLog(tx, {
      userId,
      classroomId: updated.id,
      action: "CLASSROOM_DEACTIVATED",
      previousData: snapshot(existing),
      newData: snapshot(updated),
      changedFields: ["active"],
      operation: "deactivate",
      route: `/configuracion-academica/aulas/${id}`
    });

    return { classroom: updated, dependencies: await classroomDependencyCounts(tx, id) };
  });
}
