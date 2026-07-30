import {
  AdministrativeStatus,
  DocumentStatus,
  Prisma,
  Sex
} from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  studentRegistrationSchema,
  type StudentRegistrationInput
} from "@/lib/validations/student";
import { groupLabelSelect } from "@/lib/services/groups";

const studentInclude = {
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

export type StudentWithRelations = Prisma.StudentGetPayload<{
  include: typeof studentInclude;
}>;

export async function getStudents() {
  return prisma.student.findMany({
    include: studentInclude,
    orderBy: [{ paternalLastName: "asc" }, { firstName: "asc" }]
  });
}

export async function getStudentById(id: string) {
  return prisma.student.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: {
          academicLevel: true,
          modality: true,
          group: { select: groupLabelSelect },
          charges: { include: { chargeConcept: true } }
        },
        orderBy: { createdAt: "desc" }
      },
      documents: { include: { documentType: true } },
      payments: { orderBy: { paidAt: "desc" }, take: 10 },
      followUps: { orderBy: { createdAt: "desc" }, take: 10 }
    }
  });
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

async function generateEnrollmentNumber(
  academicLevelId: string,
  enrollmentDate: string,
  tx: Prisma.TransactionClient
) {
  const level = await tx.academicLevel.findUniqueOrThrow({
    where: { id: academicLevelId }
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

export async function createStudent(input: StudentRegistrationInput) {
  const data = studentRegistrationSchema.parse(input);
  const normalizedCurp = data.curp?.toUpperCase();

  return prisma.$transaction(async (tx) => {
    const [academicLevel, modality, group] = await Promise.all([
      tx.academicLevel.findUniqueOrThrow({
        where: { id: data.academicLevelId },
        select: { id: true, active: true }
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
        : Promise.resolve(null)
    ]);

    if (!academicLevel.active) {
      throw new Error("El nivel academico seleccionado esta inactivo.");
    }

    if (!modality.active || modality.academicLevelId !== data.academicLevelId) {
      throw new Error("La modalidad seleccionada no pertenece al nivel academico o esta inactiva.");
    }

    if (
      group &&
      (!group.active ||
        group.academicLevelId !== data.academicLevelId ||
        group.modalityId !== data.modalityId)
    ) {
      throw new Error("El grupo seleccionado no pertenece a la trayectoria academica o esta inactivo.");
    }

    if (normalizedCurp) {
      const existingCurp = await tx.student.findUnique({
        where: { curp: normalizedCurp }
      });

      if (existingCurp) {
        throw new Error("Ya existe un alumno registrado con esa CURP.");
      }
    }

    const enrollmentNumber = await generateEnrollmentNumber(
      data.academicLevelId,
      data.enrollmentDate,
      tx
    );

    const existingEnrollment = await tx.student.findUnique({
      where: { enrollmentNumber }
    });

    if (existingEnrollment) {
      throw new Error("No fue posible generar una matricula unica.");
    }

    const student = await tx.student.create({
      data: {
        enrollmentNumber,
        firstName: data.firstName,
        paternalLastName: data.paternalLastName,
        maternalLastName: data.maternalLastName,
        birthDate: parseDate(data.birthDate),
        curp: normalizedCurp,
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
        administrativeStatus: AdministrativeStatus.ACTIVE,
        observations: data.observations
      }
    });

    await tx.enrollment.create({
      data: {
        studentId: student.id,
        academicLevelId: data.academicLevelId,
        modalityId: data.modalityId,
        groupId: data.groupId,
        grade: data.grade,
        fourMonthPeriod: data.fourMonthPeriod,
        enrollmentDate: parseDate(data.enrollmentDate) ?? new Date(),
        startDate: parseDate(data.startDate),
        registrationFee: data.registrationFee ?? 0,
        weeklyFee: data.weeklyFee ?? 0,
        lateFeePercentage: data.lateFeePercentage ?? 0,
        paymentDay: data.paymentDay
      }
    });

    const documentTypes = await tx.documentType.findMany({
      where: { active: true }
    });

    await tx.studentDocument.createMany({
      data: documentTypes.map((documentType) => ({
        studentId: student.id,
        documentTypeId: documentType.id,
        status: DocumentStatus.PENDING
      }))
    });

    return student;
  });
}
