import { Settings } from "lucide-react";
import Link from "next/link";
import { ComingSoonSection } from "@/components/sections/coming-soon-section";
import { requireUser } from "@/lib/auth/session";

export default async function SettingsPage() {
  await requireUser();

  return (
    <div className="space-y-5">
      <ComingSoonSection
        eyebrow="Configuracion"
        title="Parametros del sistema"
        description="Base para administrar usuarios, grupos, conceptos de cobro, modalidades, documentos requeridos y preferencias operativas."
        icon={Settings}
        items={[
          "Usuarios y permisos",
          "Grupos y modalidades",
          "Conceptos de cobro"
        ]}
      />
      <Link
        href="/configuracion-academica/ciclos-escolares"
        className="focus-ring inline-flex h-11 items-center rounded-lg border border-line bg-white px-4 text-sm font-bold text-ink shadow-sm transition hover:bg-surface"
      >
        Administrar ciclos escolares
      </Link>
      <Link
        href="/configuracion-academica/periodos-academicos"
        className="focus-ring inline-flex h-11 items-center rounded-lg border border-line bg-white px-4 text-sm font-bold text-ink shadow-sm transition hover:bg-surface"
      >
        Administrar periodos academicos
      </Link>
      <Link
        href="/configuracion-academica/niveles-academicos"
        className="focus-ring inline-flex h-11 items-center rounded-lg border border-line bg-white px-4 text-sm font-bold text-ink shadow-sm transition hover:bg-surface"
      >
        Administrar niveles academicos
      </Link>
      <Link
        href="/configuracion-academica/grupos"
        className="focus-ring inline-flex h-11 items-center rounded-lg bg-brand-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
      >
        Administrar grupos
      </Link>
      <Link
        href="/configuracion-academica/modalidades"
        className="focus-ring inline-flex h-11 items-center rounded-lg border border-line bg-white px-4 text-sm font-bold text-ink shadow-sm transition hover:bg-surface"
      >
        Administrar modalidades
      </Link>
    </div>
  );
}
