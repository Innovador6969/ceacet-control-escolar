import { Layers3 } from "lucide-react";
import { CatalogPageHeader } from "@/components/catalog/catalog-page-header";
import { GroupForm } from "@/components/groups/group-form";
import { GroupsTable } from "@/components/groups/groups-table";
import { requireUser } from "@/lib/auth/session";
import {
  getGroupFormCatalogs,
  getGroups
} from "@/lib/services/groups";

export default async function GroupsPage() {
  const user = await requireUser();
  const [groups, catalogs] = await Promise.all([
    getGroups(),
    getGroupFormCatalogs()
  ]);
  const canManage = user.role !== "READ_ONLY";

  return (
    <div className="space-y-5">
      <CatalogPageHeader
        title="Administracion de grupos"
        description="Gestiona grupos por nivel y modalidad sin eliminar historiales."
        icon={Layers3}
        countLabel={`${groups.length} grupo(s)`}
      />
      <GroupForm
        academicLevels={catalogs.academicLevels}
        modalities={catalogs.modalities}
        canManage={canManage}
      />
      <GroupsTable groups={groups} canManage={canManage} />
    </div>
  );
}
