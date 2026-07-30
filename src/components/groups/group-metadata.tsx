import { CatalogMetadataCard } from "@/components/catalog/catalog-metadata-card";

type GroupMetadataProps = {
  group: {
    id: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    createdBy?: { name: string; email: string } | null;
    updatedBy?: { name: string; email: string } | null;
    _count: {
      enrollments: number;
      reEnrollments: number;
      academicAssignments: number;
      academicEvents: number;
    };
  };
};

export function GroupMetadata({ group }: GroupMetadataProps) {
  return (
    <CatalogMetadataCard
      record={group}
      stats={[
        { label: "Inscripciones", value: group._count.enrollments },
        { label: "Reinscripciones", value: group._count.reEnrollments },
        { label: "Asignaciones", value: group._count.academicAssignments },
        { label: "Eventos", value: group._count.academicEvents }
      ]}
    />
  );
}
