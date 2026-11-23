import { ProgressView } from "@/components/progress/progress-view";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type PriorityLevel = "low" | "medium" | "high";
type MasteryLevel = "low" | "medium" | "high";
type PracticalStatus = "not_started" | "worked" | "mastered";
type CalendarTaskType = "study_topic" | "practical" | "rest";
type CalendarTaskStatus = "pending" | "completed" | "cancelled";

type UserOppositionProfile = {
  education_stage_id: string | null;
  specialty_id: string | null;
  autonomous_community_id: string | null;
  opposition_date: string | null;
  weekly_available_hours: number | null;
  onboarding_completed: boolean | null;
};

type UserTopic = {
  id: string;
  is_selected: boolean | null;
  summary_done: boolean | null;
  studied_done: boolean | null;
  review_count: number | null;
  simulation_count: number | null;
  priority_level: PriorityLevel | null;
  mastery_level: MasteryLevel | null;
};

type UserPractical = {
  id: string;
  status: PracticalStatus | null;
  times_worked: number | null;
};

type CalendarTask = {
  id: string;
  title: string;
  task_date: string | null;
  task_type: CalendarTaskType | null;
  status: CalendarTaskStatus | null;
};

function getLoadError(errors: Array<{ message: string } | null>) {
  const error = errors.find(Boolean);

  if (!error) {
    return null;
  }

  return `No se pudieron cargar los datos de progreso: ${error.message}`;
}

function safePercent(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function sumNumbers<T>(items: T[], getter: (item: T) => number | null) {
  return items.reduce((total, item) => total + (getter(item) ?? 0), 0);
}

function normalizeDateKey(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value: string | null) {
  const dateKey = normalizeDateKey(value);
  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function buildRecommendations(
  topics: {
    total: number;
    selected: number;
    studied: number;
  },
  practicals: {
    total: number;
    worked: number;
  },
  tasks: {
    total: number;
    pending: number;
  },
) {
  const recommendations: string[] = [];

  if (topics.total === 0 && practicals.total === 0 && tasks.total === 0) {
    recommendations.push(
      "Tu progreso aparecerá aquí cuando empieces a trabajar temas, prácticos y sesiones.",
    );
  }

  if (topics.selected === 0) {
    recommendations.push("Empieza seleccionando los temas que quieres preparar.");
  }

  if (topics.selected > 0 && topics.studied === 0) {
    recommendations.push(
      "Ya tienes temas seleccionados. El siguiente paso es marcar los primeros como estudiados.",
    );
  }

  if (practicals.total > 0 && practicals.worked === 0) {
    recommendations.push("Crea una rutina mínima de prácticos esta semana.");
  }

  if (tasks.pending >= 5) {
    recommendations.push("Revisa tu calendario: tienes varias sesiones pendientes.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Tu progreso ya tiene actividad real en temas, prácticos y calendario.");
  }

  return recommendations;
}

export default async function ProgresoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profileResult, topicsResult, practicalsResult, tasksResult] =
    await Promise.all([
      supabase
        .from("user_opposition_profiles")
        .select(
          [
            "education_stage_id",
            "specialty_id",
            "autonomous_community_id",
            "opposition_date",
            "weekly_available_hours",
            "onboarding_completed",
          ].join(", "),
        )
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("user_topics")
        .select(
          [
            "id",
            "is_selected",
            "summary_done",
            "studied_done",
            "review_count",
            "simulation_count",
            "priority_level",
            "mastery_level",
          ].join(", "),
        )
        .eq("user_id", user.id),
      supabase
        .from("user_practicals")
        .select("id, status, times_worked")
        .eq("user_id", user.id),
      supabase
        .from("calendar_tasks")
        .select("id, title, task_date, task_type, status")
        .eq("user_id", user.id),
    ]);

  const profile = profileResult.data as UserOppositionProfile | null;

  if (!profile || profile.onboarding_completed === false) {
    redirect("/onboarding");
  }

  const topics = (topicsResult.data ?? []) as unknown as UserTopic[];
  const practicals = (practicalsResult.data ?? []) as unknown as UserPractical[];
  const tasks = (tasksResult.data ?? []) as unknown as CalendarTask[];
  const loadError = getLoadError([
    profileResult.error,
    topicsResult.error,
    practicalsResult.error,
    tasksResult.error,
  ]);

  const topicStats = {
    total: topics.length,
    selected: topics.filter((topic) => topic.is_selected === true).length,
    summarized: topics.filter((topic) => topic.summary_done === true).length,
    studied: topics.filter((topic) => topic.studied_done === true).length,
    reviews: sumNumbers(topics, (topic) => topic.review_count),
    simulations: sumNumbers(topics, (topic) => topic.simulation_count),
    highPriority: topics.filter((topic) => topic.priority_level === "high").length,
    highMastery: topics.filter((topic) => topic.mastery_level === "high").length,
  };
  const practicalStats = {
    total: practicals.length,
    notStarted: practicals.filter((practical) => practical.status === "not_started")
      .length,
    worked: practicals.filter((practical) => practical.status === "worked").length,
    mastered: practicals.filter((practical) => practical.status === "mastered")
      .length,
    attempts: sumNumbers(practicals, (practical) => practical.times_worked),
  };
  const taskStats = {
    total: tasks.length,
    pending: tasks.filter((task) => task.status === "pending").length,
    completed: tasks.filter((task) => task.status === "completed").length,
    cancelled: tasks.filter((task) => task.status === "cancelled").length,
    studyTopic: tasks.filter((task) => task.task_type === "study_topic").length,
    practical: tasks.filter((task) => task.task_type === "practical").length,
    rest: tasks.filter((task) => task.task_type === "rest").length,
  };
  const todayKey = getTodayKey();
  const nextPendingTask = tasks
    .filter(
      (task) =>
        task.status === "pending" && normalizeDateKey(task.task_date) >= todayKey,
    )
    .sort((a, b) =>
      normalizeDateKey(a.task_date).localeCompare(normalizeDateKey(b.task_date)),
    )[0];
  const topicStudiedPercent = safePercent(topicStats.studied, topicStats.selected);
  const topicSummaryPercent = safePercent(topicStats.summarized, topicStats.selected);
  const practicalMasteredPercent = safePercent(
    practicalStats.mastered,
    practicalStats.total,
  );
  const completedTasksPercent = safePercent(taskStats.completed, taskStats.total);
  const generalProgressPercent = Math.round(
    (topicStudiedPercent + topicSummaryPercent + practicalMasteredPercent + completedTasksPercent) /
      4,
  );
  const recommendations = buildRecommendations(topicStats, practicalStats, taskStats);

  return (
    <ProgressView
      generalPercent={generalProgressPercent}
      loadError={loadError}
      nextTaskLabel={
        nextPendingTask ? formatDate(nextPendingTask.task_date) : null
      }
      practicals={practicalStats}
      recommendations={recommendations}
      tasks={taskStats}
      topics={topicStats}
    />
  );
}
