import { CatalogMetadataCard } from "@/components/catalog/catalog-metadata-card";
import { CatalogStatusBadge } from "@/components/catalog/catalog-status-badge";

type ModalityMetadataProps = {
  modality: {
    id: string;
    active: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
    activeGroupCount: number;
    createdBy?: { name: string; email: string } | null;
    updatedBy?: { name: string; email: string } | null;
    _count: {
      groups: number;
      enrollments: number;
      reEnrollments: number;
      subjects: number;
      academicAssignments: number;
      academicEvents: number;
    };
  };
};

export function ModalityMetadata({ modality }: ModalityMetadataProps) {
  return (
    <CatalogMetadataCard
      record={modality}
      headerAction={
        <CatalogStatusBadge
          active={modality.active}
          activeLabel="Activa"
          inactiveLabel="Inactiva"
        />
      }
      statColumnsClassName="sm:grid-cols-3 xl:grid-cols-6"
      stats={[
        { label: "Grupos", value: modality._count.groups },
        { label: "Grupos activos", value: modality.activeGroupCount },
        { label: "Inscripciones", value: modality._count.enrollments },
        { label: "Reinscripciones", value: modality._count.reEnrollments },
        { label: "Materias", value: modality._count.subjects },
        { label: "Eventos", value: modality._count.academicEvents }
      ]}
    />
  );
}
