import type { ReactNode } from "react";
import { formatDate } from "@/lib/labels";
import type { CatalogMetadataRecord } from "@/lib/types/catalog";

type StatItem = {
  label: string;
  value: number | string;
};

type CatalogMetadataCardProps = {
  record: CatalogMetadataRecord;
  title?: string;
  showId?: boolean;
  stats?: StatItem[];
  statColumnsClassName?: string;
  headerAction?: ReactNode;
};

function userLabel(user: CatalogMetadataRecord["createdBy"]) {
  return user ? `${user.name} (${user.email})` : "Registro anterior al modulo";
}

export function CatalogMetadataCard({
  record,
  title = "Metadatos",
  showId = true,
  stats = [],
  statColumnsClassName = "sm:grid-cols-4",
  headerAction
}: CatalogMetadataCardProps) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-ink">{title}</h3>
        {headerAction}
      </div>
      <dl className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold text-muted">Creado</dt>
          <dd className="mt-1 text-sm font-bold text-ink">{formatDate(record.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-muted">Creado por</dt>
          <dd className="mt-1 text-sm font-bold text-ink">{userLabel(record.createdBy)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-muted">Ultima modificacion</dt>
          <dd className="mt-1 text-sm font-bold text-ink">{formatDate(record.updatedAt)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-muted">Modificado por</dt>
          <dd className="mt-1 text-sm font-bold text-ink">{userLabel(record.updatedBy)}</dd>
        </div>
        {showId ? (
          <div className="md:col-span-2">
            <dt className="text-xs font-semibold text-muted">ID interno</dt>
            <dd className="mt-1 break-all text-sm font-bold text-ink">{record.id}</dd>
          </div>
        ) : null}
      </dl>
      {stats.length > 0 ? (
        <div className={`mt-5 grid gap-3 ${statColumnsClassName}`}>
          {stats.map((item) => (
            <div key={item.label} className="rounded-lg border border-line p-3">
              <p className="text-xs font-semibold text-muted">{item.label}</p>
              <p className="mt-1 text-xl font-extrabold text-ink">{item.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
