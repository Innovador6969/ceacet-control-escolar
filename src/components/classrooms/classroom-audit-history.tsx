import { CatalogAuditAccordion } from "@/components/catalog/catalog-audit-accordion";

const fieldLabels = {
  code: "Codigo",
  name: "Nombre",
  location: "Ubicacion",
  capacity: "Capacidad",
  description: "Descripcion",
  active: "Estado"
};

type ClassroomAuditHistoryProps = {
  classroomId: string;
  count: number;
};

export function ClassroomAuditHistory({ classroomId, count }: ClassroomAuditHistoryProps) {
  return (
    <CatalogAuditAccordion
      entity="Classroom"
      entityId={classroomId}
      initialCount={count}
      emptyMessage="Aun no hay auditoria para esta aula."
      fieldLabels={fieldLabels}
    />
  );
}
