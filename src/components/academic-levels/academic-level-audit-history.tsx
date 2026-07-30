import { CatalogAuditAccordion } from "@/components/catalog/catalog-audit-accordion";

const fieldLabels: Record<string, string> = {
  code: "Codigo",
  name: "Nombre",
  description: "Descripcion",
  displayOrder: "Orden",
  active: "Estado"
};

type AcademicLevelAuditHistoryProps = {
  academicLevelId: string;
  count: number;
};

export function AcademicLevelAuditHistory({
  academicLevelId,
  count
}: AcademicLevelAuditHistoryProps) {
  return (
    <CatalogAuditAccordion
      entity="AcademicLevel"
      entityId={academicLevelId}
      initialCount={count}
      emptyMessage="No hay eventos de auditoria para este nivel academico."
      fieldLabels={fieldLabels}
    />
  );
}
