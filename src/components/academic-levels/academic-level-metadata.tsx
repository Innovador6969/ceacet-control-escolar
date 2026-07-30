import { CatalogMetadataCard } from "@/components/catalog/catalog-metadata-card";
import { CatalogStatusBadge } from "@/components/catalog/catalog-status-badge";

type AcademicLevelMetadataProps = {
  academicLevel: {
    id: string;
    active: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
    activeModalityCount: number;
    activeGroupCount: number;
    createdBy?: { name: string; email: string } | null;
    updatedBy?: { name: string; email: string } | null;
    _count: {
      modalities: number;
      groups: number;
      enrollments: number;
      reEnrollments: number;
      subjects: number;
      academicAssignments: number;
      academicEvents: number;
    };
  };
};

export function AcademicLevelMetadata({
  academicLevel
}: AcademicLevelMetadataProps) {
  return (
    <CatalogMetadataCard
      record={academicLevel}
      headerAction={<CatalogStatusBadge active={academicLevel.active} />}
      statColumnsClassName="sm:grid-cols-3 xl:grid-cols-6"
      stats={[
        { label: "Modalidades", value: academicLevel._count.modalities },
        { label: "Modalidades activas", value: academicLevel.activeModalityCount },
        { label: "Grupos", value: academicLevel._count.groups },
        { label: "Grupos activos", value: academicLevel.activeGroupCount },
        { label: "Materias", value: academicLevel._count.subjects },
        { label: "Eventos", value: academicLevel._count.academicEvents }
      ]}
    />
  );
}
