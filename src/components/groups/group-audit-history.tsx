import { CatalogAuditAccordion } from "@/components/catalog/catalog-audit-accordion";

const fieldLabels: Record<string, string> = {
  code: "Codigo",
  name: "Nombre",
  description: "Descripcion",
  academicLevelId: "Nivel academico",
  modalityId: "Modalidad",
  schedule: "Horario",
  capacity: "Capacidad",
  active: "Estado"
};

type GroupAuditHistoryProps = {
  groupId: string;
  count: number;
};

export function GroupAuditHistory({ groupId, count }: GroupAuditHistoryProps) {
  return (
    <CatalogAuditAccordion
      entity="Group"
      entityId={groupId}
      initialCount={count}
      emptyMessage="No hay eventos de auditoria para este grupo."
      fieldLabels={fieldLabels}
    />
  );
}
