import { PageHeader } from "@/components/ui/PageHeader";
import { TopicsClient, type TopicItem } from "@/components/topics/topics-client";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type MasteryLevel = "low" | "medium" | "high";

type PriorityLevel = "low" | "medium" | "high";

const defaultMasteryLevel: MasteryLevel = "low";
const defaultPriorityLevel: PriorityLevel = "low";

type UserOppositionProfile = {
  specialty_id: string | null;
  onboarding_completed: boolean | null;
};

type BaseTopic = {
  id: string;
  topic_number: number | null;
  title: string;
  description: string | null;
};

type UserTopic = {
  id: string;
  base_topic_id: string;
  is_selected: boolean | null;
  summary_done: boolean | null;
  studied_done: boolean | null;
  review_count: number | null;
  simulation_count: number | null;
  priority_level: PriorityLevel | null;
  mastery_level: MasteryLevel | null;
  personal_notes: string | null;
};

function normalizeMasteryLevel(value: MasteryLevel | string | null | undefined): MasteryLevel {
  return value === "medium" || value === "high" ? value : defaultMasteryLevel;
}

function normalizePriorityLevel(value: PriorityLevel | string | null | undefined): PriorityLevel {
  return value === "medium" || value === "high" ? value : defaultPriorityLevel;
}

function getLoadError(errors: Array<{ message: string } | null>) {
  const error = errors.find(Boolean);

  if (!error) {
    return null;
  }

  return `No se pudieron cargar los temas: ${error.message}`;
}

export default async function TemasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profileResult = await supabase
    .from("user_opposition_profiles")
    .select("specialty_id, onboarding_completed")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profileResult.error) {
    throw new Error("No se pudo cargar tu perfil.");
  }

  const profile = profileResult.data as UserOppositionProfile | null;

  if (!profile || profile.onboarding_completed === false) {
    redirect("/onboarding");
  }

  if (!profile.specialty_id) {
    redirect("/onboarding");
  }

  const baseTopicsResult = await supabase
    .from("base_topics")
    .select("id, topic_number, title, description")
    .eq("specialty_id", profile.specialty_id)
    .eq("is_active", true)
    .order("topic_number", { ascending: true });
  const baseTopics = (baseTopicsResult.data ?? []) as BaseTopic[];
  const topicIds = baseTopics.map((topic) => topic.id);
  const userTopicsQuery = supabase
    .from("user_topics")
    .select(
      [
        "id",
        "base_topic_id",
        "is_selected",
        "summary_done",
        "studied_done",
        "review_count",
        "simulation_count",
        "priority_level",
        "mastery_level",
        "personal_notes",
      ].join(", "),
    )
    .eq("user_id", user.id);
  const userTopicsResult =
    topicIds.length > 0
      ? await userTopicsQuery.in("base_topic_id", topicIds)
      : { data: [], error: null };
  const userTopics = (userTopicsResult.data ?? []) as unknown as UserTopic[];
  const userTopicsByBaseId = new Map(
    userTopics.map((topic) => [topic.base_topic_id, topic]),
  );
  const topics: TopicItem[] = baseTopics.map((topic) => {
    const progress = userTopicsByBaseId.get(topic.id);

    return {
      id: progress?.id ?? null,
      baseTopicId: topic.id,
      topicNumber: topic.topic_number,
      title: topic.title,
      description: topic.description,
      isSelected: progress?.is_selected ?? false,
      summaryDone: progress?.summary_done ?? false,
      studiedDone: progress?.studied_done ?? false,
      reviewCount: progress?.review_count ?? 0,
      simulationCount: progress?.simulation_count ?? 0,
      priorityLevel: normalizePriorityLevel(progress?.priority_level),
      masteryLevel: normalizeMasteryLevel(progress?.mastery_level),
      personalNotes: progress?.personal_notes ?? "",
    };
  });
  const loadError = getLoadError([
    profileResult.error,
    baseTopicsResult.error,
    userTopicsResult.error,
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        description="Selecciona los temas de tu especialidad y actualiza tu progreso personal."
        title="Mis temas"
      />

      {loadError ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {loadError}
        </p>
      ) : null}

      <TopicsClient initialTopics={topics} userId={user.id} />
    </div>
  );
}




