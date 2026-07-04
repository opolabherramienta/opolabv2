import { CalendarClient, type CalendarSession } from "@/components/calendar/calendar-client";
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
      "id, title, description, task_date, task_type, status, completed_at, created_at",
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
  }));
  const loadError = getLoadError([profileResult.error, tasksResult.error]);

  return (
    <div className="space-y-8">
      <PageHeader
        description="Planifica tus sesiones de estudio, repasos y simulacros."
        title="Mi calendario"
      />

      {loadError ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {loadError}
        </p>
      ) : null}

      <CalendarClient initialSessions={sessions} userId={user.id} />
    </div>
  );
}
