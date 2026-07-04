"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";

export type TopicItem = {
  id: string | null;
  baseTopicId: string;
  topicNumber: number | null;
  title: string;
  description: string | null;
  isSelected: boolean;
  summaryDone: boolean;
  studiedDone: boolean;
  reviewCount: number;
  simulationCount: number;
  priorityLevel: PriorityLevel;
  masteryLevel: MasteryLevel;
  personalNotes: string;
};

type UserTopicRow = {
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

type UserTopicPayload = {
  user_id: string;
  base_topic_id: string;
  is_selected: boolean;
  summary_done: boolean;
  studied_done: boolean;
  review_count: number;
  simulation_count: number;
  priority_level: PriorityLevel;
  mastery_level: MasteryLevel;
  personal_notes: string;
};

type MasteryLevel = "low" | "medium" | "high";

type PriorityLevel = "low" | "medium" | "high";

const defaultMasteryLevel: MasteryLevel = "low";
const defaultPriorityLevel: PriorityLevel = "low";

type TopicsClientProps = {
  initialTopics: TopicItem[];
  userId: string;
};

const priorityOptions: Array<{ value: PriorityLevel; label: string }> = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
];

const masteryOptions: Array<{ value: MasteryLevel; label: string }> = [
  { value: "low", label: "Bajo" },
  { value: "medium", label: "Medio" },
  { value: "high", label: "Alto" },
];

function normalizeMasteryLevel(value: MasteryLevel | string | null | undefined): MasteryLevel {
  return value === "medium" || value === "high" ? value : defaultMasteryLevel;
}

function normalizePriorityLevel(value: PriorityLevel | string | null | undefined): PriorityLevel {
  return value === "medium" || value === "high" ? value : defaultPriorityLevel;
}

function rowToTopic(current: TopicItem, row: UserTopicRow): TopicItem {
  return {
    ...current,
    id: row.id,
    isSelected: row.is_selected ?? false,
    summaryDone: row.summary_done ?? false,
    studiedDone: row.studied_done ?? false,
    reviewCount: row.review_count ?? 0,
    simulationCount: row.simulation_count ?? 0,
    priorityLevel: normalizePriorityLevel(row.priority_level),
    masteryLevel: normalizeMasteryLevel(row.mastery_level),
    personalNotes: row.personal_notes ?? "",
  };
}

function buildPayload(userId: string, topic: TopicItem): UserTopicPayload {
  return {
    user_id: userId,
    base_topic_id: topic.baseTopicId,
    is_selected: topic.isSelected ?? false,
    summary_done: topic.summaryDone ?? false,
    studied_done: topic.studiedDone ?? false,
    review_count: topic.reviewCount ?? 0,
    simulation_count: topic.simulationCount ?? 0,
    priority_level: normalizePriorityLevel(topic.priorityLevel),
    mastery_level: normalizeMasteryLevel(topic.masteryLevel),
    personal_notes: topic.personalNotes ?? "",
  };
}

function getSupabaseErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "No se pudo guardar el tema.";
}

function getTopicLabel(topic: TopicItem) {
  if (topic.topicNumber === null) {
    return topic.title;
  }

  return `Tema ${topic.topicNumber}. ${topic.title}`;
}

export function TopicsClient({ initialTopics, userId }: TopicsClientProps) {
  const supabase = createClient();
  const [topics, setTopics] = useState(initialTopics);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  const stats = useMemo(
    () => ({
      selected: topics.filter((topic) => topic.isSelected).length,
      summarized: topics.filter((topic) => topic.summaryDone).length,
      studied: topics.filter((topic) => topic.studiedDone).length,
      reviews: topics.reduce((total, topic) => total + topic.reviewCount, 0),
      simulations: topics.reduce(
        (total, topic) => total + topic.simulationCount,
        0,
      ),
    }),
    [topics],
  );

  async function persistTopic(nextTopic: TopicItem) {
    const payload = buildPayload(userId, nextTopic);
    const selectColumns = [
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
    ].join(", ");

    if (nextTopic.id) {
      const updateResult = await supabase
        .from("user_topics")
        .update(payload)
        .eq("id", nextTopic.id)
        .select(selectColumns)
        .maybeSingle();

      if (updateResult.error) {
        throw new Error(getSupabaseErrorMessage(updateResult.error));
      }

      if (!updateResult.data) {
        throw new Error("Supabase no devolvio el tema actualizado.");
      }

      return updateResult.data as unknown as UserTopicRow;
    }

    const existingResult = await supabase
      .from("user_topics")
      .select("id")
      .eq("user_id", userId)
      .eq("base_topic_id", nextTopic.baseTopicId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (existingResult.error) {
      throw new Error(getSupabaseErrorMessage(existingResult.error));
    }

    if (existingResult.data?.id) {
      const updateResult = await supabase
        .from("user_topics")
        .update(payload)
        .eq("id", existingResult.data.id)
        .select(selectColumns)
        .maybeSingle();

      if (updateResult.error) {
        throw new Error(getSupabaseErrorMessage(updateResult.error));
      }

      if (!updateResult.data) {
        throw new Error("Supabase no devolvio el tema actualizado.");
      }

      return updateResult.data as unknown as UserTopicRow;
    }

    const insertResult = await supabase
      .from("user_topics")
      .insert(payload)
      .select(selectColumns)
      .maybeSingle();

    if (insertResult.error) {
      throw new Error(getSupabaseErrorMessage(insertResult.error));
    }

    if (!insertResult.data) {
      throw new Error("Supabase no devolvio el tema creado.");
    }

    return insertResult.data as unknown as UserTopicRow;
  }

  async function updateTopic(baseTopicId: string, patch: Partial<TopicItem>) {
    const currentTopic = topics.find((topic) => topic.baseTopicId === baseTopicId);

    if (!currentTopic) {
      return;
    }

    const previousTopics = topics;
    const nextTopic = { ...currentTopic, ...patch };

    setError("");
    setSavingIds((current) => new Set(current).add(baseTopicId));
    setTopics((current) =>
      current.map((topic) =>
        topic.baseTopicId === baseTopicId ? nextTopic : topic,
      ),
    );

    try {
      const savedRow = await persistTopic(nextTopic);
      setTopics((current) =>
        current.map((topic) =>
          topic.baseTopicId === baseTopicId ? rowToTopic(topic, savedRow) : topic,
        ),
      );
    } catch (saveError) {
      const payload = buildPayload(userId, nextTopic);
      const message = getSupabaseErrorMessage(saveError);

      console.error("Error guardando tema:", saveError);
      console.error("Payload enviado:", payload);
      console.error("User ID:", userId);
      console.error("Topic ID:", baseTopicId);

      setTopics(previousTopics);
      setError(`No se pudo guardar el cambio: ${message}`);
    } finally {
      setSavingIds((current) => {
        const next = new Set(current);
        next.delete(baseTopicId);
        return next;
      });
    }
  }

  if (topics.length === 0) {
    return (
      <Card>
        <p className="text-sm leading-6 text-slate-600">
          No hay temas activos para tu especialidad todavía.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Temas disponibles" value={String(topics.length)} />
        <StatCard label="Temas seleccionados" value={String(stats.selected)} />
        <StatCard label="Resumen hecho" tone="green" value={String(stats.summarized)} />
        <StatCard label="Temas estudiados" tone="green" value={String(stats.studied)} />
        <StatCard label="Repasos" value={String(stats.reviews)} />
        <StatCard label="Simulacros" tone="orange" value={String(stats.simulations)} />
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4">
        {topics.map((topic) => {
          const isSaving = savingIds.has(topic.baseTopicId);

          return (
            <Card className="space-y-5" key={topic.baseTopicId}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-slate-950">
                    {getTopicLabel(topic)}
                  </h2>
                  {topic.description ? (
                    <p className="text-sm leading-6 text-slate-600">
                      {topic.description}
                    </p>
                  ) : null}
                </div>
                <p className="text-sm font-medium text-slate-500">
                  {isSaving ? "Guardando..." : "Guardado"}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <label className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
                  <input
                    checked={topic.isSelected}
                    className="h-4 w-4 rounded border-slate-300 text-violet-700 focus:ring-violet-500"
                    disabled={isSaving}
                    onChange={(event) =>
                      updateTopic(topic.baseTopicId, {
                        isSelected: event.target.checked,
                      })
                    }
                    type="checkbox"
                  />
                  Seleccionado
                </label>
                <label className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
                  <input
                    checked={topic.summaryDone}
                    className="h-4 w-4 rounded border-slate-300 text-violet-700 focus:ring-violet-500"
                    disabled={isSaving}
                    onChange={(event) =>
                      updateTopic(topic.baseTopicId, {
                        summaryDone: event.target.checked,
                      })
                    }
                    type="checkbox"
                  />
                  Resumen hecho
                </label>
                <label className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
                  <input
                    checked={topic.studiedDone}
                    className="h-4 w-4 rounded border-slate-300 text-violet-700 focus:ring-violet-500"
                    disabled={isSaving}
                    onChange={(event) =>
                      updateTopic(topic.baseTopicId, {
                        studiedDone: event.target.checked,
                      })
                    }
                    type="checkbox"
                  />
                  Estudiado
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Button
                  disabled={isSaving}
                  onClick={() =>
                    updateTopic(topic.baseTopicId, {
                      reviewCount: topic.reviewCount + 1,
                    })
                  }
                  variant="secondary"
                >
                  +1 repaso ({topic.reviewCount})
                </Button>
                <Button
                  disabled={isSaving}
                  onClick={() =>
                    updateTopic(topic.baseTopicId, {
                      simulationCount: topic.simulationCount + 1,
                    })
                  }
                  variant="secondary"
                >
                  +1 simulacro ({topic.simulationCount})
                </Button>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Prioridad
                  <select
                    className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                    disabled={isSaving}
                    onChange={(event) =>
                      updateTopic(topic.baseTopicId, {
                        priorityLevel: normalizePriorityLevel(event.target.value),
                      })
                    }
                    value={topic.priorityLevel}
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Dominio
                  <select
                    className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                    disabled={isSaving}
                    onChange={(event) =>
                      updateTopic(topic.baseTopicId, {
                        masteryLevel: normalizeMasteryLevel(event.target.value),
                      })
                    }
                    value={topic.masteryLevel}
                  >
                    {masteryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Notas personales
                <textarea
                  className="min-h-28 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  disabled={isSaving}
                  onBlur={(event) =>
                    updateTopic(topic.baseTopicId, {
                      personalNotes: event.target.value,
                    })
                  }
                  onChange={(event) =>
                    setTopics((current) =>
                      current.map((currentTopic) =>
                        currentTopic.baseTopicId === topic.baseTopicId
                          ? {
                              ...currentTopic,
                              personalNotes: event.target.value,
                            }
                          : currentTopic,
                      ),
                    )
                  }
                  placeholder="Añade tus notas de estudio para este tema."
                  value={topic.personalNotes}
                />
              </label>
            </Card>
          );
        })}
      </div>
    </div>
  );
}








