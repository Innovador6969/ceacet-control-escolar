import {
  AdministrativeStatus,
  ChargeStatus,
  DocumentStatus,
  PaymentMethod,
  Sex,
  UserRole
} from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

const date = (value: string) => new Date(`${value}T00:00:00`);

async function main() {
  await prisma.paymentApplication.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.reEnrollment.deleteMany();
  await prisma.charge.deleteMany();
  await prisma.studentDocument.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.academicCalendarEvent.deleteMany();
  await prisma.scheduleRule.deleteMany();
  await prisma.academicAssignment.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.student.deleteMany();
  await prisma.group.deleteMany();
  await prisma.modality.deleteMany();
  await prisma.academicLevel.deleteMany();
  await prisma.academicPeriod.deleteMany();
  await prisma.schoolCycle.deleteMany();
  await prisma.documentType.deleteMany();
  await prisma.chargeConcept.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await hashPassword("Admin123!");
  const controlPassword = await hashPassword("Control123!");

  const [admin, schoolControl] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Administrador CEACET",
        email: "admin@ceacet.test",
        passwordHash: adminPassword,
        role: UserRole.ADMIN
      }
    }),
    prisma.user.create({
      data: {
        name: "Control Escolar",
        email: "control@ceacet.test",
        passwordHash: controlPassword,
        role: UserRole.SCHOOL_CONTROL
      }
    })
  ]);

  const secundaria = await prisma.academicLevel.create({
    data: { name: "Secundaria", code: "SEC" }
  });
  const preparatoria = await prisma.academicLevel.create({
    data: { name: "Preparatoria", code: "PRE" }
  });

  const modalities = await Promise.all([
    prisma.modality.create({
      data: {
        academicLevelId: secundaria.id,
        name: "Secundaria abierta",
        code: "SEC_ABIERTA"
      }
    }),
    prisma.modality.create({
      data: {
        academicLevelId: preparatoria.id,
        name: "Preparatoria abierta",
        code: "PRE_ABIERTA"
      }
    }),
    prisma.modality.create({
      data: {
        academicLevelId: preparatoria.id,
        name: "Preparatoria evaluacion global",
        code: "PRE_GLOBAL"
      }
    }),
    prisma.modality.create({
      data: {
        academicLevelId: preparatoria.id,
        name: "Preparatoria cuatrimestral",
        code: "PRE_CUATRI"
      }
    })
  ]);

  const [secAbierta, preAbierta, preGlobal, preCuatrimestral] = modalities;

  const groups = await Promise.all([
    prisma.group.create({
      data: {
        name: "A",
        academicLevelId: secundaria.id,
        modalityId: secAbierta.id,
        schedule: "Lunes y miercoles 17:00-19:00",
        capacity: 35
      }
    }),
    prisma.group.create({
      data: {
        name: "A",
        academicLevelId: preparatoria.id,
        modalityId: preAbierta.id,
        schedule: "Martes y jueves 18:00-20:00",
        capacity: 35
      }
    }),
    prisma.group.create({
      data: {
        name: "Global",
        academicLevelId: preparatoria.id,
        modalityId: preGlobal.id,
        schedule: "Asesorias programadas",
        capacity: 35
      }
    }),
    prisma.group.create({
      data: {
        name: "C",
        academicLevelId: preparatoria.id,
        modalityId: preCuatrimestral.id,
        schedule: "Viernes 17:00-21:00",
        capacity: 35
      }
    })
  ]);

  const schoolCycle = await prisma.schoolCycle.create({
    data: {
      name: "Ciclo 2026",
      startDate: date("2026-01-15"),
      endDate: date("2026-12-15")
    }
  });

  const academicPeriods = await Promise.all([
    prisma.academicPeriod.create({
      data: {
        schoolCycleId: schoolCycle.id,
        name: "Primer periodo 2026",
        startDate: date("2026-01-15"),
        endDate: date("2026-06-30")
      }
    }),
    prisma.academicPeriod.create({
      data: {
        schoolCycleId: schoolCycle.id,
        name: "Segundo periodo 2026",
        startDate: date("2026-07-01"),
        endDate: date("2026-12-15")
      }
    })
  ]);

  const subjects = await Promise.all([
    prisma.subject.create({
      data: {
        name: "Matematicas",
        code: "MAT-SEC",
        academicLevelId: secundaria.id,
        modalityId: secAbierta.id
      }
    }),
    prisma.subject.create({
      data: {
        name: "Comunicacion",
        code: "COM-PRE",
        academicLevelId: preparatoria.id,
        modalityId: preAbierta.id
      }
    }),
    prisma.subject.create({
      data: {
        name: "Historia",
        code: "HIS-PRE",
        academicLevelId: preparatoria.id,
        modalityId: preCuatrimestral.id
      }
    })
  ]);

  const [teacherOne] = await Promise.all([
    prisma.teacher.create({
      data: { name: "Docente Demo Uno", email: "docente1@example.com" }
    }),
    prisma.teacher.create({
      data: { name: "Docente Demo Dos", email: "docente2@example.com" }
    })
  ]);

  const [classroomOne] = await Promise.all([
    prisma.classroom.create({
      data: { name: "Aula 1", location: "Planta baja", capacity: 25 }
    }),
    prisma.classroom.create({
      data: { name: "Aula 2", location: "Planta alta", capacity: 25 }
    })
  ]);

  await prisma.academicAssignment.create({
    data: {
      subjectId: subjects[0].id,
      groupId: groups[0].id,
      teacherId: teacherOne.id,
      classroomId: classroomOne.id,
      academicPeriodId: academicPeriods[0].id,
      academicLevelId: secundaria.id,
      modalityId: secAbierta.id,
      scheduleRules: {
        create: [
          {
            weekday: "MONDAY",
            startTime: "17:00",
            endTime: "18:30",
            startDate: date("2026-01-15"),
            endDate: date("2026-06-30")
          }
        ]
      }
    }
  });

  await prisma.academicCalendarEvent.create({
    data: {
      title: "Inicio de cursos 2026",
      type: "COURSE_START",
      startsAt: date("2026-01-15"),
      endsAt: date("2026-01-15"),
      allDay: true,
      schoolCycleId: schoolCycle.id,
      academicPeriodId: academicPeriods[0].id,
      createdById: admin.id
    }
  });

  const documentTypes = await Promise.all(
    [
      "Acta de nacimiento",
      "CURP",
      "Identificacion oficial",
      "Comprobante de domicilio",
      "Certificado anterior",
      "Fotografias"
    ].map((name) => prisma.documentType.create({ data: { name } }))
  );

  const concepts = await Promise.all([
    prisma.chargeConcept.create({
      data: { name: "Inscripcion", code: "INSCRIPCION", defaultAmount: 800 }
    }),
    prisma.chargeConcept.create({
      data: { name: "Cuota semanal", code: "CUOTA_SEMANAL", defaultAmount: 300 }
    }),
    prisma.chargeConcept.create({
      data: { name: "Recargo", code: "RECARGO", defaultAmount: 50 }
    }),
    prisma.chargeConcept.create({
      data: { name: "Reposicion de credencial", code: "CREDENCIAL", defaultAmount: 120 }
    }),
    prisma.chargeConcept.create({
      data: { name: "Examen global", code: "EXAMEN_GLOBAL", defaultAmount: 1500 }
    })
  ]);

  const weeklyConcept = concepts.find((concept) => concept.code === "CUOTA_SEMANAL")!;
  const inscriptionConcept = concepts.find((concept) => concept.code === "INSCRIPCION")!;
  const globalConcept = concepts.find((concept) => concept.code === "EXAMEN_GLOBAL")!;

  const students = [
    {
      enrollmentNumber: "SEC-2026-0001",
      firstName: "Mariana",
      paternalLastName: "Hernandez",
      maternalLastName: "Lopez",
      curp: "HELM090314MDFRPR04",
      sex: Sex.FEMALE,
      phone: "442 100 1122",
      email: "mariana.demo@example.com",
      status: AdministrativeStatus.CURRENT,
      level: secundaria,
      modality: secAbierta,
      group: groups[0],
      grade: "2",
      weeklyFee: 250,
      debt: 0,
      missingDocs: 0
    },
    {
      enrollmentNumber: "PRE-2026-0001",
      firstName: "Carlos",
      paternalLastName: "Ramirez",
      maternalLastName: "Santos",
      curp: "RASC080820HQTRNR08",
      sex: Sex.MALE,
      phone: "442 200 3344",
      email: "carlos.demo@example.com",
      status: AdministrativeStatus.WITH_DEBT,
      level: preparatoria,
      modality: preAbierta,
      group: groups[2],
      grade: "1",
      weeklyFee: 300,
      debt: 900,
      missingDocs: 1
    },
    {
      enrollmentNumber: "PRE-2026-0002",
      firstName: "Sofia",
      paternalLastName: "Garcia",
      maternalLastName: "Mendoza",
      curp: "GAMS071201MQTRNF06",
      sex: Sex.FEMALE,
      phone: "442 300 5566",
      email: "sofia.demo@example.com",
      status: AdministrativeStatus.ACTIVE,
      level: preparatoria,
      modality: preCuatrimestral,
      group: groups[3],
      grade: "3",
      fourMonthPeriod: 3,
      weeklyFee: 320,
      debt: 320,
      missingDocs: 2
    },
    {
      enrollmentNumber: "SEC-2026-0002",
      firstName: "Luis Angel",
      paternalLastName: "Torres",
      maternalLastName: "Vega",
      curp: "TOVL090909HQTRGS02",
      sex: Sex.MALE,
      phone: "442 400 7788",
      email: "luis.demo@example.com",
      status: AdministrativeStatus.CURRENT,
      level: secundaria,
      modality: secAbierta,
      group: groups[0],
      grade: "3",
      weeklyFee: 250,
      debt: 0,
      missingDocs: 0
    },
    {
      enrollmentNumber: "PRE-2026-0003",
      firstName: "Diana",
      paternalLastName: "Morales",
      maternalLastName: "Cruz",
      curp: "MOCD081125MQTRRN01",
      sex: Sex.FEMALE,
      phone: "442 500 9900",
      email: "diana.demo@example.com",
      status: AdministrativeStatus.ACTIVE,
      level: preparatoria,
      modality: preGlobal,
      group: groups[2],
      grade: "Global",
      weeklyFee: 0,
      debt: 500,
      missingDocs: 1
    },
    {
      enrollmentNumber: "PRE-2025-0001",
      firstName: "Jorge",
      paternalLastName: "Perez",
      maternalLastName: "Aguilar",
      curp: "PEAJ070703HQTRGR09",
      sex: Sex.MALE,
      phone: "442 600 1212",
      email: "jorge.demo@example.com",
      status: AdministrativeStatus.WITH_DEBT,
      level: preparatoria,
      modality: preAbierta,
      group: groups[2],
      grade: "2",
      weeklyFee: 300,
      debt: 1200,
      missingDocs: 3
    },
    {
      enrollmentNumber: "SEC-2026-0003",
      firstName: "Valeria",
      paternalLastName: "Sanchez",
      maternalLastName: "Rios",
      curp: "SARV091010MQTNLS05",
      sex: Sex.FEMALE,
      phone: "442 700 3434",
      email: "valeria.demo@example.com",
      status: AdministrativeStatus.ACTIVE,
      level: secundaria,
      modality: secAbierta,
      group: groups[0],
      grade: "1",
      weeklyFee: 250,
      debt: 250,
      missingDocs: 1
    },
    {
      enrollmentNumber: "PRE-2026-0004",
      firstName: "Andrea",
      paternalLastName: "Flores",
      maternalLastName: "Navarro",
      curp: "FONA080522MQTLVD03",
      sex: Sex.FEMALE,
      phone: "442 800 5656",
      email: "andrea.demo@example.com",
      status: AdministrativeStatus.CURRENT,
      level: preparatoria,
      modality: preCuatrimestral,
      group: groups[3],
      grade: "1",
      fourMonthPeriod: 1,
      weeklyFee: 320,
      debt: 0,
      missingDocs: 0
    },
    {
      enrollmentNumber: "PRE-2025-0002",
      firstName: "Miguel",
      paternalLastName: "Castillo",
      maternalLastName: "Ortega",
      curp: "CAOM071212HQTSRG07",
      sex: Sex.MALE,
      phone: "442 900 7878",
      email: "miguel.demo@example.com",
      status: AdministrativeStatus.TEMPORARY_LEAVE,
      level: preparatoria,
      modality: preGlobal,
      group: groups[2],
      grade: "Global",
      weeklyFee: 0,
      debt: 0,
      missingDocs: 2
    },
    {
      enrollmentNumber: "SEC-2026-0004",
      firstName: "Fernanda",
      paternalLastName: "Gutierrez",
      maternalLastName: "Pineda",
      curp: "GUPF100101MQTTNR00",
      sex: Sex.FEMALE,
      phone: "442 111 9090",
      email: "fernanda.demo@example.com",
      status: AdministrativeStatus.CURRENT,
      level: secundaria,
      modality: secAbierta,
      group: groups[0],
      grade: "2",
      weeklyFee: 250,
      debt: 0,
      missingDocs: 0
    }
  ];

  for (const [index, item] of students.entries()) {
    const student = await prisma.student.create({
      data: {
        enrollmentNumber: item.enrollmentNumber,
        firstName: item.firstName,
        paternalLastName: item.paternalLastName,
        maternalLastName: item.maternalLastName,
        birthDate: date("2008-01-15"),
        curp: item.curp,
        sex: item.sex,
        maritalStatus: "Soltero/a",
        occupation: "Estudiante",
        phone: item.phone,
        email: item.email,
        street: `Calle Demo ${index + 1}`,
        neighborhood: "Colonia Centro",
        city: "Queretaro",
        state: "Queretaro",
        postalCode: "76000",
        administrativeStatus: item.status,
        observations: item.debt > 0 ? "Requiere seguimiento de pagos." : null
      }
    });

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: student.id,
        academicLevelId: item.level.id,
        modalityId: item.modality.id,
        groupId: item.group.id,
        grade: item.grade,
        fourMonthPeriod: item.fourMonthPeriod,
        enrollmentDate: date(item.enrollmentNumber.includes("2025") ? "2025-09-01" : "2026-02-10"),
        startDate: date("2026-02-17"),
        registrationFee: 800,
        weeklyFee: item.weeklyFee,
        lateFeePercentage: 10,
        paymentDay: 6
      }
    });

    for (const [docIndex, documentType] of documentTypes.entries()) {
      const pending = docIndex < item.missingDocs;
      await prisma.studentDocument.create({
        data: {
          studentId: student.id,
          documentTypeId: documentType.id,
          status: pending ? DocumentStatus.PENDING : DocumentStatus.RECEIVED,
          receivedAt: pending ? null : date("2026-02-12"),
          physicalLocation: pending ? null : "Archivo fisico CEACET"
        }
      });
    }

    await prisma.charge.create({
      data: {
        enrollmentId: enrollment.id,
        chargeConceptId:
          item.modality.code === "PRE_GLOBAL" ? globalConcept.id : inscriptionConcept.id,
        dueDate: date("2026-02-10"),
        baseAmount: item.modality.code === "PRE_GLOBAL" ? 1500 : 800,
        balance: item.debt > 0 ? Math.min(item.debt, 800) : 0,
        status: item.debt > 0 ? ChargeStatus.OVERDUE : ChargeStatus.PAID
      }
    });

    if (item.weeklyFee > 0) {
      await prisma.charge.create({
        data: {
          enrollmentId: enrollment.id,
          chargeConceptId: weeklyConcept.id,
          dueDate: date("2026-07-25"),
          baseAmount: item.weeklyFee,
          surchargeAmount: item.debt > item.weeklyFee ? 50 : 0,
          balance: item.debt > 0 ? item.debt : 0,
          status: item.debt > 0 ? ChargeStatus.OVERDUE : ChargeStatus.PAID
        }
      });
    }

    if (item.debt === 0) {
      const payment = await prisma.payment.create({
        data: {
          studentId: student.id,
          amount: item.weeklyFee || 800,
          paymentMethod: PaymentMethod.CASH,
          paidAt: new Date(),
          createdById: schoolControl.id,
          reference: "Pago seed"
        }
      });

      await prisma.receipt.create({
        data: {
          paymentId: payment.id,
          folio: `REC-2026-${String(index + 1).padStart(4, "0")}`
        }
      });
    }

    if (item.debt > 0 || item.missingDocs > 0) {
      await prisma.followUp.create({
        data: {
          studentId: student.id,
          type: item.debt > 0 ? "PAYMENT" : "DOCUMENT",
          description:
            item.debt > 0
              ? "Contactar para regularizar saldo pendiente."
              : "Solicitar documentos faltantes del expediente.",
          nextFollowUpAt: date("2026-08-01"),
          createdById: admin.id
        }
      });
    }
  }

  console.log("Seed completado: usuarios, catalogos, alumnos y datos administrativos.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
