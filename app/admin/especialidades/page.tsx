import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export default function AdminEspecialidadesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        description="Aquí se gestionarán las especialidades disponibles para los opositores."
        title="Especialidades"
      />
      <Card>
        <p className="text-sm leading-6 text-slate-600">
          Tabla placeholder de especialidades administrables.
        </p>
      </Card>
    </div>
  );
}
