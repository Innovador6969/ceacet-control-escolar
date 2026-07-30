import { Badge } from "@/components/ui/badge";

type CatalogStatusBadgeProps = {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
};

export function CatalogStatusBadge({
  active,
  activeLabel = "Activo",
  inactiveLabel = "Inactivo"
}: CatalogStatusBadgeProps) {
  return (
    <Badge tone={active ? "green" : "gray"}>
      {active ? activeLabel : inactiveLabel}
    </Badge>
  );
}
