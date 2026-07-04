import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export default function AdminUsuariosPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        description="Aquí se visualizarán usuarios y métricas básicas cuando exista autenticación."
        title="Usuarios"
      />
      <Card>
        <p className="text-sm leading-6 text-slate-600">
          Listado placeholder de usuarios de la plataforma.
        </p>
      </Card>
    </div>
  );
}
