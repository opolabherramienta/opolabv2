import {
  DashboardView,
  type DashboardBall,
  type DashboardTask,
} from "@/components/dashboard/dashboard-view";
import { getTopicBallState } from "@/components/ui/Ball";
import { summarizeGame } from "@/lib/study/gamification";
import { loadCalendarTasks } from "@/lib/study/load";
import { madridDateKey } from "@/lib/study/sessions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type CatalogOption = {
  id: string;
  name: string;
};

type Profile = {
  full_name: string | null;
};

type UserOppositionProfile = {
  specialty_id: string | null;
  autonomous_community_id: string | null;
  opposition_date: string | null;
  onboarding_completed: boolean | null;
};

type BaseTopic = {
  id: string;
  topic_number: number | null;
  title: string;
};

type UserTopic = {
  base_topic_id: string;
  is_selected: boolean | null;
  summary_done: boolean | null;
  studied_done: boolean | null;
  review_count: number | null;
  simulation_count: number | null;
  mastery_level: string | null;
};

type UserPractical = {
  status: string | null;
  times_worked: number | null;
};

type CalendarTask = {
  id: string;
  title: string | null;
  task_date: string | null;
  task_type: string | null;
  status: string | null;
  completed_at: string | null;
  is_auto_generated: boolean | null;
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function dateFromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function normalizeDateKey(value: string | null) {
  return value ? value.slice(0, 10) : null;
}

// Monday to Sunday of the current week, as date keys.
function getWeekKeys(today: Date) {
  const start = new Date(today);
  start.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return { start: toDateKey(start), end: toDateKey(end) };
}

function calculateDaysRemaining(dateKey: string | null, today: Date) {
  if (!dateKey) {
    return null;
  }

  const diff = dateFromKey(dateKey).getTime() - today.getTime();

  return Math.max(0, Math.round(diff / 86400000));
}

function formatLongDate(dateKey: string | null) {
  if (!dateKey) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateFromKey(dateKey));
}

function formatShortDate(dateKey: string) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(dateFromKey(dateKey));
}

function findName(options: CatalogOption[], id: string | null) {
  return options.find((option) => option.id === id)?.name ?? "Sin configurar";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const oppositionProfileResult = await supabase
    .from("user_opposition_profiles")
    .select(
      "specialty_id, autonomous_community_id, opposition_date, onboarding_completed",
    )
    .eq("user_id", user.id)
    .maybeSingle();
  const oppositionProfile =
    oppositionProfileResult.data as UserOppositionProfile | null;

  if (
    !oppositionProfileResult.error &&
    (!oppositionProfile || oppositionProfile.onboarding_completed === false)
  ) {
    redirect("/onboarding");
  }

  const specialtyId = oppositionProfile?.specialty_id ?? null;
  const [
    profileResult,
    specialtiesResult,
    autonomousCommunitiesResult,
    baseTopicsResult,
    topicsResult,
    practicalsResult,
    tasksResult,
  ] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("specialties").select("id, name"),
    supabase.from("autonomous_communities").select("id, name"),
    specialtyId
      ? supabase
          .from("base_topics")
          .select("id, topic_number, title")
          .eq("specialty_id", specialtyId)
          .eq("is_active", true)
          .order("topic_number", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("user_topics")
      .select(
        "base_topic_id, is_selected, summary_done, studied_done, review_count, simulation_count, mastery_level",
      )
      .eq("user_id", user.id),
    supabase
      .from("user_practicals")
      .select("status, times_worked")
      .eq("user_id", user.id),
    loadCalendarTasks<CalendarTask>(
      supabase,
      user.id,
      "id, title, task_date, task_type, status, completed_at, is_auto_generated",
    ),
  ]);

  const firstError = [
    oppositionProfileResult.error,
    profileResult.error,
    specialtiesResult.error,
    autonomousCommunitiesResult.error,
    baseTopicsResult.error,
    topicsResult.error,
    practicalsResult.error,
    tasksResult.error,
  ].find(Boolean);

  const profile = profileResult.data as Profile | null;
  const baseTopics = (baseTopicsResult.data ?? []) as BaseTopic[];
  const userTopics = (topicsResult.data ?? []) as UserTopic[];
  const practicals = (practicalsResult.data ?? []) as UserPractical[];
  const tasks = tasksResult.data ?? [];

  const todayKey = madridDateKey();
  const today = dateFromKey(todayKey);
  const week = getWeekKeys(today);

  // Only topics of the current specialty count.
  const userTopicsByBaseId = new Map(
    userTopics.map((topic) => [topic.base_topic_id, topic]),
  );
  const currentTopics = baseTopics
    .map((topic) => userTopicsByBaseId.get(topic.id))
    .filter((topic): topic is UserTopic => Boolean(topic));
  const selectedTopics = currentTopics.filter((topic) => topic.is_selected);

  const balls: DashboardBall[] = baseTopics.map((topic) => {
    const progress = userTopicsByBaseId.get(topic.id);

    return {
      id: topic.id,
      number: topic.topic_number,
      title: topic.title,
      state: getTopicBallState({
        isSelected: progress?.is_selected ?? false,
        summaryDone: progress?.summary_done ?? false,
        studiedDone: progress?.studied_done ?? false,
        reviewCount: progress?.review_count ?? 0,
        masteryLevel: progress?.mastery_level ?? "low",
      }),
    };
  });

  const activeTasks = tasks.filter((task) => task.status !== "cancelled");
  const weekTasks = activeTasks.filter((task) => {
    const key = normalizeDateKey(task.task_date);

    return key !== null && key >= week.start && key <= week.end;
  });
  const upcomingTasks: DashboardTask[] = activeTasks
    .filter((task) => {
      const key = normalizeDateKey(task.task_date);

      return task.status !== "completed" && key !== null && key >= todayKey;
    })
    .sort((a, b) => (a.task_date ?? "").localeCompare(b.task_date ?? ""))
    .slice(0, 5)
    .map((task) => {
      const key = normalizeDateKey(task.task_date) as string;

      return {
        id: task.id,
        dateLabel: formatShortDate(key),
        isToday: key === todayKey,
        title: task.title?.trim() || "Sesión sin título",
        type: task.task_type ?? "study_topic",
        durationLabel: null,
      };
    });

  const oppositionDateKey = normalizeDateKey(
    oppositionProfile?.opposition_date ?? null,
  );

  return (
    <DashboardView
      balls={balls}
      communityName={findName(
        (autonomousCommunitiesResult.data ?? []) as CatalogOption[],
        oppositionProfile?.autonomous_community_id ?? null,
      )}
      daysRemaining={calculateDaysRemaining(oppositionDateKey, today)}
      firstName={profile?.full_name?.trim().split(/\s+/)[0] || null}
      game={summarizeGame(
        tasks.map((task) => ({
          taskType: task.task_type,
          title: task.title,
          status: task.status,
          completedAt: task.completed_at,
          taskDate: task.task_date,
        })),
        todayKey,
      )}
      hasPlan={tasks.some(
        (task) =>
          task.is_auto_generated === true &&
          task.status === "pending" &&
          (normalizeDateKey(task.task_date) ?? "") >= todayKey,
      )}
      loadError={
        firstError
          ? `No se pudieron cargar tus datos: ${firstError.message}`
          : null
      }
      oppositionDateLabel={formatLongDate(oppositionDateKey)}
      practicals={{
        total: practicals.length,
        worked: practicals.filter((practical) => (practical.times_worked ?? 0) > 0)
          .length,
        mastered: practicals.filter((practical) => practical.status === "mastered")
          .length,
      }}
      specialtyName={findName(
        (specialtiesResult.data ?? []) as CatalogOption[],
        specialtyId,
      )}
      topics={{
        selected: selectedTopics.length,
        summarized: selectedTopics.filter((topic) => topic.summary_done).length,
        studied: selectedTopics.filter((topic) => topic.studied_done).length,
        reviews: currentTopics.reduce(
          (total, topic) => total + (topic.review_count ?? 0),
          0,
        ),
        simulations: currentTopics.reduce(
          (total, topic) => total + (topic.simulation_count ?? 0),
          0,
        ),
      }}
      upcomingTasks={upcomingTasks}
      week={{
        completed: weekTasks.filter((task) => task.status === "completed").length,
        pending: weekTasks.filter((task) => task.status !== "completed").length,
      }}
    />
  );
}
