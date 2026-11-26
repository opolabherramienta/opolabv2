import type { createClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

export type CatalogOption = {
  id: string;
  name: string;
  /** Specialty whose syllabus is not loaded yet. */
  comingSoon?: boolean;
};

/** A specialty with fewer topics than this only has placeholder ones. */
const MIN_TOPICS_TO_OFFER = 20;

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
    topicsResult,
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
    supabase.from("base_topics").select("specialty_id").eq("is_active", true).limit(5000),
  ]);
  const error = [
    educationStagesResult.error,
    specialtiesResult.error,
    autonomousCommunitiesResult.error,
    profileResult.error,
  ].find(Boolean);

  const topicCounts = new Map<string, number>();

  for (const topic of (topicsResult.data ?? []) as Array<{ specialty_id: string | null }>) {
    if (topic.specialty_id) {
      topicCounts.set(topic.specialty_id, (topicCounts.get(topic.specialty_id) ?? 0) + 1);
    }
  }

  return {
    autonomousCommunities: (autonomousCommunitiesResult.data ??
      []) as CatalogOption[],
    educationStages: (educationStagesResult.data ?? []) as CatalogOption[],
    errorMessage: error?.message ?? null,
    profile: profileResult.data as unknown as UserOppositionProfile | null,
    specialties: ((specialtiesResult.data ?? []) as CatalogOption[]).map((specialty) => ({
      ...specialty,
      // If the count could not be read, nothing is hidden.
      comingSoon:
        !topicsResult.error && (topicCounts.get(specialty.id) ?? 0) < MIN_TOPICS_TO_OFFER,
    })),
  };
}
