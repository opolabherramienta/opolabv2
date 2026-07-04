import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export default function AjustesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        description="Aquí el usuario ajustará preferencias de planificación y datos básicos de su oposición."
        title="Ajustes"
      />
      <Card>
        <p className="text-sm leading-6 text-slate-600">
          Placeholder de preferencias, especialidad y fecha objetivo.
        </p>
      </Card>
    </div>
  );
}
