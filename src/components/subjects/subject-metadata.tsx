import { CatalogMetadataCard } from "@/components/catalog/catalog-metadata-card";

type SubjectMetadataProps = {
  subject: {
    id: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    createdBy?: { name: string; email: string } | null;
    updatedBy?: { name: string; email: string } | null;
    dependencies: {
      academicAssignments: number;
      activeAssignments: number;
      scheduledEvents: number;
    };
  };
};

export function SubjectMetadata({ subject }: SubjectMetadataProps) {
  return (
    <CatalogMetadataCard
      record={subject}
      stats={[
        { label: "Asignaciones", value: subject.dependencies.academicAssignments },
        { label: "Asignaciones activas", value: subject.dependencies.activeAssignments },
        { label: "Eventos programados", value: subject.dependencies.scheduledEvents }
      ]}
      statColumnsClassName="sm:grid-cols-3"
    />
  );
}
