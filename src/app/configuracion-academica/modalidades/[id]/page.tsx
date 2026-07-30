import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ModalityAuditHistory } from "@/components/modalities/modality-audit-history";
import { ModalityForm } from "@/components/modalities/modality-form";
import { ModalityMetadata } from "@/components/modalities/modality-metadata";
import { requireUser } from "@/lib/auth/session";
import {
  getModalityAuditHistory,
  getModalityById,
  getModalityFormCatalogs
} from "@/lib/services/modalities";

type ModalityDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ModalityDetailPage({
  params
}: ModalityDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const [modality, auditHistory] = await Promise.all([
    getModalityById(id),
    getModalityAuditHistory(id)
  ]);

  if (!modality) {
    notFound();
  }

  const catalogs = await getModalityFormCatalogs(modality.academicLevelId);
  const canManage = user.role !== "READ_ONLY";

  return (
    <div className="space-y-5">
      <Link
        href="/configuracion-academica/modalidades"
        className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a modalidades
      </Link>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-600">Modalidad academica</p>
          <h2 className="mt-1 text-2xl font-extrabold text-ink">
            {modality.name}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {modality.description ?? "Sin descripcion registrada."}
          </p>
        </div>
        <Badge tone={modality.active ? "green" : "gray"}>
          {modality.active ? "Activa" : "Inactiva"}
        </Badge>
      </div>
      <ModalityForm
        modality={modality}
        academicLevels={catalogs.academicLevels}
        canManage={canManage}
      />
      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-ink">Grupos relacionados</h3>
        <div className="mt-4 divide-y divide-line">
          {modality.groups.map((group) => (
            <div key={group.id} className="flex flex-col justify-between gap-2 py-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold text-ink">{group.name}</p>
                <p className="mt-1 text-xs text-muted">
                  {group.schedule ?? "Sin horario"} · Capacidad {group.capacity ?? "sin limite"}
                </p>
              </div>
              <Badge tone={group.active ? "green" : "gray"}>
                {group.active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          ))}
          {modality.groups.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              No hay grupos relacionados con esta modalidad.
            </p>
          ) : null}
        </div>
      </section>
      <ModalityMetadata modality={modality} />
      <ModalityAuditHistory entries={auditHistory} />
    </div>
  );
}
