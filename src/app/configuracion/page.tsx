import { Settings } from "lucide-react";
import { ComingSoonSection } from "@/components/sections/coming-soon-section";
import { requireUser } from "@/lib/auth/session";

export default async function SettingsPage() {
  await requireUser();

  return (
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
  );
}
