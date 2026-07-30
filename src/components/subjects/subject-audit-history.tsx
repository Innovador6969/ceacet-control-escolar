import { CatalogAuditAccordion } from "@/components/catalog/catalog-audit-accordion";

const fieldLabels = {
  code: "Codigo",
  name: "Nombre",
  description: "Descripcion",
  academicLevelId: "Nivel academico",
  modalityId: "Modalidad",
  active: "Estado"
};

type SubjectAuditHistoryProps = {
  subjectId: string;
  count: number;
};

export function SubjectAuditHistory({ subjectId, count }: SubjectAuditHistoryProps) {
  return (
    <CatalogAuditAccordion
      entity="Subject"
      entityId={subjectId}
      initialCount={count}
      emptyMessage="Aun no hay auditoria para esta materia."
      fieldLabels={fieldLabels}
    />
  );
}
