import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type AnyRecord = Record<string, unknown>;

type CatalogOption = {
  id: string;
  name: string;
};

type Profile = {
  full_name: string | null;
  email: string | null;
};

type UserOppositionProfile = {
  education_stage_id: string | null;
  specialty_id: string | null;
  autonomous_community_id: string | null;
  opposition_date: string | null;
  weekly_available_hours: number | null;
  onboarding_completed: boolean | null;
};

type UpcomingTask = {
  id: string;
  date: string | null;
  title: string;
  type: string;
  durationMinutes: number | null;
};

function getWeekBounds(referenceDate = new Date()) {
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);

  const day = start.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diffToMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function parseDate(value: unknown) {
  if (typeof value !== "string" || !value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getFirstString(record: AnyRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

function getFirstNumber(record: AnyRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function isDoneTask(record: AnyRecord) {
  if (record.is_completed === true) {
    return true;
  }

  if (typeof record.completed_at === "string" && record.completed_at) {
    return true;
  }

  return record.status === "completed" || record.status === "done";
}

function calculateDaysRemaining(oppositionDate: string | null) {
  const date = parseDate(oppositionDate);

  if (!date) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return Math.max(0, Math.ceil((date.getTime() - today.getTime()) / 86400000));
}

function formatMinutesToHours(minutes: number) {
  return (minutes / 60).toFixed(1);
}

function formatDate(value: string | null) {
  const date = parseDate(value);

  if (!date) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTaskDuration(minutes: number | null) {
  if (!minutes || minutes <= 0) {
    return "Sin duración";
  }

  return `${minutes} min`;
}

function findName(options: CatalogOption[], id: string | null) {
  return options.find((option) => option.id === id)?.name ?? "Sin configurar";
}

function getLoadError(errors: Array<{ message: string } | null>) {
  const error = errors.find(Boolean);

  if (!error) {
    return null;
  }

  return `No se pudieron cargar los datos del dashboard: ${error.message}`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    profileResult,
    oppositionProfileResult,
    educationStagesResult,
    specialtiesResult,
    autonomousCommunitiesResult,
    topicsResult,
    practicalsResult,
    tasksResult,
    studyLogsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .maybeSingle(),
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
    supabase.from("user_topics").select("*").eq("user_id", user.id),
    supabase.from("user_practicals").select("*").eq("user_id", user.id),
    supabase.from("calendar_tasks").select("*").eq("user_id", user.id),
    supabase.from("study_logs").select("*").eq("user_id", user.id),
  ]);

  const oppositionProfile =
    oppositionProfileResult.data as UserOppositionProfile | null;

  if (!oppositionProfile || oppositionProfile.onboarding_completed === false) {
    redirect("/onboarding");
  }

  const loadError = getLoadError([
    profileResult.error,
    oppositionProfileResult.error,
    educationStagesResult.error,
    specialtiesResult.error,
    autonomousCommunitiesResult.error,
    topicsResult.error,
    practicalsResult.error,
    tasksResult.error,
    studyLogsResult.error,
  ]);

  const profile = profileResult.data as Profile | null;
  const educationStages = (educationStagesResult.data ?? []) as CatalogOption[];
  const specialties = (specialtiesResult.data ?? []) as CatalogOption[];
  const autonomousCommunities = (autonomousCommunitiesResult.data ??
    []) as CatalogOption[];
  const topics = (topicsResult.data ?? []) as AnyRecord[];
  const practicals = (practicalsResult.data ?? []) as AnyRecord[];
  const tasks = (tasksResult.data ?? []) as AnyRecord[];
  const studyLogs = (studyLogsResult.data ?? []) as AnyRecord[];
  const { start: weekStart, end: weekEnd } = getWeekBounds();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedTopics = topics.filter((topic) => topic.is_selected === true);
  const summarizedTopics = topics.filter((topic) => topic.summary_done === true);
  const studiedTopics = topics.filter((topic) => topic.studied_done === true);
  const reviewCount = topics.reduce(
    (total, topic) =>
      total + (typeof topic.review_count === "number" ? topic.review_count : 0),
    0,
  );
  const simulationCount = topics.reduce(
    (total, topic) =>
      total +
      (typeof topic.simulation_count === "number"
        ? topic.simulation_count
        : 0),
    0,
  );
  const workedPracticals = practicals.filter(
    (practical) =>
      typeof practical.times_worked === "number" && practical.times_worked > 0,
  );
  const masteredPracticals = practicals.filter(
    (practical) => practical.status === "mastered",
  );
  const tasksThisWeek = tasks.filter((task) => {
    const date = parseDate(
      getFirstString(task, ["task_date", "scheduled_date", "date", "due_date"]),
    );

    return date ? date >= weekStart && date <= weekEnd : false;
  });
  const completedTasksThisWeek = tasksThisWeek.filter(isDoneTask);
  const pendingTasksThisWeek = tasksThisWeek.filter((task) => !isDoneTask(task));
  const upcomingTasks: UpcomingTask[] = tasks
    .map((task, index) => {
      const date = getFirstString(task, [
        "task_date",
        "scheduled_date",
        "date",
        "due_date",
      ]);

      return {
        id: String(task.id ?? index),
        date,
        title:
          getFirstString(task, ["title", "name", "description"]) ??
          "Tarea sin titulo",
        type: getFirstString(task, ["type", "task_type", "category"]) ?? "Tarea",
        durationMinutes: getFirstNumber(task, [
          "duration_minutes",
          "estimated_minutes",
          "minutes",
        ]),
      };
    })
    .filter((task) => {
      const date = parseDate(task.date);

      return date ? date >= today : false;
    })
    .sort((a, b) => {
      const dateA = parseDate(a.date)?.getTime() ?? 0;
      const dateB = parseDate(b.date)?.getTime() ?? 0;

      return dateA - dateB;
    })
    .slice(0, 5);
  const weeklyStudyMinutes = studyLogs.reduce((total, log) => {
    const date = parseDate(
      getFirstString(log, ["log_date", "study_date", "date", "created_at"]),
    );

    if (!date || date < weekStart || date > weekEnd) {
      return total;
    }

    return (
      total +
      (getFirstNumber(log, [
        "minutes_studied",
        "study_minutes",
        "duration_minutes",
        "minutes",
      ]) ?? 0)
    );
  }, 0);
  const daysRemaining = calculateDaysRemaining(
    oppositionProfile.opposition_date,
  );
  const hasNoUpcomingTasks = upcomingTasks.length === 0;

  return (
    <div className="space-y-8">
      <PageHeader
        description="Resumen general de tu preparación."
        title="Dashboard"
      />

      {loadError ? (
        <Card>
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {loadError}
          </p>
        </Card>
      ) : null}

      <Card className="border-violet-200 bg-violet-50">
        <p className="text-sm font-medium uppercase text-violet-700">
          Cuenta atrás
        </p>
        <p className="mt-3 text-3xl font-bold text-slate-950">
          {daysRemaining === null
            ? "Añade tu fecha de oposición para activar la cuenta atras."
            : `Faltan ${daysRemaining} días para tu oposición`}
        </p>
      </Card>

      <Card>
        <div className="flex flex-col gap-1 border-b border-slate-200 pb-5">
          <h2 className="text-lg font-semibold text-slate-950">
            Perfil de preparación
          </h2>
          <p className="text-sm text-slate-500">
            {profile?.full_name ?? profile?.email ?? "Usuario"}
          </p>
        </div>
        <dl className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <dt className="text-sm font-medium text-slate-500">Etapa</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">
              {findName(educationStages, oppositionProfile.education_stage_id)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Especialidad</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">
              {findName(specialties, oppositionProfile.specialty_id)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Comunidad</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">
              {findName(
                autonomousCommunities,
                oppositionProfile.autonomous_community_id,
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">
              Fecha oposición
            </dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">
              {formatDate(oppositionProfile.opposition_date)}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">
              Horas por semana
            </dt>
            <dd className="mt-1 text-sm font-semibold text-slate-900">
              {oppositionProfile.weekly_available_hours ?? "Sin configurar"}
            </dd>
          </div>
        </dl>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Horas estudiadas esta semana"
          tone="green"
          value={formatMinutesToHours(weeklyStudyMinutes)}
        />
        <StatCard
          label="Tareas pendientes"
          tone="orange"
          value={String(pendingTasksThisWeek.length)}
        />
        <StatCard
          label="Tareas completadas"
          tone="green"
          value={String(completedTasksThisWeek.length)}
        />
        <StatCard
          label="Temas seleccionados"
          value={String(selectedTopics.length)}
        />
        <StatCard
          label="Temas resumidos"
          tone="green"
          value={String(summarizedTopics.length)}
        />
        <StatCard
          label="Temas estudiados"
          tone="green"
          value={String(studiedTopics.length)}
        />
        <StatCard
          label="Repasos realizados"
          value={String(reviewCount)}
        />
        <StatCard
          label="Simulacros realizados"
          value={String(simulationCount)}
        />
        <StatCard
          label="Prácticos creados"
          tone="orange"
          value={String(practicals.length)}
        />
        <StatCard
          label="Prácticos trabajados"
          tone="green"
          value={String(workedPracticals.length)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <Card>
          <h2 className="text-lg font-semibold text-slate-950">
            Próximas tareas
          </h2>
          {hasNoUpcomingTasks ? (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Todavía no tienes tareas programadas.
            </p>
          ) : (
            <div className="mt-5 divide-y divide-slate-200">
              {upcomingTasks.map((task) => (
                <div
                  className="grid gap-2 py-4 md:grid-cols-[140px_minmax(0,1fr)_120px_100px] md:items-center"
                  key={task.id}
                >
                  <p className="text-sm font-medium text-slate-500">
                    {formatDate(task.date)}
                  </p>
                  <p className="text-sm font-semibold text-slate-950">
                    {task.title}
                  </p>
                  <p className="text-sm text-slate-600">{task.type}</p>
                  <p className="text-sm text-slate-600">
                    {formatTaskDuration(task.durationMinutes)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-950">
            Recomendaciones básicas
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            {selectedTopics.length === 0 ? (
              <p>
                El siguiente paso será seleccionar los temas que quieres
                trabajar.
              </p>
            ) : null}
            {practicals.length === 0 ? (
              <p>
                Cuando actives el módulo de practicos, podrás añadir tus
                ejercicios personalizados.
              </p>
            ) : null}
            {hasNoUpcomingTasks ? (
              <p>
                Cuando generes tu calendario, aquí aparecerán tus próximas
                tareas.
              </p>
            ) : null}
            {selectedTopics.length > 0 &&
            practicals.length > 0 &&
            !hasNoUpcomingTasks ? (
              <p>Tu dashboard ya tiene actividad real para revisar.</p>
            ) : null}
            <p className="text-xs text-slate-500">
              Prácticos dominados: {masteredPracticals.length}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

