import { Layers3 } from "lucide-react";
import { ModalitiesTable } from "@/components/modalities/modalities-table";
import { ModalityForm } from "@/components/modalities/modality-form";
import { requireUser } from "@/lib/auth/session";
import {
  getModalities,
  getModalityFormCatalogs
} from "@/lib/services/modalities";

export default async function ModalitiesPage() {
  const user = await requireUser();
  const [modalities, catalogs] = await Promise.all([
    getModalities(),
    getModalityFormCatalogs()
  ]);
  const canManage = user.role !== "READ_ONLY";

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-600">
            Configuracion academica
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-ink">
            Administracion de modalidades
          </h2>
          <p className="mt-2 text-sm text-muted">
            Gestiona modalidades por nivel academico sin alterar registros historicos.
          </p>
        </div>
        <span className="inline-flex h-11 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-bold text-ink shadow-sm">
          <Layers3 className="h-4 w-4" aria-hidden="true" />
          {modalities.length} modalidad(es)
        </span>
      </div>
      <ModalityForm
        academicLevels={catalogs.academicLevels}
        canManage={canManage}
      />
      <ModalitiesTable modalities={modalities} canManage={canManage} />
    </div>
  );
}
