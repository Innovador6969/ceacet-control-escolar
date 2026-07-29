import { FileText } from "lucide-react";
import { ComingSoonSection } from "@/components/sections/coming-soon-section";
import { requireUser } from "@/lib/auth/session";

export default async function DocumentsPage() {
  await requireUser();

  return (
    <ComingSoonSection
      eyebrow="Documentos"
      title="Expedientes documentales"
      description="Seguimiento de documentos requeridos por alumno, estatus de revision y almacenamiento preparado para integrarse con Google Drive despues."
      icon={FileText}
      items={[
        "Tipos de documento",
        "Documentos por alumno",
        "Validacion de expediente"
      ]}
    />
  );
}
