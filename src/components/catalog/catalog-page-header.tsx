import type { LucideIcon } from "lucide-react";

type CatalogPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  icon: LucideIcon;
  countLabel: string;
};

export function CatalogPageHeader({
  eyebrow = "Configuracion academica",
  title,
  description,
  icon: Icon,
  countLabel
}: CatalogPageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-semibold text-brand-600">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-extrabold text-ink">{title}</h2>
        <p className="mt-2 text-sm text-muted">{description}</p>
      </div>
      <span className="inline-flex h-11 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-bold text-ink shadow-sm">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {countLabel}
      </span>
    </div>
  );
}
