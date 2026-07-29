import { Landmark } from "lucide-react";
import { ComingSoonSection } from "@/components/sections/coming-soon-section";
import { requireUser } from "@/lib/auth/session";

export default async function PaymentsPage() {
  await requireUser();

  return (
    <ComingSoonSection
      eyebrow="Pagos"
      title="Control de cargos y recibos"
      description="Modulo inicial para cuotas semanales, inscripciones, recargos, aplicaciones de pago y recibos. No implementa pagos reales todavia."
      icon={Landmark}
      items={[
        "Cargos por concepto",
        "Aplicacion de pagos",
        "Recibos y folios"
      ]}
    />
  );
}
