import type { createClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

export type CatalogOption = {
  id: string;
  name: string;
};

export type UserOppositionProfile = {
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

// Catalogs and the user's own study profile, shared by onboarding and settings.
export async function loadOnboardingData(supabase: ServerClient, userId: string) {
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
      .eq("user_id", userId)
      .maybeSingle(),
  ]);
  const error = [
    educationStagesResult.error,
    specialtiesResult.error,
    autonomousCommunitiesResult.error,
    profileResult.error,
  ].find(Boolean);

  return {
    autonomousCommunities: (autonomousCommunitiesResult.data ??
      []) as CatalogOption[],
    educationStages: (educationStagesResult.data ?? []) as CatalogOption[],
    errorMessage: error?.message ?? null,
    profile: profileResult.data as unknown as UserOppositionProfile | null,
    specialties: (specialtiesResult.data ?? []) as CatalogOption[],
  };
}
