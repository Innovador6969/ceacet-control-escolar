import {
  AcademicEventStatus,
  AdministrativeStatus,
  ChargeStatus,
  EnrollmentStatus,
  PaymentStatus,
  ReEnrollmentStatus
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { groupLabelSelect } from "@/lib/services/groups";

function getDayRange(reference = new Date()) {
  const start = new Date(reference);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

function getMonthRange(reference = new Date()) {
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 1);

  return { start, end };
}

const pendingChargeStatuses = [
  ChargeStatus.PENDING,
  ChargeStatus.PARTIAL,
  ChargeStatus.OVERDUE
];

const ignoredChargeStatuses = [
  ChargeStatus.PAID,
  ChargeStatus.WAIVED,
  ChargeStatus.CANCELLED
];

const actionableReEnrollmentStatuses = [
  ReEnrollmentStatus.DRAFT,
  ReEnrollmentStatus.PENDING,
  ReEnrollmentStatus.PARTIAL,
  ReEnrollmentStatus.OVERDUE
];

export async function getDashboardData() {
  const now = new Date();
  const day = getDayRange(now);
  const month = getMonthRange(now);

  const activeSchoolCycle = await prisma.schoolCycle.findFirst({
    where: { isActive: true },
    orderBy: { startDate: "desc" },
    select: { id: true, name: true }
  });

  const enrollmentWhere = activeSchoolCycle
    ? {
        status: EnrollmentStatus.ACTIVE,
        OR: [{ schoolCycleId: activeSchoolCycle.id }, { schoolCycleId: null }]
      }
    : { status: EnrollmentStatus.ACTIVE };

  const [
    activeStudents,
    activeEnrollments,
    actionableReEnrollments,
    overdueCharges,
    pendingBalance,
    monthlyIncome,
    todayPayments,
    upcomingEvents,
    recentStudents,
    urgentCharges
  ] = await Promise.all([
    prisma.student.count({
      where: { administrativeStatus: AdministrativeStatus.ACTIVE }
    }),
    prisma.enrollment.count({ where: enrollmentWhere }),
    prisma.reEnrollment.count({
      where: { status: { in: actionableReEnrollmentStatuses } }
    }),
    prisma.charge.count({
      where: {
        dueDate: { lt: day.start },
        balance: { gt: 0 },
        status: { notIn: ignoredChargeStatuses }
      }
    }),
    prisma.charge.aggregate({
      where: {
        balance: { gt: 0 },
        status: { in: pendingChargeStatuses }
      },
      _sum: { balance: true }
    }),
    prisma.payment.aggregate({
      where: {
        status: PaymentStatus.APPLIED,
        paidAt: { gte: month.start, lt: month.end }
      },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: {
        status: PaymentStatus.APPLIED,
        paidAt: { gte: day.start, lt: day.end }
      },
      _sum: { amount: true },
      _count: { _all: true }
    }),
    prisma.academicCalendarEvent.findMany({
      where: {
        startsAt: { gte: now },
        status: { not: AcademicEventStatus.CANCELLED }
      },
      include: {
        academicPeriod: true,
        group: { select: groupLabelSelect },
        subject: true,
        teacher: true
      },
      orderBy: { startsAt: "asc" },
      take: 5
    }),
    prisma.student.findMany({
      select: {
        id: true,
        enrollmentNumber: true,
        firstName: true,
        paternalLastName: true,
        maternalLastName: true,
        administrativeStatus: true,
        createdAt: true,
        enrollments: {
          where: { status: EnrollmentStatus.ACTIVE },
          select: {
            modality: { select: { name: true } },
            group: { select: groupLabelSelect }
          },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.charge.findMany({
      where: {
        dueDate: { lt: day.start },
        balance: { gt: 0 },
        status: { notIn: ignoredChargeStatuses }
      },
      select: {
        id: true,
        balance: true,
        dueDate: true,
        enrollment: {
          select: {
            student: {
              select: {
                id: true,
                firstName: true,
                paternalLastName: true,
                maternalLastName: true
              }
            }
          }
        }
      },
      orderBy: [{ dueDate: "asc" }, { balance: "desc" }],
      take: 5
    })
  ]);

  return {
    activeSchoolCycle,
    stats: {
      activeStudents,
      activeEnrollments,
      actionableReEnrollments,
      overdueCharges,
      pendingBalance: pendingBalance._sum.balance?.toString() ?? "0",
      monthlyIncome: monthlyIncome._sum.amount?.toString() ?? "0",
      todayPaymentsAmount: todayPayments._sum.amount?.toString() ?? "0",
      todayPaymentsCount: todayPayments._count._all,
      upcomingEventsCount: upcomingEvents.length
    },
    upcomingEvents,
    recentStudents,
    urgentCharges
  };
}
