import { CatalogAuditAccordion } from "@/components/catalog/catalog-audit-accordion";

const fieldLabels: Record<string, string> = {
  code: "Codigo",
  name: "Nombre",
  description: "Descripcion",
  schoolCycleId: "Ciclo escolar",
  displayOrder: "Orden",
  startDate: "Fecha inicial",
  endDate: "Fecha final",
  isActive: "Estado"
};

type AcademicPeriodAuditHistoryProps = {
  academicPeriodId: string;
  count: number;
};

export function AcademicPeriodAuditHistory({
  academicPeriodId,
  count
}: AcademicPeriodAuditHistoryProps) {
  return (
    <CatalogAuditAccordion
      entity="AcademicPeriod"
      entityId={academicPeriodId}
      initialCount={count}
      emptyMessage="No hay eventos de auditoria para este periodo academico."
      fieldLabels={fieldLabels}
    />
  );
}
