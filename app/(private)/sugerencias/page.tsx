import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SugerenciasPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        description="Aquí se mostrarán recomendaciones y avisos para ajustar el plan de estudio."
        title="Sugerencias"
      />
      <Card>
        <p className="text-sm leading-6 text-slate-600">
          Bloque placeholder para sugerencias de repaso, carga semanal y prioridades.
        </p>
      </Card>
    </div>
  );
}
