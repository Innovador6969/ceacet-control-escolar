import type { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

type StatCardProps = {
  title: string;
  value: string;
  note: string;
  icon: LucideIcon;
  tone: "brand" | "green" | "yellow" | "red" | "cyan" | "gray";
};

const toneClasses = {
  brand: "bg-brand-50 text-brand-700",
  green: "bg-emerald-50 text-emerald-700",
  yellow: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  cyan: "bg-cyan-50 text-cyan-700",
  gray: "bg-gray-50 text-gray-700"
};

export function StatCard({ title, value, note, icon: Icon, tone }: StatCardProps) {
  return (
    <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-ink">
            {value}
          </p>
        </div>
        <span
          className={clsx(
            "grid h-11 w-11 shrink-0 place-items-center rounded-lg",
            toneClasses[tone]
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-sm text-muted">{note}</p>
    </article>
  );
}
