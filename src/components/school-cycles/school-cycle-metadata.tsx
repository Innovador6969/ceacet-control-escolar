import { CatalogMetadataCard } from "@/components/catalog/catalog-metadata-card";
import { CatalogStatusBadge } from "@/components/catalog/catalog-status-badge";
import { Badge } from "@/components/ui/badge";

type SchoolCycleMetadataProps = {
  schoolCycle: {
    id: string;
    isActive: boolean;
    isCurrent: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
    createdBy?: { name: string; email: string } | null;
    updatedBy?: { name: string; email: string } | null;
    _count: {
      periods: number;
      enrollments: number;
      reEnrollments: number;
      academicEvents: number;
    };
    dependencies: {
      activePeriods: number;
      activeEnrollments: number;
      activeReEnrollments: number;
      scheduledEvents: number;
      activeAssignments: number;
    };
  };
};

export function SchoolCycleMetadata({ schoolCycle }: SchoolCycleMetadataProps) {
  return (
    <CatalogMetadataCard
      record={schoolCycle}
      headerAction={
        <div className="flex items-center gap-2">
          {schoolCycle.isCurrent ? <Badge tone="blue">Actual</Badge> : null}
          <CatalogStatusBadge active={schoolCycle.isActive} />
        </div>
      }
      statColumnsClassName="sm:grid-cols-3 xl:grid-cols-6"
      stats={[
        { label: "Periodos", value: schoolCycle._count.periods },
        { label: "Periodos activos", value: schoolCycle.dependencies.activePeriods },
        { label: "Inscripciones", value: schoolCycle._count.enrollments },
        { label: "Reinscripciones", value: schoolCycle._count.reEnrollments },
        { label: "Asignaciones activas", value: schoolCycle.dependencies.activeAssignments },
        { label: "Eventos", value: schoolCycle._count.academicEvents }
      ]}
    />
  );
}
