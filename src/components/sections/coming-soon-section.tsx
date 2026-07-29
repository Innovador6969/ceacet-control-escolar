import type { LucideIcon } from "lucide-react";

type ComingSoonSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  items: string[];
};

export function ComingSoonSection({
  eyebrow,
  title,
  description,
  icon: Icon,
  items
}: ComingSoonSectionProps) {
  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-white p-5 shadow-panel sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-brand-600">{eyebrow}</p>
            <h2 className="mt-1 text-2xl font-extrabold text-ink">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              {description}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article
            key={item}
            className="rounded-lg border border-line bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-bold text-ink">{item}</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Interfaz preparada para conectarse con datos reales en la siguiente
              etapa.
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
