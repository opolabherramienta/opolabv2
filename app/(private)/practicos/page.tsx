import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export default function PracticosPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        description="Aquí el usuario organizará prácticos, simulacros y ejercicios de preparación."
        title="Prácticos"
      />
      <Card>
        <p className="text-sm leading-6 text-slate-600">
          Panel placeholder para registrar prácticos pendientes y completados.
        </p>
      </Card>
    </div>
  );
}
