import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";

export default function ProgresoPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        description="Aquí el opositor verá su avance acumulado y los indicadores principales."
        title="Progreso"
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Avance general" tone="green" value="42%" />
        <StatCard label="Repasos programados" value="11" />
        <StatCard label="Alertas de ritmo" tone="orange" value="2" />
      </div>
    </div>
  );
}
