import { CatalogAuditAccordion } from "@/components/catalog/catalog-audit-accordion";

const fieldLabels: Record<string, string> = {
  code: "Codigo",
  name: "Nombre",
  description: "Descripcion",
  startDate: "Fecha inicial",
  endDate: "Fecha final",
  isActive: "Estado",
  isCurrent: "Actual"
};

type SchoolCycleAuditHistoryProps = {
  schoolCycleId: string;
  count: number;
};

export function SchoolCycleAuditHistory({
  schoolCycleId,
  count
}: SchoolCycleAuditHistoryProps) {
  return (
    <CatalogAuditAccordion
      entity="SchoolCycle"
      entityId={schoolCycleId}
      initialCount={count}
      emptyMessage="No hay eventos de auditoria para este ciclo escolar."
      fieldLabels={fieldLabels}
    />
  );
}
