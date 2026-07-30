import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AcademicLevelAuditHistory } from "@/components/academic-levels/academic-level-audit-history";
import { AcademicLevelForm } from "@/components/academic-levels/academic-level-form";
import { AcademicLevelMetadata } from "@/components/academic-levels/academic-level-metadata";
import { CatalogStatusBadge } from "@/components/catalog/catalog-status-badge";
import { requireUser } from "@/lib/auth/session";
import { countCatalogAuditEntries } from "@/lib/services/catalog-audit";
import {
  getAcademicLevelById
} from "@/lib/services/academic-levels";

type AcademicLevelDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AcademicLevelDetailPage({
  params
}: AcademicLevelDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const [academicLevel, auditCount] = await Promise.all([
    getAcademicLevelById(id),
    countCatalogAuditEntries("AcademicLevel", id)
  ]);

  if (!academicLevel) {
    notFound();
  }

  const canManage = user.role !== "READ_ONLY";

  return (
    <div className="space-y-5">
      <Link
        href="/configuracion-academica/niveles-academicos"
        className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a niveles academicos
      </Link>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-600">Nivel academico</p>
          <h2 className="mt-1 text-2xl font-extrabold text-ink">
            {academicLevel.name}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {academicLevel.description ?? "Sin descripcion registrada."}
          </p>
        </div>
        <CatalogStatusBadge active={academicLevel.active} />
      </div>
      <AcademicLevelForm academicLevel={academicLevel} canManage={canManage} />
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-ink">Modalidades relacionadas</h3>
          <div className="mt-4 divide-y divide-line">
            {academicLevel.modalities.map((modality) => (
              <div key={modality.id} className="flex flex-col justify-between gap-2 py-3 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-bold text-ink">{modality.name}</p>
                  <p className="mt-1 text-xs text-muted">{modality.code ?? "Sin codigo"}</p>
                </div>
                <CatalogStatusBadge
                  active={modality.active}
                  activeLabel="Activa"
                  inactiveLabel="Inactiva"
                />
              </div>
            ))}
            {academicLevel.modalities.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">
                No hay modalidades relacionadas con este nivel.
              </p>
            ) : null}
          </div>
        </div>
        <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-ink">Grupos relacionados</h3>
          <div className="mt-4 divide-y divide-line">
            {academicLevel.groups.map((group) => (
              <div key={group.id} className="flex flex-col justify-between gap-2 py-3 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm font-bold text-ink">{group.name}</p>
                  <p className="mt-1 text-xs text-muted">
                    {group.modality.name} - {group.schedule ?? "Sin horario"} - Capacidad {group.capacity ?? "sin limite"}
                  </p>
                </div>
                <CatalogStatusBadge active={group.active} />
              </div>
            ))}
            {academicLevel.groups.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">
                No hay grupos relacionados con este nivel.
              </p>
            ) : null}
          </div>
        </div>
      </section>
      <AcademicLevelMetadata academicLevel={academicLevel} />
      <AcademicLevelAuditHistory academicLevelId={academicLevel.id} count={auditCount} />
    </div>
  );
}
