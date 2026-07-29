import type {
  AdministrativeStatus,
  ChargeStatus,
  DocumentStatus,
  PaymentMethod,
  Sex,
  UserRole
} from "@prisma/client";

export const administrativeStatusLabels: Record<AdministrativeStatus, string> = {
  ACTIVE: "Activo",
  CURRENT: "Al corriente",
  WITH_DEBT: "Con adeudo",
  TEMPORARY_LEAVE: "Baja temporal",
  GRADUATED: "Egresado"
};

export const documentStatusLabels: Record<DocumentStatus, string> = {
  PENDING: "Pendiente",
  RECEIVED: "Recibido",
  REVIEW: "En revision",
  REJECTED: "Rechazado"
};

export const chargeStatusLabels: Record<ChargeStatus, string> = {
  PENDING: "Pendiente",
  PARTIAL: "Parcial",
  PAID: "Pagado",
  OVERDUE: "Vencido",
  WAIVED: "Condonado",
  CANCELLED: "Cancelado"
};

export const sexLabels: Record<Sex, string> = {
  FEMALE: "Femenino",
  MALE: "Masculino",
  OTHER: "Otro",
  NOT_SPECIFIED: "Prefiere no decir"
};

export const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  MANAGEMENT: "Direccion",
  CASHIER: "Caja",
  SCHOOL_CONTROL: "Control escolar",
  READ_ONLY: "Solo lectura"
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  CARD: "Tarjeta",
  OTHER: "Otro"
};

export function formatMoney(value: number | string) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
  }).format(Number(value));
}

export function formatDate(value?: Date | string | null) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium"
  }).format(new Date(value));
}
