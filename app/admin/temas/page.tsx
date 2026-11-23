import { requireAdmin } from "@/lib/auth/authorization";
﻿import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function AdminTemasPage() {
  await requireAdmin();
  return (
    <div className="space-y-8">
      <PageHeader
        description="Aquí se administrará el catálogo base de temas por especialidad."
        title="Temas admin"
      />
      <Card>
        <p className="text-sm leading-6 text-slate-600">
          Placeholder para altas, revisión y organización de temas oficiales.
        </p>
      </Card>
    </div>
  );
}
