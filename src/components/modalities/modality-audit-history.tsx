import { CatalogAuditAccordion } from "@/components/catalog/catalog-audit-accordion";

const fieldLabels: Record<string, string> = {
  code: "Codigo",
  name: "Nombre",
  description: "Descripcion",
  academicLevelId: "Nivel academico",
  active: "Estado"
};

type ModalityAuditHistoryProps = {
  modalityId: string;
  count: number;
};

export function ModalityAuditHistory({ modalityId, count }: ModalityAuditHistoryProps) {
  return (
    <CatalogAuditAccordion
      entity="Modality"
      entityId={modalityId}
      initialCount={count}
      emptyMessage="No hay eventos de auditoria para esta modalidad."
      fieldLabels={fieldLabels}
    />
  );
}
