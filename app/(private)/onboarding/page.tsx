import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { loadOnboardingData } from "@/lib/onboarding/data";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const data = await loadOnboardingData(supabase, user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        description="Cuéntanos qué oposición preparas, cuándo es el examen y cuánto tiempo tienes cada semana."
        title="Configura tu oposición"
      />
      <Card>
        {data.errorMessage ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            No se pudieron cargar los datos: {data.errorMessage}
          </p>
        ) : (
          <OnboardingForm
            autonomousCommunities={data.autonomousCommunities}
            educationStages={data.educationStages}
            profile={data.profile}
            specialties={data.specialties}
          />
        )}
      </Card>
    </div>
  );
}
