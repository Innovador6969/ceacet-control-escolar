import {
  ChargeStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  ReEnrollmentStatus
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { getActiveAcademicLevels } from "@/lib/services/academic-levels";
import { getActiveGroups, groupLabelSelect } from "@/lib/services/groups";
import { getActiveModalities } from "@/lib/services/modalities";
import {
  reEnrollmentCreateSchema,
  reEnrollmentPaymentSchema,
  type ReEnrollmentCreateInput,
  type ReEnrollmentPaymentInput
} from "@/lib/validations/reenrollment";

const activeReEnrollmentStatuses = [
  ReEnrollmentStatus.DRAFT,
  ReEnrollmentStatus.PENDING,
  ReEnrollmentStatus.PARTIAL,
  ReEnrollmentStatus.PAID,
  ReEnrollmentStatus.OVERDUE,
  ReEnrollmentStatus.WAIVED
];

function parseDate(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined;
}

function parseDateTime(value?: string) {
  return value ? new Date(value) : new Date();
}

function toChargeStatus(status: ReEnrollmentStatus, dueDate: Date): ChargeStatus {
  if (status === ReEnrollmentStatus.PAID) return ChargeStatus.PAID;
  if (status === ReEnrollmentStatus.PARTIAL) return ChargeStatus.PARTIAL;
  if (status === ReEnrollmentStatus.WAIVED) return ChargeStatus.WAIVED;
  if (status === ReEnrollmentStatus.CANCELLED) return ChargeStatus.CANCELLED;
  if (status === ReEnrollmentStatus.OVERDUE || dueDate < new Date()) {
    return ChargeStatus.OVERDUE;
  }
  return ChargeStatus.PENDING;
}

async function getOrCreateReEnrollmentConcept(tx: Prisma.TransactionClient) {
  const existing = await tx.chargeConcept.findUnique({
    where: { code: "REINSCRIPCION" }
  });

  if (existing) return existing;

  return tx.chargeConcept.create({
    data: {
      name: "Reinscripcion",
      code: "REINSCRIPCION",
      defaultAmount: 0
    }
  });
}

async function ensureResultingEnrollment(
  tx: Prisma.TransactionClient,
  reEnrollmentId: string
) {
  const reEnrollment = await tx.reEnrollment.findUniqueOrThrow({
    where: { id: reEnrollmentId },
    include: {
      student: true,
      charge: { include: { enrollment: true } }
    }
  });

  if (reEnrollment.resultingEnrollmentId) {
    return reEnrollment.resultingEnrollmentId;
  }

  const existing = await tx.enrollment.findFirst({
    where: {
      studentId: reEnrollment.studentId,
      schoolCycleId: reEnrollment.schoolCycleId,
      academicPeriodId: reEnrollment.academicPeriodId ?? null,
      academicLevelId: reEnrollment.academicLevelId,
      modalityId: reEnrollment.modalityId,
      groupId: reEnrollment.groupId ?? null,
      status: "ACTIVE"
    }
  });

  if (existing) {
    await tx.reEnrollment.update({
      where: { id: reEnrollment.id },
      data: { resultingEnrollmentId: existing.id }
    });
    return existing.id;
  }

  const previousEnrollment = reEnrollment.charge.enrollment;
  const created = await tx.enrollment.create({
    data: {
      studentId: reEnrollment.studentId,
      academicLevelId: reEnrollment.academicLevelId,
      modalityId: reEnrollment.modalityId,
      groupId: reEnrollment.groupId,
      schoolCycleId: reEnrollment.schoolCycleId,
      academicPeriodId: reEnrollment.academicPeriodId,
      grade: previousEnrollment.grade,
      fourMonthPeriod: previousEnrollment.fourMonthPeriod,
      enrollmentDate: new Date(),
      startDate: previousEnrollment.startDate,
      registrationFee: previousEnrollment.registrationFee,
      weeklyFee: previousEnrollment.weeklyFee,
      lateFeePercentage: previousEnrollment.lateFeePercentage,
      paymentDay: previousEnrollment.paymentDay
    }
  });

  await tx.reEnrollment.update({
    where: { id: reEnrollment.id },
    data: { resultingEnrollmentId: created.id }
  });

  return created.id;
}

export async function getReEnrollmentModuleData() {
  const [
    reEnrollments,
    students,
    schoolCycles,
    academicPeriods,
    academicLevels,
    modalities,
    groups
  ] = await Promise.all([
    prisma.reEnrollment.findMany({
      include: {
        student: true,
        schoolCycle: true,
        academicPeriod: true,
        academicLevel: true,
        modality: true,
        group: { select: groupLabelSelect },
        charge: { include: { paymentApplications: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.student.findMany({
      where: { administrativeStatus: { notIn: ["TEMPORARY_LEAVE", "GRADUATED"] } },
      orderBy: [{ paternalLastName: "asc" }, { firstName: "asc" }]
    }),
    prisma.schoolCycle.findMany({ orderBy: { startDate: "desc" } }),
    prisma.academicPeriod.findMany({
      include: { schoolCycle: true },
      orderBy: { startDate: "desc" }
    }),
    getActiveAcademicLevels(),
    getActiveModalities(),
    getActiveGroups()
  ]);

  return {
    reEnrollments,
    students,
    schoolCycles,
    academicPeriods,
    academicLevels,
    modalities,
    groups
  };
}

export async function createReEnrollment(
  input: ReEnrollmentCreateInput,
  createdById?: string
) {
  const data = reEnrollmentCreateSchema.parse(input);
  const dueDate = parseDate(data.dueDate) ?? new Date();
  const status = data.status ?? ReEnrollmentStatus.PENDING;

  return prisma.$transaction(async (tx) => {
    const [schoolCycle, academicPeriod] = await Promise.all([
      tx.schoolCycle.findUniqueOrThrow({ where: { id: data.schoolCycleId } }),
      data.academicPeriodId
        ? tx.academicPeriod.findUniqueOrThrow({
            where: { id: data.academicPeriodId }
          })
        : Promise.resolve(null)
    ]);
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

    if (academicPeriod) {
      const periodInsideCycle =
        academicPeriod.schoolCycleId === schoolCycle.id &&
        academicPeriod.startDate >= schoolCycle.startDate &&
        academicPeriod.endDate <= schoolCycle.endDate;

      if (!periodInsideCycle) {
        throw new Error("El periodo academico no pertenece o no esta contenido en el ciclo escolar.");
      }
    }

    const duplicate = await tx.reEnrollment.findFirst({
      where: {
        studentId: data.studentId,
        schoolCycleId: data.schoolCycleId,
        academicPeriodId: data.academicPeriodId ?? null,
        academicLevelId: data.academicLevelId,
        modalityId: data.modalityId,
        groupId: data.groupId ?? null,
        status: { in: activeReEnrollmentStatuses }
      }
    });

    if (duplicate) {
      throw new Error("Ya existe una reinscripcion activa para este alumno, ciclo y trayectoria academica.");
    }

    const activeEnrollment = await tx.enrollment.findFirst({
      where: {
        studentId: data.studentId,
        status: "ACTIVE"
      },
      orderBy: { createdAt: "desc" }
    });

    if (!activeEnrollment) {
      throw new Error("El alumno no tiene una inscripcion activa para asociar el cargo.");
    }

    const concept = await getOrCreateReEnrollmentConcept(tx);
    const charge = await tx.charge.create({
      data: {
        enrollmentId: activeEnrollment.id,
        chargeConceptId: concept.id,
        dueDate,
        baseAmount: data.amount,
        balance: data.amount,
        status: toChargeStatus(status, dueDate)
      }
    });

    const reEnrollment = await tx.reEnrollment.create({
      data: {
        studentId: data.studentId,
        schoolCycleId: data.schoolCycleId,
        academicPeriodId: data.academicPeriodId,
        academicLevelId: data.academicLevelId,
        modalityId: data.modalityId,
        groupId: data.groupId,
        chargeId: charge.id,
        status,
        dueDate,
        lateFeePercentage: data.lateFeePercentage,
        createdById
      }
    });

    if (status === ReEnrollmentStatus.WAIVED) {
      await ensureResultingEnrollment(tx, reEnrollment.id);
    }

    return reEnrollment;
  });
}

export async function registerReEnrollmentPayment(
  input: ReEnrollmentPaymentInput,
  createdById?: string
) {
  const data = reEnrollmentPaymentSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const reEnrollment = await tx.reEnrollment.findUniqueOrThrow({
      where: { id: data.reEnrollmentId },
      include: {
        charge: { include: { paymentApplications: true } },
        student: true
      }
    });

    if (
      reEnrollment.status === ReEnrollmentStatus.CANCELLED ||
      reEnrollment.status === ReEnrollmentStatus.WAIVED
    ) {
      throw new Error("No se pueden registrar pagos en una reinscripcion cancelada o condonada.");
    }

    const currentBalance = Number(reEnrollment.charge.balance);

    if (currentBalance <= 0) {
      throw new Error("El cargo de reinscripcion ya esta liquidado.");
    }

    if (data.amount > currentBalance) {
      throw new Error("El pago no puede ser mayor al saldo pendiente.");
    }

    const payment = await tx.payment.create({
      data: {
        studentId: reEnrollment.studentId,
        amount: data.amount,
        paymentMethod: data.paymentMethod ?? PaymentMethod.CASH,
        reference: data.reference,
        paidAt: parseDateTime(data.paidAt),
        status: PaymentStatus.APPLIED,
        createdById
      }
    });

    await tx.paymentApplication.create({
      data: {
        paymentId: payment.id,
        chargeId: reEnrollment.chargeId,
        amount: data.amount
      }
    });

    const aggregate = await tx.paymentApplication.aggregate({
      where: { chargeId: reEnrollment.chargeId },
      _sum: { amount: true }
    });
    const applied = Number(aggregate._sum.amount ?? 0);
    const chargeTotal =
      Number(reEnrollment.charge.baseAmount) +
      Number(reEnrollment.charge.surchargeAmount) -
      Number(reEnrollment.charge.discountAmount);
    const balance = Math.max(chargeTotal - applied, 0);
    const chargeStatus =
      balance <= 0 ? ChargeStatus.PAID : applied > 0 ? ChargeStatus.PARTIAL : ChargeStatus.PENDING;
    const reEnrollmentStatus =
      balance <= 0
        ? ReEnrollmentStatus.PAID
        : applied > 0
          ? ReEnrollmentStatus.PARTIAL
          : ReEnrollmentStatus.PENDING;

    await tx.charge.update({
      where: { id: reEnrollment.chargeId },
      data: { balance, status: chargeStatus }
    });

    await tx.reEnrollment.update({
      where: { id: reEnrollment.id },
      data: { status: reEnrollmentStatus }
    });

    const receiptCount = await tx.receipt.count();
    const receipt = await tx.receipt.create({
      data: {
        paymentId: payment.id,
        folio: `REC-${new Date().getFullYear()}-${String(receiptCount + 1).padStart(5, "0")}`
      }
    });

    if (chargeStatus === ChargeStatus.PAID) {
      await ensureResultingEnrollment(tx, reEnrollment.id);
    }

    return { payment, receipt, balance, status: reEnrollmentStatus };
  });
}

export async function refreshReEnrollmentStatuses() {
  const overdue = await prisma.reEnrollment.findMany({
    where: {
      dueDate: { lt: new Date() },
      status: { in: [ReEnrollmentStatus.PENDING, ReEnrollmentStatus.PARTIAL] }
    },
    select: { id: true, chargeId: true }
  });

  await prisma.$transaction(
    overdue.flatMap((item) => [
      prisma.reEnrollment.update({
        where: { id: item.id },
        data: { status: ReEnrollmentStatus.OVERDUE }
      }),
      prisma.charge.update({
        where: { id: item.chargeId },
        data: { status: ChargeStatus.OVERDUE }
      })
    ])
  );
}
