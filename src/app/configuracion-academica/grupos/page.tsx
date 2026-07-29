import { Layers3 } from "lucide-react";
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-600">
            Configuracion academica
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-ink">
            Administracion de grupos
          </h2>
          <p className="mt-2 text-sm text-muted">
            Gestiona grupos por nivel y modalidad sin eliminar historiales.
          </p>
        </div>
        <span className="inline-flex h-11 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-bold text-ink shadow-sm">
          <Layers3 className="h-4 w-4" aria-hidden="true" />
          {groups.length} grupo(s)
        </span>
      </div>
      <GroupForm
        academicLevels={catalogs.academicLevels}
        modalities={catalogs.modalities}
        canManage={canManage}
      />
      <GroupsTable groups={groups} canManage={canManage} />
    </div>
  );
}
