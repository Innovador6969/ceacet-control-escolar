import { PaymentsTabs } from "@/components/payments/payments-tabs";
import { requireUser } from "@/lib/auth/session";
import { formatGroupLabel } from "@/lib/labels";
import { getReEnrollmentModuleData } from "@/lib/services/reenrollments";

export default async function PaymentsPage() {
  await requireUser();
  const data = await getReEnrollmentModuleData();

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-brand-600">Pagos</p>
        <h2 className="mt-1 text-2xl font-extrabold text-ink">
          Control de pagos y reinscripciones
        </h2>
        <p className="mt-2 text-sm text-muted">
          Gestiona cargos, pagos parciales, recibos y reinscripciones con
          trazabilidad financiera.
        </p>
      </div>
      <PaymentsTabs
        rows={data.reEnrollments.map((item) => ({
          id: item.id,
          studentName: `${item.student.paternalLastName} ${item.student.maternalLastName ?? ""} ${item.student.firstName}`,
          schoolCycle: item.schoolCycle.name,
          academicPeriod: item.academicPeriod?.name ?? "Sin periodo",
          program: item.modality.name,
          groupId: item.group?.id ?? "",
          group: item.group ? formatGroupLabel(item.group) : "Sin grupo",
          status: item.status,
          dueDate: item.dueDate.toISOString().slice(0, 10),
          amount: Number(item.charge.baseAmount),
          balance: Number(item.charge.balance)
        }))}
        students={data.students.map((student) => ({
          id: student.id,
          name: `${student.paternalLastName} ${student.maternalLastName ?? ""} ${student.firstName}`
        }))}
        schoolCycles={data.schoolCycles.map((cycle) => ({
          id: cycle.id,
          name: cycle.name
        }))}
        academicPeriods={data.academicPeriods.map((period) => ({
          id: period.id,
          name: `${period.name} (${period.schoolCycle.name})`,
          schoolCycleId: period.schoolCycleId
        }))}
        academicLevels={data.academicLevels.map((level) => ({
          id: level.id,
          name: level.name
        }))}
        modalities={data.modalities.map((modality) => ({
          id: modality.id,
          name: modality.name
        }))}
        groups={data.groups.map((group) => ({
          id: group.id,
          name: formatGroupLabel(group)
        }))}
      />
    </div>
  );
}
