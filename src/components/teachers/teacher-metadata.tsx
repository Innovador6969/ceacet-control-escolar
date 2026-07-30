import { CatalogMetadataCard } from "@/components/catalog/catalog-metadata-card";

type TeacherMetadataProps = {
  teacher: {
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

export function TeacherMetadata({ teacher }: TeacherMetadataProps) {
  return (
    <CatalogMetadataCard
      record={teacher}
      stats={[
        { label: "Asignaciones", value: teacher.dependencies.academicAssignments },
        { label: "Asignaciones activas", value: teacher.dependencies.activeAssignments },
        { label: "Eventos programados", value: teacher.dependencies.scheduledEvents }
      ]}
      statColumnsClassName="sm:grid-cols-3"
    />
  );
}
