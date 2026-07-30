import { CatalogAuditAccordion } from "@/components/catalog/catalog-audit-accordion";

const fieldLabels = {
  code: "Codigo",
  name: "Nombre",
  email: "Correo",
  phone: "Telefono",
  specialty: "Especialidad",
  description: "Descripcion",
  active: "Estado"
};

type TeacherAuditHistoryProps = {
  teacherId: string;
  count: number;
};

export function TeacherAuditHistory({ teacherId, count }: TeacherAuditHistoryProps) {
  return (
    <CatalogAuditAccordion
      entity="Teacher"
      entityId={teacherId}
      initialCount={count}
      emptyMessage="Aun no hay auditoria para este docente."
      fieldLabels={fieldLabels}
    />
  );
}
