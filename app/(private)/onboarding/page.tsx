import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type CatalogOption = {
  id: string;
  name: string;
};

type UserOppositionProfile = {
  education_stage_id: string | null;
  specialty_id: string | null;
  autonomous_community_id: string | null;
  opposition_date: string | null;
  weekly_available_hours: number | null;
  available_days: string[] | null;
  default_topic_duration_minutes: number | null;
  default_practical_duration_minutes: number | null;
  main_goal: string | null;
};

function getLoadError(errors: Array<{ message: string } | null>) {
  const error = errors.find(Boolean);

  if (!error) {
    return null;
  }

  return `No se pudieron cargar los datos del onboarding: ${error.message}`;
}

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    educationStagesResult,
    specialtiesResult,
    autonomousCommunitiesResult,
    profileResult,
  ] = await Promise.all([
    supabase
      .from("education_stages")
      .select("id, name")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("specialties")
      .select("id, name")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("autonomous_communities")
      .select("id, name")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("user_opposition_profiles")
      .select(
        [
          "education_stage_id",
          "specialty_id",
          "autonomous_community_id",
          "opposition_date",
          "weekly_available_hours",
          "available_days",
          "default_topic_duration_minutes",
          "default_practical_duration_minutes",
          "main_goal",
        ].join(", "),
      )
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  const loadError = getLoadError([
    educationStagesResult.error,
    specialtiesResult.error,
    autonomousCommunitiesResult.error,
    profileResult.error,
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        description="Configura tu especialidad, fecha objetivo y ritmo de estudio para preparar el plan inicial."
        title="Onboarding"
      />
      <Card>
        {loadError ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {loadError}
          </p>
        ) : (
          <OnboardingForm
            autonomousCommunities={
              (autonomousCommunitiesResult.data ?? []) as CatalogOption[]
            }
            educationStages={
              (educationStagesResult.data ?? []) as CatalogOption[]
            }
            profile={profileResult.data as UserOppositionProfile | null}
            specialties={(specialtiesResult.data ?? []) as CatalogOption[]}
          />
        )}
      </Card>
    </div>
  );
}
