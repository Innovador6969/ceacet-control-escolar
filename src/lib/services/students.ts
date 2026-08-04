import {
  AdministrativeStatus,
  DocumentStatus,
  EnrollmentStatus,
  Prisma,
  Sex
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { groupLabelSelect } from "@/lib/services/groups";
import {
  studentRegistrationSchema,
  studentUpdateSchema,
  type StudentRegistrationInput,
  type StudentUpdateInput
} from "@/lib/validations/student";

const studentListInclude = {
  enrollments: {
    where: { status: "ACTIVE" as const },
    include: {
      academicLevel: true,
      modality: true,
      group: { select: groupLabelSelect },
      charges: true
    },
    orderBy: { createdAt: "desc" as const },
    take: 1
  },
  documents: { include: { documentType: true } },
  payments: { orderBy: { paidAt: "desc" as const }, take: 5 },
  followUps: { orderBy: { createdAt: "desc" as const }, take: 5 }
};

const studentDetailInclude = {
  guardian: true,
  academicBackground: {
    include: {
      previousAcademicLevel: { select: { id: true, name: true } }
    }
  },
  enrollments: {
    include: {
      academicLevel: true,
      modality: true,
      group: { select: groupLabelSelect },
      schoolCycle: true,
      academicPeriod: true,
      charges: { include: { chargeConcept: true } }
    },
    orderBy: { createdAt: "desc" as const }
  },
  documents: {
    include: {
      documentType: true,
      academicLevel: { select: { id: true, name: true } }
    },
    orderBy: [{ receivedAt: "desc" as const }, { id: "asc" as const }]
  },
  payments: { orderBy: { paidAt: "desc" as const }, take: 10 },
  followUps: { orderBy: { createdAt: "desc" as const }, take: 10 }
};

export type StudentWithRelations = Prisma.StudentGetPayload<{
  include: typeof studentListInclude;
}>;

export type StudentDetail = Prisma.StudentGetPayload<{
  include: typeof studentDetailInclude;
}>;

type StudentSnapshot = {
  firstName: string;
  paternalLastName: string;
  maternalLastName?: string | null;
  birthDate?: Date | null;
  curp?: string | null;
  sex?: Sex | null;
  maritalStatus?: string | null;
  occupation?: string | null;
  phone?: string | null;
  email?: string | null;
  street?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  observations?: string | null;
};

export async function getStudents() {
  return prisma.student.findMany({
    include: studentListInclude,
    orderBy: [{ paternalLastName: "asc" }, { firstName: "asc" }]
  });
}

export async function getStudentById(id: string) {
  return prisma.student.findUnique({
    where: { id },
    include: studentDetailInclude
  });
}

export async function getStudentFormCatalogs(studentId?: string) {
  const current = studentId
    ? await prisma.student.findUnique({
        where: { id: studentId },
        select: {
          enrollments: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              academicLevelId: true,
              modalityId: true,
              groupId: true,
              schoolCycleId: true,
              academicPeriodId: true
            }
          },
          academicBackground: {
            select: { previousAcademicLevelId: true }
          }
        }
      })
    : null;
  const activeEnrollment = current?.enrollments[0];
  const [
    activeLevels,
    activeModalities,
    activeGroups,
    activeCycles,
    activePeriods,
    documentTypes
  ] = await Promise.all([
    prisma.academicLevel.findMany({
      where: { active: true },
      select: { id: true, name: true, code: true, active: true, displayOrder: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }]
    }),
    prisma.modality.findMany({
      where: { active: true },
      select: { id: true, name: true, academicLevelId: true },
      orderBy: [{ academicLevel: { name: "asc" } }, { name: "asc" }]
    }),
    prisma.group.findMany({
      where: { active: true },
      select: groupLabelSelect,
      orderBy: [
        { academicLevel: { name: "asc" } },
        { modality: { name: "asc" } },
        { name: "asc" }
      ]
    }),
    prisma.schoolCycle.findMany({
      where: { isActive: true },
      select: { id: true, name: true, isCurrent: true },
      orderBy: [{ isCurrent: "desc" }, { startDate: "desc" }]
    }),
    prisma.academicPeriod.findMany({
      where: { isActive: true, schoolCycle: { isActive: true } },
      select: { id: true, name: true, schoolCycleId: true, displayOrder: true },
      orderBy: [
        { schoolCycle: { startDate: "desc" } },
        { displayOrder: "asc" },
        { startDate: "asc" }
      ]
    }),
    prisma.documentType.findMany({
      where: { active: true },
      select: { id: true, name: true, required: true },
      orderBy: { name: "asc" }
    })
  ]);

  const ensureById = async <T extends { id: string }>(
    items: T[],
    id: string | null | undefined,
    loader: (id: string) => Promise<T | null>
  ) => {
    if (!id || items.some((item) => item.id === id)) return items;
    const item = await loader(id);
    return item ? [...items, item] : items;
  };

  const [academicLevels, modalities, groups, schoolCycles, academicPeriods] =
    await Promise.all([
      ensureById(
        activeLevels,
        activeEnrollment?.academicLevelId ?? current?.academicBackground?.previousAcademicLevelId,
        (id) =>
          prisma.academicLevel.findUnique({
            where: { id },
            select: { id: true, name: true, code: true, active: true, displayOrder: true }
          })
      ),
      ensureById(activeModalities, activeEnrollment?.modalityId, (id) =>
        prisma.modality.findUnique({
          where: { id },
          select: { id: true, name: true, academicLevelId: true }
        })
      ),
      ensureById(activeGroups, activeEnrollment?.groupId, (id) =>
        prisma.group.findUnique({ where: { id }, select: groupLabelSelect })
      ),
      ensureById(activeCycles, activeEnrollment?.schoolCycleId, (id) =>
        prisma.schoolCycle.findUnique({
          where: { id },
          select: { id: true, name: true, isCurrent: true }
        })
      ),
      ensureById(activePeriods, activeEnrollment?.academicPeriodId, (id) =>
        prisma.academicPeriod.findUnique({
          where: { id },
          select: { id: true, name: true, schoolCycleId: true, displayOrder: true }
        })
      )
    ]);

  return {
    academicLevels,
    modalities,
    groups,
    schoolCycles,
    academicPeriods,
    documentTypes
  };
}

export function getActiveEnrollment(student: StudentWithRelations) {
  return student.enrollments[0];
}

export function getStudentBalance(student: StudentWithRelations) {
  return student.enrollments.reduce(
    (total, enrollment) =>
      total +
      enrollment.charges.reduce((sum, charge) => sum + Number(charge.balance), 0),
    0
  );
}

export function getMissingDocumentCount(student: StudentWithRelations) {
  return student.documents.filter(
    (document) =>
      document.documentType.required && document.status !== DocumentStatus.RECEIVED
  ).length;
}

function parseDate(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined;
}

function parseSex(value?: string): Sex | undefined {
  if (!value) return undefined;
  if (["FEMALE", "MALE", "OTHER", "NOT_SPECIFIED"].includes(value)) {
    return value as Sex;
  }
  return undefined;
}

function normalizeCurp(value?: string) {
  return value ? value.toUpperCase() : undefined;
}

function hasGuardianData(data: StudentRegistrationInput | StudentUpdateInput) {
  return Boolean(
    data.guardianFullName ||
      data.guardianRelationship ||
      data.guardianPrimaryPhone ||
      data.guardianAlternatePhone ||
      data.guardianEmail ||
      data.guardianObservations
  );
}

function hasAcademicBackgroundData(data: StudentRegistrationInput | StudentUpdateInput) {
  return Boolean(
    data.previousAcademicLevelId ||
      data.previousSchool ||
      data.lastGrade ||
      data.previousSchoolCycle ||
      data.academicBackgroundObservations
  );
}

function studentSnapshot(student: StudentSnapshot) {
  return {
    firstName: student.firstName,
    paternalLastName: student.paternalLastName,
    maternalLastName: student.maternalLastName ?? null,
    birthDate: student.birthDate?.toISOString() ?? null,
    curp: student.curp ?? null,
    sex: student.sex ?? null,
    maritalStatus: student.maritalStatus ?? null,
    occupation: student.occupation ?? null,
    phone: student.phone ?? null,
    email: student.email ?? null,
    street: student.street ?? null,
    neighborhood: student.neighborhood ?? null,
    city: student.city ?? null,
    state: student.state ?? null,
    postalCode: student.postalCode ?? null,
    observations: student.observations ?? null
  };
}

function guardianSnapshot(
  guardian: {
    fullName: string;
    relationship: string;
    primaryPhone: string;
    alternatePhone?: string | null;
    email?: string | null;
    observations?: string | null;
  } | null
) {
  if (!guardian) return null;
  return {
    fullName: guardian.fullName,
    relationship: guardian.relationship,
    primaryPhone: guardian.primaryPhone,
    alternatePhone: guardian.alternatePhone ?? null,
    email: guardian.email ?? null,
    observations: guardian.observations ?? null
  };
}

function backgroundSnapshot(
  background: {
    previousAcademicLevelId?: string | null;
    previousSchool?: string | null;
    lastGrade?: string | null;
    previousSchoolCycle?: string | null;
    observations?: string | null;
  } | null
) {
  if (!background) return null;
  return {
    previousAcademicLevelId: background.previousAcademicLevelId ?? null,
    previousSchool: background.previousSchool ?? null,
    lastGrade: background.lastGrade ?? null,
    previousSchoolCycle: background.previousSchoolCycle ?? null,
    observations: background.observations ?? null
  };
}

function gradeOptionsForLevelName(levelName: string) {
  const normalized = levelName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalized.includes("primaria")) return ["1", "2", "3", "4", "5", "6"];
  if (normalized.includes("secundaria")) return ["1", "2", "3"];
  return null;
}

function assertGradeCompatible(levelName: string, grade?: string) {
  if (!grade) return;
  const options = gradeOptionsForLevelName(levelName);

  if (options && !options.includes(grade)) {
    throw new Error(`El grado seleccionado no corresponde al nivel ${levelName}.`);
  }
}

async function generateEnrollmentNumber(
  academicLevelId: string,
  enrollmentDate: string,
  tx: Prisma.TransactionClient
) {
  const level = await tx.academicLevel.findUniqueOrThrow({
    where: { id: academicLevelId },
    select: { code: true }
  });
  if (!level.code) {
    throw new Error("El nivel academico seleccionado no tiene codigo para generar matricula.");
  }

  const year = new Date(`${enrollmentDate}T00:00:00`).getFullYear();
  const prefix = `${level.code}-${year}`;
  const existing = await tx.student.count({
    where: { enrollmentNumber: { startsWith: prefix } }
  });

  return `${prefix}-${String(existing + 1).padStart(4, "0")}`;
}

async function validateAcademicPath(
  tx: Prisma.TransactionClient,
  data: StudentRegistrationInput | StudentUpdateInput,
  options: { requireActive: boolean }
) {
  const [academicLevel, modality, group, schoolCycle, academicPeriod] =
    await Promise.all([
      tx.academicLevel.findUniqueOrThrow({
        where: { id: data.academicLevelId },
        select: { id: true, name: true, active: true }
      }),
      tx.modality.findUniqueOrThrow({
        where: { id: data.modalityId },
        select: { id: true, active: true, academicLevelId: true }
      }),
      data.groupId
        ? tx.group.findUniqueOrThrow({
            where: { id: data.groupId },
            select: {
              id: true,
              active: true,
              academicLevelId: true,
              modalityId: true
            }
          })
        : Promise.resolve(null),
      data.schoolCycleId
        ? tx.schoolCycle.findUniqueOrThrow({
            where: { id: data.schoolCycleId },
            select: { id: true, isActive: true }
          })
        : Promise.resolve(null),
      data.academicPeriodId
        ? tx.academicPeriod.findUniqueOrThrow({
            where: { id: data.academicPeriodId },
            select: { id: true, isActive: true, schoolCycleId: true }
          })
        : Promise.resolve(null)
    ]);

  if (options.requireActive && !academicLevel.active) {
    throw new Error("El nivel academico seleccionado esta inactivo.");
  }

  if (
    (options.requireActive && !modality.active) ||
    modality.academicLevelId !== data.academicLevelId
  ) {
    throw new Error("La modalidad seleccionada no pertenece al nivel academico o esta inactiva.");
  }

  if (
    group &&
    ((options.requireActive && !group.active) ||
      group.academicLevelId !== data.academicLevelId ||
      group.modalityId !== data.modalityId)
  ) {
    throw new Error("El grupo seleccionado no pertenece a la trayectoria academica o esta inactivo.");
  }

  if (schoolCycle && options.requireActive && !schoolCycle.isActive) {
    throw new Error("El ciclo escolar seleccionado esta inactivo.");
  }

  if (academicPeriod) {
    if (options.requireActive && !academicPeriod.isActive) {
      throw new Error("El periodo academico seleccionado esta inactivo.");
    }

    if (data.schoolCycleId && academicPeriod.schoolCycleId !== data.schoolCycleId) {
      throw new Error("El periodo academico no pertenece al ciclo escolar seleccionado.");
    }
  }

  assertGradeCompatible(academicLevel.name, data.grade);

  return { academicLevel };
}

async function validatePreviousAcademicLevel(
  tx: Prisma.TransactionClient,
  previousAcademicLevelId?: string
) {
  if (!previousAcademicLevelId) return;
  await tx.academicLevel.findUniqueOrThrow({
    where: { id: previousAcademicLevelId },
    select: { id: true }
  });
}

async function assertUniqueCurp(
  tx: Prisma.TransactionClient,
  curp: string | undefined,
  excludeStudentId?: string
) {
  if (!curp) return;
  const existingCurp = await tx.student.findFirst({
    where: {
      curp,
      id: excludeStudentId ? { not: excludeStudentId } : undefined
    },
    select: { id: true }
  });

  if (existingCurp) {
    throw new Error("Ya existe un alumno registrado con esa CURP.");
  }
}

async function writeAuditLog(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    studentId: string;
    action: string;
    previousData?: Prisma.InputJsonValue;
    newData?: Prisma.InputJsonValue;
    changedFields?: string[];
    operation: string;
  }
) {
  await tx.auditLog.create({
    data: {
      userId: params.userId,
      entity: "Student",
      entityId: params.studentId,
      action: params.action,
      previousData: params.previousData,
      newData: params.newData,
      metadata: {
        source: "students",
        route: `/alumnos/${params.studentId}`,
        operation: params.operation,
        changedFields: params.changedFields ?? []
      }
    }
  });
}

function studentData(data: StudentRegistrationInput | StudentUpdateInput) {
  return {
    firstName: data.firstName,
    paternalLastName: data.paternalLastName,
    maternalLastName: data.maternalLastName,
    birthDate: parseDate(data.birthDate),
    curp: normalizeCurp(data.curp),
    sex: parseSex(data.sex),
    maritalStatus: data.maritalStatus,
    occupation: data.occupation,
    phone: data.phone,
    email: data.email,
    street: data.street,
    neighborhood: data.neighborhood,
    city: data.city,
    state: data.state,
    postalCode: data.postalCode,
    observations: data.observations
  };
}

function enrollmentData(data: StudentRegistrationInput | StudentUpdateInput) {
  return {
    academicLevelId: data.academicLevelId,
    modalityId: data.modalityId,
    groupId: data.groupId,
    schoolCycleId: data.schoolCycleId,
    academicPeriodId: data.academicPeriodId,
    grade: data.grade,
    fourMonthPeriod: data.fourMonthPeriod,
    enrollmentDate: parseDate(data.enrollmentDate) ?? new Date(),
    startDate: parseDate(data.startDate),
    registrationFee: data.registrationFee ?? 0,
    weeklyFee: data.weeklyFee ?? 0,
    lateFeePercentage: data.lateFeePercentage ?? 0,
    paymentDay: data.paymentDay
  };
}

async function upsertGuardian(
  tx: Prisma.TransactionClient,
  studentId: string,
  data: StudentRegistrationInput | StudentUpdateInput,
  userId: string
) {
  const existing = await tx.studentGuardian.findUnique({ where: { studentId } });

  if (!hasGuardianData(data)) {
    return;
  }

  if (!data.guardianFullName || !data.guardianRelationship || !data.guardianPrimaryPhone) {
    throw new Error("Captura nombre, parentesco y telefono principal del tutor, o deja el tutor vacio.");
  }

  const guardianData = {
    fullName: data.guardianFullName,
    relationship: data.guardianRelationship,
    primaryPhone: data.guardianPrimaryPhone,
    alternatePhone: data.guardianAlternatePhone,
    email: data.guardianEmail,
    observations: data.guardianObservations
  };
  const guardian = existing
    ? await tx.studentGuardian.update({
        where: { studentId },
        data: guardianData
      })
    : await tx.studentGuardian.create({
        data: { studentId, ...guardianData }
      });

  await writeAuditLog(tx, {
    userId,
    studentId,
    action: existing ? "GUARDIAN_UPDATED" : "GUARDIAN_CREATED",
    previousData: guardianSnapshot(existing) ?? undefined,
    newData: guardianSnapshot(guardian) ?? undefined,
    changedFields: [
      "fullName",
      "relationship",
      "primaryPhone",
      "alternatePhone",
      "email",
      "observations"
    ],
    operation: existing ? "guardian-update" : "guardian-create"
  });
}

async function upsertAcademicBackground(
  tx: Prisma.TransactionClient,
  studentId: string,
  data: StudentRegistrationInput | StudentUpdateInput,
  userId: string
) {
  const existing = await tx.studentAcademicBackground.findUnique({
    where: { studentId }
  });

  if (!hasAcademicBackgroundData(data)) {
    return;
  }

  await validatePreviousAcademicLevel(tx, data.previousAcademicLevelId);

  const backgroundData = {
    previousAcademicLevelId: data.previousAcademicLevelId,
    previousSchool: data.previousSchool,
    lastGrade: data.lastGrade,
    previousSchoolCycle: data.previousSchoolCycle,
    observations: data.academicBackgroundObservations
  };
  const background = existing
    ? await tx.studentAcademicBackground.update({
        where: { studentId },
        data: backgroundData
      })
    : await tx.studentAcademicBackground.create({
        data: { studentId, ...backgroundData }
      });

  await writeAuditLog(tx, {
    userId,
    studentId,
    action: existing
      ? "ACADEMIC_BACKGROUND_UPDATED"
      : "ACADEMIC_BACKGROUND_CREATED",
    previousData: backgroundSnapshot(existing) ?? undefined,
    newData: backgroundSnapshot(background) ?? undefined,
    changedFields: [
      "previousAcademicLevelId",
      "previousSchool",
      "lastGrade",
      "previousSchoolCycle",
      "observations"
    ],
    operation: existing ? "background-update" : "background-create"
  });
}

async function createDefaultDocuments(
  tx: Prisma.TransactionClient,
  studentId: string,
  data: StudentRegistrationInput
) {
  if (data.documents.length > 0) {
    return;
  }

  const documentTypes = await tx.documentType.findMany({
    where: { active: true },
    select: { id: true }
  });

  await tx.studentDocument.createMany({
    data: documentTypes.map((documentType) => ({
      studentId,
      documentTypeId: documentType.id,
      academicLevelId: data.academicLevelId,
      grade: data.grade,
      status: DocumentStatus.PENDING
    }))
  });
}

async function upsertDocuments(
  tx: Prisma.TransactionClient,
  studentId: string,
  data: StudentRegistrationInput | StudentUpdateInput,
  userId: string
) {
  const submittedKeys = new Set<string>();

  for (const document of data.documents) {
    if (document.academicLevelId) {
      await tx.academicLevel.findUniqueOrThrow({
        where: { id: document.academicLevelId },
        select: { id: true }
      });
    }

    const documentKey = [
      document.documentTypeId,
      document.academicLevelId ?? "",
      document.grade ?? ""
    ].join("|");

    if (submittedKeys.has(documentKey)) {
      throw new Error("No se puede registrar dos veces el mismo documento para el mismo nivel y grado.");
    }
    submittedKeys.add(documentKey);

    const payload = {
      documentTypeId: document.documentTypeId,
      academicLevelId: document.academicLevelId,
      grade: document.grade,
      status: document.status,
      receivedAt: parseDate(document.receivedAt),
      physicalLocation: document.physicalLocation,
      fileUrl: document.fileUrl,
      observations: document.observations
    };

    if (document.id) {
      const previous = await tx.studentDocument.findFirst({
        where: { id: document.id, studentId }
      });

      if (!previous) {
        throw new Error("Documento del alumno no encontrado.");
      }

      const duplicate = await tx.studentDocument.findFirst({
        where: {
          id: { not: document.id },
          studentId,
          documentTypeId: document.documentTypeId,
          academicLevelId: document.academicLevelId ?? null,
          grade: document.grade ?? null
        },
        select: { id: true }
      });

      if (duplicate) {
        throw new Error("Ya existe ese documento registrado para el mismo nivel y grado.");
      }

      const updated = await tx.studentDocument.update({
        where: { id: document.id },
        data: payload
      });

      await writeAuditLog(tx, {
        userId,
        studentId,
        action: "STUDENT_DOCUMENT_UPDATED",
        previousData: {
          documentTypeId: previous.documentTypeId,
          academicLevelId: previous.academicLevelId,
          grade: previous.grade,
          status: previous.status
        },
        newData: {
          documentTypeId: updated.documentTypeId,
          academicLevelId: updated.academicLevelId,
          grade: updated.grade,
          status: updated.status
        },
        changedFields: [
          "documentTypeId",
          "academicLevelId",
          "grade",
          "status",
          "receivedAt",
          "physicalLocation",
          "fileUrl",
          "observations"
        ],
        operation: "document-update"
      });
    } else {
      const duplicate = await tx.studentDocument.findFirst({
        where: {
          studentId,
          documentTypeId: document.documentTypeId,
          academicLevelId: document.academicLevelId ?? null,
          grade: document.grade ?? null
        },
        select: { id: true }
      });

      if (duplicate) {
        throw new Error("Ya existe ese documento registrado para el mismo nivel y grado.");
      }

      const created = await tx.studentDocument.create({
        data: { studentId, ...payload }
      });

      await writeAuditLog(tx, {
        userId,
        studentId,
        action: "STUDENT_DOCUMENT_ADDED",
        newData: {
          documentTypeId: created.documentTypeId,
          academicLevelId: created.academicLevelId,
          grade: created.grade,
          status: created.status
        },
        changedFields: ["documentTypeId", "academicLevelId", "grade", "status"],
        operation: "document-add"
      });
    }
  }
}

export async function createStudent(input: StudentRegistrationInput, userId: string) {
  const data = studentRegistrationSchema.parse(input);
  const normalizedCurp = normalizeCurp(data.curp);

  return prisma.$transaction(async (tx) => {
    await validateAcademicPath(tx, data, { requireActive: true });
    await validatePreviousAcademicLevel(tx, data.previousAcademicLevelId);
    await assertUniqueCurp(tx, normalizedCurp);

    const enrollmentNumber = await generateEnrollmentNumber(
      data.academicLevelId,
      data.enrollmentDate,
      tx
    );

    const existingEnrollment = await tx.student.findUnique({
      where: { enrollmentNumber },
      select: { id: true }
    });

    if (existingEnrollment) {
      throw new Error("No fue posible generar una matricula unica.");
    }

    const student = await tx.student.create({
      data: {
        ...studentData(data),
        enrollmentNumber,
        administrativeStatus: AdministrativeStatus.ACTIVE
      }
    });

    await tx.enrollment.create({
      data: {
        studentId: student.id,
        ...enrollmentData(data)
      }
    });

    await createDefaultDocuments(tx, student.id, data);
    await upsertDocuments(tx, student.id, data, userId);
    await upsertGuardian(tx, student.id, data, userId);
    await upsertAcademicBackground(tx, student.id, data, userId);

    await writeAuditLog(tx, {
      userId,
      studentId: student.id,
      action: "STUDENT_CREATED",
      newData: studentSnapshot(student),
      changedFields: Object.keys(studentSnapshot(student)),
      operation: "create"
    });

    return student;
  });
}

export async function updateStudent(
  id: string,
  input: StudentUpdateInput,
  userId: string
) {
  const data = studentUpdateSchema.parse(input);
  const normalizedCurp = normalizeCurp(data.curp);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.student.findUnique({
      where: { id },
      include: {
        guardian: true,
        academicBackground: true,
        enrollments: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    if (!existing) {
      throw new Error("Alumno no encontrado.");
    }

    await validateAcademicPath(tx, data, { requireActive: false });
    await validatePreviousAcademicLevel(tx, data.previousAcademicLevelId);
    await assertUniqueCurp(tx, normalizedCurp, id);

    const updated = await tx.student.update({
      where: { id },
      data: studentData(data)
    });

    const enrollment = existing.enrollments[0];
    if (enrollment) {
      await tx.enrollment.update({
        where: { id: enrollment.id },
        data: enrollmentData(data)
      });
    } else {
      await tx.enrollment.create({
        data: {
          studentId: id,
          ...enrollmentData(data),
          status: EnrollmentStatus.ACTIVE
        }
      });
    }

    await upsertGuardian(tx, id, data, userId);
    await upsertAcademicBackground(tx, id, data, userId);
    await upsertDocuments(tx, id, data, userId);

    await writeAuditLog(tx, {
      userId,
      studentId: id,
      action: "STUDENT_UPDATED",
      previousData: studentSnapshot(existing),
      newData: studentSnapshot(updated),
      changedFields: Object.keys(studentSnapshot(updated)).filter(
        (field) =>
          studentSnapshot(existing)[field as keyof ReturnType<typeof studentSnapshot>] !==
          studentSnapshot(updated)[field as keyof ReturnType<typeof studentSnapshot>]
      ),
      operation: "update"
    });

    return updated;
  });
}
