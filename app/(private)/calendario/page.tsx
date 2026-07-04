import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CalendarioPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        description="Aquí se mostrará la planificación mensual."
        title="Calendario"
      />
      <Card>
        <p className="text-sm leading-6 text-slate-600">
          Vista placeholder del calendario de estudio, repasos y simulacros.
        </p>
      </Card>
    </div>
  );
}
