import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/labels";

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

function userLabel(user?: { name: string; email: string } | null) {
  return user ? `${user.name} (${user.email})` : "Registro anterior al modulo";
}

export function AcademicLevelMetadata({
  academicLevel
}: AcademicLevelMetadataProps) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-ink">Metadatos</h3>
        <Badge tone={academicLevel.active ? "green" : "gray"}>
          {academicLevel.active ? "Activo" : "Inactivo"}
        </Badge>
      </div>
      <dl className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold text-muted">Creado</dt>
          <dd className="mt-1 text-sm font-bold text-ink">{formatDate(academicLevel.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-muted">Creado por</dt>
          <dd className="mt-1 text-sm font-bold text-ink">{userLabel(academicLevel.createdBy)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-muted">Ultima modificacion</dt>
          <dd className="mt-1 text-sm font-bold text-ink">{formatDate(academicLevel.updatedAt)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-muted">Modificado por</dt>
          <dd className="mt-1 text-sm font-bold text-ink">{userLabel(academicLevel.updatedBy)}</dd>
        </div>
        <div className="md:col-span-2">
          <dt className="text-xs font-semibold text-muted">ID interno</dt>
          <dd className="mt-1 break-all text-sm font-bold text-ink">{academicLevel.id}</dd>
        </div>
      </dl>
      <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {[
          ["Modalidades", academicLevel._count.modalities],
          ["Modalidades activas", academicLevel.activeModalityCount],
          ["Grupos", academicLevel._count.groups],
          ["Grupos activos", academicLevel.activeGroupCount],
          ["Materias", academicLevel._count.subjects],
          ["Eventos", academicLevel._count.academicEvents]
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-lg border border-line p-3">
            <p className="text-xs font-semibold text-muted">{label}</p>
            <p className="mt-1 text-xl font-extrabold text-ink">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
