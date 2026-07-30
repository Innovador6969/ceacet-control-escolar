import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/labels";

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

function userLabel(user?: { name: string; email: string } | null) {
  return user ? `${user.name} (${user.email})` : "Registro anterior al modulo";
}

export function ModalityMetadata({ modality }: ModalityMetadataProps) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-ink">Metadatos</h3>
        <Badge tone={modality.active ? "green" : "gray"}>
          {modality.active ? "Activa" : "Inactiva"}
        </Badge>
      </div>
      <dl className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold text-muted">Creada</dt>
          <dd className="mt-1 text-sm font-bold text-ink">{formatDate(modality.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-muted">Creada por</dt>
          <dd className="mt-1 text-sm font-bold text-ink">{userLabel(modality.createdBy)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-muted">Ultima modificacion</dt>
          <dd className="mt-1 text-sm font-bold text-ink">{formatDate(modality.updatedAt)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-muted">Modificada por</dt>
          <dd className="mt-1 text-sm font-bold text-ink">{userLabel(modality.updatedBy)}</dd>
        </div>
        <div className="md:col-span-2">
          <dt className="text-xs font-semibold text-muted">ID interno</dt>
          <dd className="mt-1 break-all text-sm font-bold text-ink">{modality.id}</dd>
        </div>
      </dl>
      <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {[
          ["Grupos", modality._count.groups],
          ["Grupos activos", modality.activeGroupCount],
          ["Inscripciones", modality._count.enrollments],
          ["Reinscripciones", modality._count.reEnrollments],
          ["Materias", modality._count.subjects],
          ["Eventos", modality._count.academicEvents]
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
