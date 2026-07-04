import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export default function AdminSugerenciasPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        description="Aquí se configurarán sugerencias base para planificación y seguimiento."
        title="Sugerencias admin"
      />
      <Card>
        <p className="text-sm leading-6 text-slate-600">
          Placeholder para reglas y mensajes administrables.
        </p>
      </Card>
    </div>
  );
}
