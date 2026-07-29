import { formatDate } from "@/lib/labels";

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

function userLabel(user?: { name: string; email: string } | null) {
  return user ? `${user.name} (${user.email})` : "Registro anterior al modulo";
}

export function GroupMetadata({ group }: GroupMetadataProps) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-ink">Metadatos</h3>
      <dl className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold text-muted">Creado</dt>
          <dd className="mt-1 text-sm font-bold text-ink">{formatDate(group.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-muted">Creado por</dt>
          <dd className="mt-1 text-sm font-bold text-ink">{userLabel(group.createdBy)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-muted">Ultima modificacion</dt>
          <dd className="mt-1 text-sm font-bold text-ink">{formatDate(group.updatedAt)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-muted">Modificado por</dt>
          <dd className="mt-1 text-sm font-bold text-ink">{userLabel(group.updatedBy)}</dd>
        </div>
        <div className="md:col-span-2">
          <dt className="text-xs font-semibold text-muted">ID interno</dt>
          <dd className="mt-1 break-all text-sm font-bold text-ink">{group.id}</dd>
        </div>
      </dl>
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-line p-3">
          <p className="text-xs font-semibold text-muted">Inscripciones</p>
          <p className="mt-1 text-xl font-extrabold text-ink">{group._count.enrollments}</p>
        </div>
        <div className="rounded-lg border border-line p-3">
          <p className="text-xs font-semibold text-muted">Reinscripciones</p>
          <p className="mt-1 text-xl font-extrabold text-ink">{group._count.reEnrollments}</p>
        </div>
        <div className="rounded-lg border border-line p-3">
          <p className="text-xs font-semibold text-muted">Asignaciones</p>
          <p className="mt-1 text-xl font-extrabold text-ink">{group._count.academicAssignments}</p>
        </div>
        <div className="rounded-lg border border-line p-3">
          <p className="text-xs font-semibold text-muted">Eventos</p>
          <p className="mt-1 text-xl font-extrabold text-ink">{group._count.academicEvents}</p>
        </div>
      </div>
    </section>
  );
}
