import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GroupAuditHistory } from "@/components/groups/group-audit-history";
import { GroupForm } from "@/components/groups/group-form";
import { GroupMetadata } from "@/components/groups/group-metadata";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/session";
import { formatGroupLabel } from "@/lib/labels";
import {
  getGroupAuditHistory,
  getGroupById,
  getGroupFormCatalogs
} from "@/lib/services/groups";

type GroupDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const [group, catalogs, auditHistory] = await Promise.all([
    getGroupById(id),
    getGroupFormCatalogs(),
    getGroupAuditHistory(id)
  ]);

  if (!group) {
    notFound();
  }

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
        <Badge tone={group.active ? "green" : "gray"}>
          {group.active ? "Activo" : "Inactivo"}
        </Badge>
      </div>
      <GroupForm
        group={group}
        academicLevels={catalogs.academicLevels}
        modalities={catalogs.modalities}
        canManage={canManage}
      />
      <GroupMetadata group={group} />
      <GroupAuditHistory entries={auditHistory} />
    </div>
  );
}
