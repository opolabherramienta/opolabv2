import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        description="Aquí se mostrará el resumen de administración de Opolab Planner."
        title="Dashboard admin"
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Especialidades" value="0" />
        <StatCard label="Temas cargados" tone="green" value="0" />
        <StatCard label="Avisos pendientes" tone="orange" value="0" />
      </div>
    </div>
  );
}
