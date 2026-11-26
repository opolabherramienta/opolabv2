import { TodayClient } from "@/components/today/today-client";
import { loadCalendarTasks, needsOnboarding } from "@/lib/study/load";
import { madridDateKey } from "@/lib/study/sessions";
import type { TodaySession } from "@/lib/study/today";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { friendlyError } from "@/lib/errors";

export const dynamic = "force-dynamic";

type CalendarTask = {
  id: string;
  title: string | null;
  description: string | null;
  task_date: string | null;
  task_type: string | null;
  status: string | null;
  completed_at: string | null;
  created_at: string | null;
  user_topic_id: string | null;
  user_practical_id: string | null;
  estimated_duration_minutes: number | null;
  is_auto_generated: boolean | null;
};

export default async function HoyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profileResult = await supabase
    .from("user_opposition_profiles")
    .select("onboarding_completed")
    .eq("user_id", user.id)
    .maybeSingle();
  const profile = profileResult.data as { onboarding_completed: boolean | null } | null;

  if (needsOnboarding({ data: profile, error: profileResult.error })) {
    redirect("/onboarding");
  }

  // Every session is needed: the streak comes from all the completed ones.
  const tasksResult = await loadCalendarTasks<CalendarTask>(
    supabase,
    user.id,
    "id, title, description, task_date, task_type, status, completed_at, created_at, user_topic_id, user_practical_id, estimated_duration_minutes, is_auto_generated",
  );
  const tasks = tasksResult.data ?? [];
  const todayKey = madridDateKey();
  const sessions: TodaySession[] = tasks.map((task) => ({
    id: task.id,
    title: task.title?.trim() ?? "",
    description: task.description?.trim() ?? "",
    taskDate: (task.task_date ?? "").slice(0, 10),
    taskType: task.task_type ?? "study_topic",
    status: task.status ?? "pending",
    completedAt: task.completed_at,
    userTopicId: task.user_topic_id,
    userPracticalId: task.user_practical_id,
    estimatedMinutes: task.estimated_duration_minutes,
  }));
  const hasPlan = tasks.some(
    (task) =>
      task.is_auto_generated === true &&
      task.status === "pending" &&
      (task.task_date ?? "").slice(0, 10) >= todayKey,
  );
  // A recalculated plan replaces many sessions at once: remount with them.
  const sessionsVersion = tasks.reduce(
    (latest, task) =>
      task.created_at && task.created_at > latest ? task.created_at : latest,
    String(tasks.length),
  );
  const loadError = profileResult.error ?? tasksResult.error;

  return (
    <div className="space-y-6">
      {loadError ? (
        <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
          No se pudieron cargar tus sesiones. {friendlyError(loadError)}
        </p>
      ) : null}

      <TodayClient
        hasPlan={hasPlan}
        initialSessions={sessions}
        key={`${tasks.length}-${sessionsVersion}`}
        todayKey={todayKey}
        userId={user.id}
      />
    </div>
  );
}
