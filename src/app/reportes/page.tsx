import { BarChart3 } from "lucide-react";
import { ComingSoonSection } from "@/components/sections/coming-soon-section";
import { requireUser } from "@/lib/auth/session";

export default async function ReportsPage() {
  await requireUser();

  return (
    <ComingSoonSection
      eyebrow="Reportes"
      title="Indicadores academicos y financieros"
      description="Vista inicial para reportes de inscripciones, adeudos, ingresos, expedientes incompletos y seguimiento escolar."
      icon={BarChart3}
      items={["Reporte de alumnos", "Reporte de pagos", "Reporte documental"]}
    />
  );
}
