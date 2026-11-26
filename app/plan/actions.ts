"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  generateStudyPlan,
  type PlanBusySlot,
  type PlanPractical,
  type PlanSummary,
  type PlanTopic,
} from "@/lib/study/planner";
import { loadCalendarTasks } from "@/lib/study/load";
import { replacePlan } from "@/lib/study/replace-plan";
import { getSessionKind } from "@/lib/study/sessions";
import { createClient } from "@/lib/supabase/server";

export type PlanActionState = {
  error: string;
  summary: PlanSummary | null;
};

type Level = "low" | "medium" | "high";

function asLevel(value: unknown): Level {
  return value === "medium" || value === "high" ? value : "low";
}

// The exam calendar is Spanish: "today" is the date in mainland Spain,
// whatever the server clock says.
function getMadridKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(date);
}

function getTodayKey() {
  return getMadridKey(new Date());
}

type KeptSession = {
  id: string;
  title: string | null;
  task_type: string | null;
  task_date: string | null;
  status: string | null;
  completed_at: string | null;
  user_topic_id: string | null;
  estimated_duration_minutes: number | null;
  is_auto_generated: boolean | null;
};

function completedOnKey(session: KeptSession) {
  const completedAt = session.completed_at ? new Date(session.completed_at) : null;

  return completedAt && !Number.isNaN(completedAt.getTime())
    ? getMadridKey(completedAt)
    : (session.task_date ?? "").slice(0, 10);
}

export async function generatePlanAction(
  _prevState: PlanActionState,
  _formData: FormData,
): Promise<PlanActionState> {
  void _formData;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const profileResult = await supabase
    .from("user_opposition_profiles")
    .select(
      "specialty_id, opposition_date, weekly_available_hours, available_days, default_topic_duration_minutes, default_practical_duration_minutes",
    )
    .eq("user_id", user.id)
    .maybeSingle();
  const profile = profileResult.data as {
    specialty_id: string | null;
    opposition_date: string | null;
    weekly_available_hours: number | null;
    available_days: string[] | null;
    default_topic_duration_minutes: number | null;
    default_practical_duration_minutes: number | null;
  } | null;

  if (profileResult.error) {
    return {
      error: `No se pudo leer tu configuración: ${profileResult.error.message}`,
      summary: null,
    };
  }

  if (!profile?.specialty_id) {
    redirect("/onboarding");
  }

  const [baseTopicsResult, userTopicsResult, practicalsResult, sessionsResult] = await Promise.all([
    supabase
      .from("base_topics")
      .select("id, topic_number, title")
      .eq("specialty_id", profile.specialty_id)
      .eq("is_active", true),
    supabase
      .from("user_topics")
      .select(
        "id, base_topic_id, is_selected, studied_done, priority_level, mastery_level, simulation_count",
      )
      .eq("user_id", user.id),
    supabase
      .from("user_practicals")
      .select("id, name, status, times_worked, last_worked_date")
      .eq("user_id", user.id),
    loadCalendarTasks<KeptSession>(
      supabase,
      user.id,
      "id, title, task_type, task_date, status, completed_at, user_topic_id, estimated_duration_minutes, is_auto_generated",
    ),
  ]);
  const loadError =
    baseTopicsResult.error ??
    userTopicsResult.error ??
    practicalsResult.error ??
    sessionsResult.error;

  if (loadError) {
    return {
      error: `No se pudieron leer tus temas y prácticos: ${loadError.message}`,
      summary: null,
    };
  }

  const baseTopics = new Map(
    (
      (baseTopicsResult.data ?? []) as Array<{
        id: string;
        topic_number: number | null;
        title: string;
      }>
    ).map((topic) => [topic.id, topic]),
  );
  const todayKey = getTodayKey();
  const sessions = sessionsResult.data ?? [];

  // When each topic was studied in the calendar and the reviews done since,
  // so a new plan keeps the spaced reviews that are still owed.
  const studiedOn = new Map<string, string>();

  for (const session of sessions) {
    if (
      session.status === "completed" &&
      session.user_topic_id &&
      getSessionKind(session.task_type, session.title) === "study"
    ) {
      const key = completedOnKey(session);

      if (key && key > (studiedOn.get(session.user_topic_id) ?? "")) {
        studiedOn.set(session.user_topic_id, key);
      }
    }
  }

  const reviewsDone = new Map<string, number>();
  // Day of the last completed review of each topic: a late review covers the
  // ones that were due before it, so the plan does not bring them back.
  const lastReviewOn = new Map<string, string>();

  for (const session of sessions) {
    if (
      !session.user_topic_id ||
      session.status !== "completed" ||
      getSessionKind(session.task_type, session.title) !== "review"
    ) {
      continue;
    }

    const key = completedOnKey(session);
    const since = studiedOn.get(session.user_topic_id);

    if (key && key > (lastReviewOn.get(session.user_topic_id) ?? "")) {
      lastReviewOn.set(session.user_topic_id, key);
    }

    if (since && key >= since) {
      reviewsDone.set(session.user_topic_id, (reviewsDone.get(session.user_topic_id) ?? 0) + 1);
    }
  }

  // Everything the new plan will not replace still takes up its day.
  const busy: PlanBusySlot[] = sessions
    .filter(
      (session) =>
        session.task_date !== null &&
        session.task_date.slice(0, 10) >= todayKey &&
        session.task_type !== "rest" &&
        session.status !== "cancelled" &&
        !(session.is_auto_generated === true && session.status === "pending"),
    )
    .map((session) => ({
      dateKey: (session.task_date as string).slice(0, 10),
      minutes: session.estimated_duration_minutes ?? 0,
    }));

  const topics: PlanTopic[] = (
    (userTopicsResult.data ?? []) as Array<{
      id: string;
      base_topic_id: string;
      is_selected: boolean | null;
      studied_done: boolean | null;
      priority_level: string | null;
      mastery_level: string | null;
      simulation_count: number | null;
    }>
  )
    .filter((topic) => topic.is_selected && baseTopics.has(topic.base_topic_id))
    .map((topic) => {
      const base = baseTopics.get(topic.base_topic_id)!;

      return {
        baseTopicId: base.id,
        userTopicId: topic.id,
        number: base.topic_number,
        title: base.title,
        studied: topic.studied_done === true,
        priority: asLevel(topic.priority_level),
        mastery: asLevel(topic.mastery_level),
        studiedOnKey: studiedOn.get(topic.id) ?? null,
        reviewsDone: reviewsDone.get(topic.id) ?? 0,
        lastReviewOnKey: lastReviewOn.get(topic.id) ?? null,
        simulationCount: topic.simulation_count ?? 0,
      };
    });
  const practicals: PlanPractical[] = (
    (practicalsResult.data ?? []) as Array<{
      id: string;
      name: string | null;
      status: string | null;
      times_worked: number | null;
      last_worked_date: string | null;
    }>
  ).map((practical) => ({
    id: practical.id,
    name: practical.name?.trim() || "Práctico",
    lastWorkedOnKey: practical.last_worked_date ? practical.last_worked_date.slice(0, 10) : null,
    timesWorked: practical.times_worked ?? 0,
    status:
      practical.status === "worked" || practical.status === "mastered"
        ? practical.status
        : "not_started",
  }));

  if (topics.length === 0 && practicals.length === 0) {
    return {
      error: "Elige primero los temas que vas a llevar. El plan se construye con ellos.",
      summary: null,
    };
  }

  const plan = generateStudyPlan({
    todayKey,
    examDateKey: profile.opposition_date ? profile.opposition_date.slice(0, 10) : null,
    availableDays: profile.available_days ?? [],
    weeklyHours: profile.weekly_available_hours ?? 10,
    topicMinutes: profile.default_topic_duration_minutes ?? 60,
    practicalMinutes: profile.default_practical_duration_minutes ?? 90,
    topics,
    practicals,
    busy,
  });

  if (plan.summary.reason === "no-days") {
    return {
      error: "No hay días de estudio disponibles. Revisa tus días en Ajustes.",
      summary: null,
    };
  }

  if (plan.summary.reason === "exam-passed") {
    return {
      error: "La fecha de tu examen ya ha pasado. Actualízala en Ajustes.",
      summary: null,
    };
  }

  if (plan.tasks.length === 0) {
    return {
      error: "No queda nada por planificar: todos tus temas están estudiados y dominados.",
      summary: null,
    };
  }

  // Replace only what an earlier plan left pending, overdue sessions included:
  // the new plan schedules that work again. Sessions the user wrote by hand,
  // and anything already completed or cancelled, stay untouched.
  const oldIds = sessions
    .filter((session) => session.is_auto_generated === true && session.status === "pending")
    .map((session) => session.id);

  const rows = plan.tasks.map((task) => ({
    user_id: user.id,
    title: task.title,
    description: task.description,
    task_date: task.task_date,
    task_type: task.task_type,
    estimated_duration_minutes: task.estimated_duration_minutes,
    base_topic_id: task.base_topic_id,
    user_topic_id: task.user_topic_id,
    user_practical_id: task.user_practical_id,
    is_auto_generated: true,
    status: "pending",
  }));

  // The new plan goes in first and the old one leaves afterwards, by id, so
  // a failure half way never empties the calendar.
  const swap = await replacePlan<(typeof rows)[number]>(
    {
      async insert(chunk) {
        const result = await supabase.from("calendar_tasks").insert(chunk).select("id");

        return {
          ids: ((result.data ?? []) as Array<{ id: string }>).map((row) => row.id),
          error: result.error?.message ?? null,
        };
      },
      async remove(ids) {
        const result = await supabase
          .from("calendar_tasks")
          .delete()
          .eq("user_id", user.id)
          .in("id", ids);

        return { error: result.error?.message ?? null };
      },
    },
    oldIds,
    rows,
  );

  if (!swap.ok) {
    // Whatever happened, the calendar has changed or may have: refresh it.
    revalidatePath("/calendario");
    revalidatePath("/dashboard");
    revalidatePath("/hoy");
    revalidatePath("/progreso");

    return {
      error:
        swap.state === "kept-old"
          ? `No se pudo guardar el plan nuevo: ${swap.message}. Tu plan anterior sigue como estaba.`
          : swap.state === "mixed"
            ? `No se pudo guardar el plan nuevo: ${swap.message}. Han quedado sesiones a medias: vuelve a crear el plan para limpiarlas.`
            : `El plan nuevo está guardado, pero no se pudieron quitar sesiones del anterior: ${swap.message}. Vuelve a crear el plan para limpiarlas.`,
      summary: null,
    };
  }

  revalidatePath("/calendario");
  revalidatePath("/dashboard");
  revalidatePath("/hoy");
  revalidatePath("/progreso");

  return { error: "", summary: plan.summary };
}
