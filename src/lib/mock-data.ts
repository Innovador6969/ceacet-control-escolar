import {
  BookOpenCheck,
  CircleDollarSign,
  ClipboardList,
  FileWarning,
  Landmark,
  UsersRound
} from "lucide-react";

export type StudentStatus =
  | "Activo"
  | "Al corriente"
  | "Con adeudo"
  | "Baja temporal"
  | "Egresado";

export type Student = {
  id: string;
  paternalLastName: string;
  maternalLastName: string;
  firstName: string;
  curp: string;
  level: "Secundaria" | "Preparatoria";
  modality:
    | "Secundaria abierta"
    | "Preparatoria abierta"
    | "Preparatoria evaluación global"
    | "Preparatoria cuatrimestral";
  grade: string;
  group: string;
  status: StudentStatus;
  phone: string;
  email: string;
  enrollmentDate: string;
  weeklyFee: number;
  pendingBalance: number;
  missingDocuments: number;
};

export const students: Student[] = [
  {
    id: "al-001",
    paternalLastName: "Hernandez",
    maternalLastName: "Lopez",
    firstName: "Mariana",
    curp: "HELM090314MDFRPR04",
    level: "Secundaria",
    modality: "Secundaria abierta",
    grade: "2",
    group: "A",
    status: "Al corriente",
    phone: "442 100 1122",
    email: "mariana.hernandez@example.com",
    enrollmentDate: "2026-01-12",
    weeklyFee: 250,
    pendingBalance: 0,
    missingDocuments: 0
  },
  {
    id: "al-002",
    paternalLastName: "Ramirez",
    maternalLastName: "Santos",
    firstName: "Carlos",
    curp: "RASC080820HQTRNR08",
    level: "Preparatoria",
    modality: "Preparatoria abierta",
    grade: "1",
    group: "B",
    status: "Con adeudo",
    phone: "442 200 3344",
    email: "carlos.ramirez@example.com",
    enrollmentDate: "2025-11-04",
    weeklyFee: 300,
    pendingBalance: 900,
    missingDocuments: 1
  },
  {
    id: "al-003",
    paternalLastName: "Garcia",
    maternalLastName: "Mendoza",
    firstName: "Sofia",
    curp: "GAMS071201MQTRNF06",
    level: "Preparatoria",
    modality: "Preparatoria cuatrimestral",
    grade: "3",
    group: "C",
    status: "Activo",
    phone: "442 300 5566",
    email: "sofia.garcia@example.com",
    enrollmentDate: "2026-02-05",
    weeklyFee: 320,
    pendingBalance: 320,
    missingDocuments: 2
  },
  {
    id: "al-004",
    paternalLastName: "Torres",
    maternalLastName: "Vega",
    firstName: "Luis Angel",
    curp: "TOVL090909HQTRGS02",
    level: "Secundaria",
    modality: "Secundaria abierta",
    grade: "3",
    group: "Sabatino",
    status: "Al corriente",
    phone: "442 400 7788",
    email: "luis.torres@example.com",
    enrollmentDate: "2026-03-18",
    weeklyFee: 250,
    pendingBalance: 0,
    missingDocuments: 0
  },
  {
    id: "al-005",
    paternalLastName: "Morales",
    maternalLastName: "Cruz",
    firstName: "Diana",
    curp: "MOCD081125MQTRRN01",
    level: "Preparatoria",
    modality: "Preparatoria evaluación global",
    grade: "Global",
    group: "Global",
    status: "Activo",
    phone: "442 500 9900",
    email: "diana.morales@example.com",
    enrollmentDate: "2026-04-20",
    weeklyFee: 0,
    pendingBalance: 500,
    missingDocuments: 1
  },
  {
    id: "al-006",
    paternalLastName: "Perez",
    maternalLastName: "Aguilar",
    firstName: "Jorge",
    curp: "PEAJ070703HQTRGR09",
    level: "Preparatoria",
    modality: "Preparatoria abierta",
    grade: "2",
    group: "A",
    status: "Con adeudo",
    phone: "442 600 1212",
    email: "jorge.perez@example.com",
    enrollmentDate: "2025-09-01",
    weeklyFee: 300,
    pendingBalance: 1200,
    missingDocuments: 3
  },
  {
    id: "al-007",
    paternalLastName: "Sanchez",
    maternalLastName: "Rios",
    firstName: "Valeria",
    curp: "SARV091010MQTNLS05",
    level: "Secundaria",
    modality: "Secundaria abierta",
    grade: "1",
    group: "B",
    status: "Activo",
    phone: "442 700 3434",
    email: "valeria.sanchez@example.com",
    enrollmentDate: "2026-01-30",
    weeklyFee: 250,
    pendingBalance: 250,
    missingDocuments: 1
  },
  {
    id: "al-008",
    paternalLastName: "Flores",
    maternalLastName: "Navarro",
    firstName: "Andrea",
    curp: "FONA080522MQTLVD03",
    level: "Preparatoria",
    modality: "Preparatoria cuatrimestral",
    grade: "1",
    group: "C",
    status: "Al corriente",
    phone: "442 800 5656",
    email: "andrea.flores@example.com",
    enrollmentDate: "2026-05-03",
    weeklyFee: 320,
    pendingBalance: 0,
    missingDocuments: 0
  },
  {
    id: "al-009",
    paternalLastName: "Castillo",
    maternalLastName: "Ortega",
    firstName: "Miguel",
    curp: "CAOM071212HQTSRG07",
    level: "Preparatoria",
    modality: "Preparatoria evaluación global",
    grade: "Global",
    group: "Global",
    status: "Baja temporal",
    phone: "442 900 7878",
    email: "miguel.castillo@example.com",
    enrollmentDate: "2025-07-22",
    weeklyFee: 0,
    pendingBalance: 0,
    missingDocuments: 2
  },
  {
    id: "al-010",
    paternalLastName: "Gutierrez",
    maternalLastName: "Pineda",
    firstName: "Fernanda",
    curp: "GUPF100101MQTTNR00",
    level: "Secundaria",
    modality: "Secundaria abierta",
    grade: "2",
    group: "A",
    status: "Al corriente",
    phone: "442 111 9090",
    email: "fernanda.gutierrez@example.com",
    enrollmentDate: "2026-06-10",
    weeklyFee: 250,
    pendingBalance: 0,
    missingDocuments: 0
  }
];

export const dashboardStats = [
  {
    title: "Alumnos activos",
    value: "140",
    note: "Base estimada para la operación actual",
    icon: UsersRound,
    tone: "brand" as const
  },
  {
    title: "Alumnos al corriente",
    value: "96",
    note: "Sin saldos pendientes registrados",
    icon: BookOpenCheck,
    tone: "green" as const
  },
  {
    title: "Alumnos con adeudo",
    value: "31",
    note: "Requieren seguimiento administrativo",
    icon: CircleDollarSign,
    tone: "red" as const
  },
  {
    title: "Expedientes incompletos",
    value: "18",
    note: "Documentos faltantes por validar",
    icon: FileWarning,
    tone: "yellow" as const
  },
  {
    title: "Ingresos del dia",
    value: "$7,850",
    note: "Pagos registrados hoy",
    icon: Landmark,
    tone: "cyan" as const
  },
  {
    title: "Pagos pendientes",
    value: "42",
    note: "Cargos vencidos o por vencer",
    icon: ClipboardList,
    tone: "gray" as const
  }
];
