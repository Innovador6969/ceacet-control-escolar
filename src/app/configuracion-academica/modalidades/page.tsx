import { Layers3 } from "lucide-react";
import { CatalogPageHeader } from "@/components/catalog/catalog-page-header";
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
      <CatalogPageHeader
        title="Administracion de modalidades"
        description="Gestiona modalidades por nivel academico sin alterar registros historicos."
        icon={Layers3}
        countLabel={`${modalities.length} modalidad(es)`}
      />
      <ModalityForm
        academicLevels={catalogs.academicLevels}
        canManage={canManage}
      />
      <ModalitiesTable modalities={modalities} canManage={canManage} />
    </div>
  );
}
