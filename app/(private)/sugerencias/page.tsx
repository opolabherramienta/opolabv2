import type { Metadata } from "next";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Cuéntanos qué falla · OpoLab" };

export default async function SugerenciasPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string | string[] }>;
}) {
  const from = (await searchParams).desde;
  // Only a path of this site is accepted as "where I came from".
  const page = typeof from === "string" && /^\/[\w\-/]{0,150}$/.test(from) ? from : null;

  return (
    <div className="space-y-8">
      <PageHeader
        description="Un fallo, algo que no se entiende o una idea. Lo leemos todo y nos ayuda a decidir qué arreglar primero."
        title="Cuéntanos qué falla"
      />
      <Card>
        <FeedbackForm page={page} />
      </Card>
    </div>
  );
}
