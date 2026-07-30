import { CatalogMetadataCard } from "@/components/catalog/catalog-metadata-card";
import { CatalogStatusBadge } from "@/components/catalog/catalog-status-badge";

type AcademicPeriodMetadataProps = {
  academicPeriod: {
    id: string;
    isActive: boolean;
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

export function AcademicPeriodMetadata({ academicPeriod }: AcademicPeriodMetadataProps) {
  return (
    <CatalogMetadataCard
      record={academicPeriod}
      headerAction={<CatalogStatusBadge active={academicPeriod.isActive} />}
      stats={[
        { label: "Inscripciones", value: academicPeriod._count.enrollments },
        { label: "Reinscripciones", value: academicPeriod._count.reEnrollments },
        { label: "Asignaciones", value: academicPeriod._count.academicAssignments },
        { label: "Eventos", value: academicPeriod._count.academicEvents }
      ]}
    />
  );
}
