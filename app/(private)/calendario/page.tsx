import { CalendarClient, type CalendarSession } from "@/components/calendar/calendar-client";
import { GeneratePlanCard } from "@/components/plan/GeneratePlanCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type CalendarTaskType = "study_topic" | "practical" | "rest";
type CalendarTaskStatus = "pending" | "completed" | "cancelled";

type UserOppositionProfile = {
  onboarding_completed: boolean | null;
};

type CalendarTask = {
  id: string;
  title: string;
  description: string | null;
  task_date: string | null;
  task_type: CalendarTaskType | null;
  status: CalendarTaskStatus | null;
  completed_at: string | null;
  created_at: string | null;
  user_topic_id: string | null;
  user_practical_id: string | null;
  estimated_duration_minutes: number | null;
  is_auto_generated: boolean | null;
};

const defaultTaskType: CalendarTaskType = "study_topic";
const defaultTaskStatus: CalendarTaskStatus = "pending";

function normalizeTaskType(
  value: CalendarTaskType | string | null | undefined,
): CalendarTaskType {
  if (value === "practical" || value === "rest") {
    return value;
  }

  return defaultTaskType;
}

function normalizeTaskStatus(
  value: CalendarTaskStatus | string | null | undefined,
): CalendarTaskStatus {
  if (value === "completed" || value === "cancelled") {
    return value;
  }

  return defaultTaskStatus;
}

function getLoadError(errors: Array<{ message: string } | null>) {
  const error = errors.find(Boolean);

  if (!error) {
    return null;
  }

  return `No se pudieron cargar las sesiones: ${error.message}`;
}

export default async function CalendarioPage() {
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
  const profile = profileResult.data as UserOppositionProfile | null;

  if (!profile || profile.onboarding_completed === false) {
    redirect("/onboarding");
  }

  const tasksResult = await supabase
    .from("calendar_tasks")
    .select(
      "id, title, description, task_date, task_type, status, completed_at, created_at, user_topic_id, user_practical_id, estimated_duration_minutes, is_auto_generated",
    )
    .eq("user_id", user.id)
    .order("task_date", { ascending: true });
  const tasks = (tasksResult.data ?? []) as CalendarTask[];
  const sessions: CalendarSession[] = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description ?? "",
    taskDate: task.task_date ?? "",
    taskType: normalizeTaskType(task.task_type),
    status: normalizeTaskStatus(task.status),
    completedAt: task.completed_at,
    createdAt: task.created_at,
    userTopicId: task.user_topic_id,
    userPracticalId: task.user_practical_id,
    estimatedMinutes: task.estimated_duration_minutes,
  }));
  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
  }).format(new Date());
  const hasPlan = tasks.some(
    (task) =>
      task.is_auto_generated === true &&
      task.status === "pending" &&
      (task.task_date ?? "").slice(0, 10) >= todayKey,
  );
  // A new plan replaces many sessions at once: remount the calendar with them.
  const sessionsVersion = tasks.reduce(
    (latest, task) => (task.created_at && task.created_at > latest ? task.created_at : latest),
    String(tasks.length),
  );
  const loadError = getLoadError([profileResult.error, tasksResult.error]);

  return (
    <div className="space-y-8">
      <PageHeader
        description="Reparte tus sesiones por días y marca lo que vas cumpliendo."
        title="Calendario"
      />

      {loadError ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {loadError}
        </p>
      ) : null}

      <GeneratePlanCard hasPlan={hasPlan} />

      <CalendarClient
        initialSessions={sessions}
        key={`${tasks.length}-${sessionsVersion}`}
        userId={user.id}
      />
    </div>
  );
}
