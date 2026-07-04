import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
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

type ProgressBarProps = {
  label: string;
  value: number;
  detail: string;
  tone?: "violet" | "green" | "orange";
};

const barToneClasses: Record<NonNullable<ProgressBarProps["tone"]>, string> = {
  violet: "bg-violet-700",
  green: "bg-emerald-600",
  orange: "bg-orange-500",
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

function ProgressBar({ label, value, detail, tone = "violet" }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="font-medium text-slate-700">{label}</p>
        <p className="font-semibold text-slate-950">{value}%</p>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={["h-full rounded-full", barToneClasses[tone]].join(" ")}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <p className="text-xs text-slate-500">{detail}</p>
    </div>
  );
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
    <div className="space-y-8">
      <PageHeader
        description="Consulta tu avance real en temas, prácticos y planificación."
        title="Mi progreso"
      />

      {loadError ? (
        <Card>
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {loadError}
          </p>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Avance general"
          tone="green"
          value={`${generalProgressPercent}%`}
        />
        <StatCard label="Temas estudiados" value={`${topicStats.studied}/${topicStats.selected}`} />
        <StatCard label="Prácticos dominados" value={`${practicalStats.mastered}/${practicalStats.total}`} />
        <StatCard label="Tareas completadas" value={`${taskStats.completed}/${taskStats.total}`} />
        <StatCard
          label="Próxima tarea"
          tone="orange"
          value={nextPendingTask ? formatDate(nextPendingTask.task_date) : "Sin tareas"}
        />
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-950">Resumen general</h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <ProgressBar
            detail={`${topicStats.studied} de ${topicStats.selected} temas seleccionados estudiados`}
            label="Temas estudiados"
            tone="green"
            value={topicStudiedPercent}
          />
          <ProgressBar
            detail={`${topicStats.summarized} de ${topicStats.selected} temas seleccionados con resumen`}
            label="Temas con resumen"
            value={topicSummaryPercent}
          />
          <ProgressBar
            detail={`${practicalStats.mastered} de ${practicalStats.total} prácticos dominados`}
            label="Prácticos dominados"
            tone="orange"
            value={practicalMasteredPercent}
          />
          <ProgressBar
            detail={`${taskStats.completed} de ${taskStats.total} tareas completadas`}
            label="Planificación completada"
            tone="green"
            value={completedTasksPercent}
          />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <h2 className="text-lg font-semibold text-slate-950">Temas</h2>
          {topicStats.total === 0 ? (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Sin temas registrados.
            </p>
          ) : (
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <Metric label="Registrados" value={topicStats.total} />
              <Metric label="Seleccionados" value={topicStats.selected} />
              <Metric label="Con resumen" value={topicStats.summarized} />
              <Metric label="Estudiados" value={topicStats.studied} />
              <Metric label="Repasos" value={topicStats.reviews} />
              <Metric label="Simulacros" value={topicStats.simulations} />
              <Metric label="Prioridad alta" value={topicStats.highPriority} />
              <Metric label="Dominio alto" value={topicStats.highMastery} />
            </dl>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-950">Prácticos</h2>
          {practicalStats.total === 0 ? (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Sin prácticos creados.
            </p>
          ) : (
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <Metric label="Total" value={practicalStats.total} />
              <Metric label="No empezados" value={practicalStats.notStarted} />
              <Metric label="Trabajados" value={practicalStats.worked} />
              <Metric label="Dominados" value={practicalStats.mastered} />
              <Metric label="Intentos totales" value={practicalStats.attempts} />
            </dl>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-950">Calendario</h2>
          {taskStats.total === 0 ? (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Sin tareas de calendario.
            </p>
          ) : (
            <div className="mt-5 space-y-5">
              <dl className="grid gap-4 sm:grid-cols-2">
                <Metric label="Total" value={taskStats.total} />
                <Metric label="Pendientes" value={taskStats.pending} />
                <Metric label="Completadas" value={taskStats.completed} />
                <Metric label="Canceladas" value={taskStats.cancelled} />
                <Metric label="Tipo tema" value={taskStats.studyTopic} />
                <Metric label="Tipo práctico" value={taskStats.practical} />
                <Metric label="Descanso" value={taskStats.rest} />
              </dl>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">Próxima tarea pendiente</p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {nextPendingTask
                    ? `${formatDate(nextPendingTask.task_date)} · ${nextPendingTask.title}`
                    : "No hay tareas pendientes próximas."}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-950">
          Recomendaciones básicas
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
          {recommendations.map((recommendation) => (
            <p key={recommendation}>{recommendation}</p>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-xl font-semibold text-slate-950">{value}</dd>
    </div>
  );
}
