import { CatalogMetadataCard } from "@/components/catalog/catalog-metadata-card";

type ClassroomMetadataProps = {
  classroom: {
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

export function ClassroomMetadata({ classroom }: ClassroomMetadataProps) {
  return (
    <CatalogMetadataCard
      record={classroom}
      stats={[
        { label: "Asignaciones", value: classroom.dependencies.academicAssignments },
        { label: "Asignaciones activas", value: classroom.dependencies.activeAssignments },
        { label: "Eventos programados", value: classroom.dependencies.scheduledEvents }
      ]}
      statColumnsClassName="sm:grid-cols-3"
    />
  );
}
