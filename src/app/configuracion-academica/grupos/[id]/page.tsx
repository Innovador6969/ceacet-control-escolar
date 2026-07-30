import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CatalogStatusBadge } from "@/components/catalog/catalog-status-badge";
import { GroupAuditHistory } from "@/components/groups/group-audit-history";
import { GroupForm } from "@/components/groups/group-form";
import { GroupMetadata } from "@/components/groups/group-metadata";
import { requireUser } from "@/lib/auth/session";
import { formatGroupLabel } from "@/lib/labels";
import { countCatalogAuditEntries } from "@/lib/services/catalog-audit";
import {
  getGroupById,
  getGroupFormCatalogs
} from "@/lib/services/groups";

type GroupDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const [group, auditCount] = await Promise.all([
    getGroupById(id),
    countCatalogAuditEntries("Group", id)
  ]);

  if (!group) {
    notFound();
  }

  const catalogs = await getGroupFormCatalogs(group.academicLevelId, group.modalityId);
  const canManage = user.role !== "READ_ONLY";

  return (
    <div className="space-y-5">
      <Link
        href="/configuracion-academica/grupos"
        className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a grupos
      </Link>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-brand-600">Grupo academico</p>
          <h2 className="mt-1 text-2xl font-extrabold text-ink">
            {formatGroupLabel(group)}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {group.description ?? "Sin descripcion registrada."}
          </p>
        </div>
        <CatalogStatusBadge active={group.active} />
      </div>
      <GroupForm
        group={group}
        academicLevels={catalogs.academicLevels}
        modalities={catalogs.modalities}
        canManage={canManage}
      />
      <GroupMetadata group={group} />
      <GroupAuditHistory groupId={group.id} count={auditCount} />
    </div>
  );
}
