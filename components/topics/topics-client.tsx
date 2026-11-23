"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Ball,
  ballStateLabels,
  getTopicBallState,
  type BallState,
} from "@/components/ui/Ball";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfettiBurst, useConfetti } from "@/components/ui/Confetti";
import { Icon } from "@/components/ui/Icon";
import { fieldClasses } from "@/components/ui/Input";
import { Chip, ProgressRing } from "@/components/ui/Progress";

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

  const { burst, fire } = useConfetti();
  const [celebratedId, setCelebratedId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<TopicFilter>("all");

  const filterCounts = useMemo(() => {
    const counts: Record<TopicFilter, number> = {
      all: topics.length,
      selected: 0,
      started: 0,
      studied: 0,
      mastered: 0,
    };

    topics.forEach((topic) => {
      const state = getTopicBallState(topic);

      if (topic.isSelected) counts.selected += 1;
      if (state === "started") counts.started += 1;
      if (state === "studied") counts.studied += 1;
      if (state === "mastered") counts.mastered += 1;
    });

    return counts;
  }, [topics]);

  const visibleTopics = useMemo(
    () => topics.filter((topic) => matchesFilter(topic, filter)),
    [topics, filter],
  );

  function changeTopic(topic: TopicItem, patch: Partial<TopicItem>) {
    if (savingIds.has(topic.baseTopicId)) {
      return;
    }

    const becameStudied = patch.studiedDone === true && !topic.studiedDone;
    const becameMastered =
      patch.masteryLevel === "high" && topic.masteryLevel !== "high";

    if (becameStudied || becameMastered) {
      setCelebratedId(topic.baseTopicId);
      fire();
    }

    void updateTopic(topic.baseTopicId, patch);
  }

  function openFromBombo(topic: TopicItem) {
    if (!matchesFilter(topic, filter)) {
      setFilter("all");
    }

    setOpenId(topic.baseTopicId);
    window.setTimeout(() => {
      document
        .getElementById(`tema-${topic.baseTopicId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  if (topics.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 py-10 text-center">
        <Ball number="?" size="lg" state="selected" />
        <h2 className="text-xl font-extrabold text-slate-950">
          Todavía no hay temario para tu especialidad
        </h2>
        <p className="max-w-md text-sm leading-6 text-slate-600">
          Comprueba en Ajustes que la especialidad es la correcta. Si lo es,
          estamos cargando su temario y aparecerá aquí en cuanto esté listo.
        </p>
        <Button href="/ajustes" variant="secondary">
          Revisar mi especialidad
        </Button>
      </Card>
    );
  }

  const studiedPercent =
    stats.selected > 0 ? (stats.studied / stats.selected) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card className="grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex justify-center">
          <ProgressRing tone="boli" value={studiedPercent}>
            <span className="font-display text-3xl leading-none font-extrabold text-slate-950 tabular-nums">
              {stats.studied}
              <span className="text-lg text-slate-400">/{stats.selected}</span>
            </span>
            <span className="mt-1 text-xs font-semibold text-slate-500">
              estudiados
            </span>
          </ProgressRing>
        </div>
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-950">
              {stats.selected === 0
                ? "Elige los temas que vas a llevar"
                : `Llevas ${stats.selected} de ${topics.length} temas`}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {stats.selected === 0
                ? "Pulsa una bola del bombo y marca «Lo llevo». No hace falta llevarlos todos."
                : "Cada bola cambia de color según lo preparado que tengas el tema."}
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-slate-50 px-2 py-2.5">
              <dt className="text-xs font-semibold text-slate-500">Con resumen</dt>
              <dd className="font-display text-xl font-extrabold text-slate-950 tabular-nums">
                {stats.summarized}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 px-2 py-2.5">
              <dt className="text-xs font-semibold text-slate-500">Repasos</dt>
              <dd className="font-display text-xl font-extrabold text-slate-950 tabular-nums">
                {stats.reviews}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 px-2 py-2.5">
              <dt className="text-xs font-semibold text-slate-500">Simulacros</dt>
              <dd className="font-display text-xl font-extrabold text-slate-950 tabular-nums">
                {stats.simulations}
              </dd>
            </div>
          </dl>
        </div>
      </Card>

      {error ? (
        <p
          className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <Card>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-extrabold text-slate-950">El bombo</h2>
          <p className="text-sm text-slate-500">Pulsa una bola para abrir su tema</p>
        </div>
        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] justify-items-center gap-2">
          {topics.map((topic, index) => {
            const state = getTopicBallState(topic);

            return (
              <button
                aria-label={`${getTopicLabel(topic)}: ${ballStateLabels[state]}`}
                className="animate-drop rounded-full transition-transform hover:-translate-y-0.5 active:scale-90"
                key={topic.baseTopicId}
                onClick={() => openFromBombo(topic)}
                style={{ animationDelay: `${Math.min(index * 12, 900)}ms` }}
                type="button"
              >
                <Ball number={topic.topicNumber ?? index + 1} state={state} />
              </button>
            );
          })}
        </div>
        <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t-2 border-slate-100 pt-4">
          {legendStates.map((state) => (
            <li
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"
              key={state}
            >
              <Ball className="!h-5 !w-5" number="" size="sm" state={state} />
              {ballStateLabels[state]}
            </li>
          ))}
        </ul>
      </Card>

      <div
        aria-label="Filtrar temas"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        role="group"
      >
        {filterOptions.map((option) => {
          const isActive = filter === option.value;

          return (
            <button
              aria-pressed={isActive}
              className={[
                "flex h-11 shrink-0 items-center gap-2 rounded-full border-2 px-4 text-sm font-bold transition-colors",
                isActive
                  ? "border-boli bg-boli text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
              ].join(" ")}
              key={option.value}
              onClick={() => setFilter(option.value)}
              type="button"
            >
              {option.label}
              <span
                className={[
                  "rounded-full px-1.5 text-xs tabular-nums",
                  isActive ? "bg-white/20" : "bg-slate-100 text-slate-500",
                ].join(" ")}
              >
                {filterCounts[option.value]}
              </span>
            </button>
          );
        })}
      </div>

      {visibleTopics.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="max-w-sm text-sm leading-6 text-slate-600">
            Aún no tienes temas en este grupo. Abre un tema y actualiza cómo lo
            llevas para verlo aquí.
          </p>
          <Button onClick={() => setFilter("all")} variant="secondary">
            Ver todos los temas
          </Button>
        </Card>
      ) : null}

      <ul className="grid grid-cols-1 gap-3">
        {visibleTopics.map((topic) => {
          const isSaving = savingIds.has(topic.baseTopicId);
          const isOpen = openId === topic.baseTopicId;
          const state = getTopicBallState(topic);
          const panelId = `tema-panel-${topic.baseTopicId}`;

          return (
            <li
              className="edge relative scroll-mt-20 overflow-hidden"
              id={`tema-${topic.baseTopicId}`}
              key={topic.baseTopicId}
            >
              {celebratedId === topic.baseTopicId ? (
                <ConfettiBurst burst={burst} />
              ) : null}
              <button
                aria-controls={panelId}
                aria-expanded={isOpen}
                className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                onClick={() => setOpenId(isOpen ? null : topic.baseTopicId)}
                type="button"
              >
                <Ball
                  className="animate-pop"
                  key={state}
                  number={topic.topicNumber ?? "·"}
                  state={state}
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-base leading-snug font-bold text-slate-950">
                    {topic.title}
                  </span>
                  <span className="mt-1.5 flex flex-wrap gap-1.5">
                    <Chip tone={ballChipTone[state]}>{ballStateLabels[state]}</Chip>
                    {topic.priorityLevel === "high" ? (
                      <Chip tone="rojo">Prioridad alta</Chip>
                    ) : null}
                    {topic.reviewCount > 0 ? (
                      <Chip>
                        <Icon name="repeat" size={12} />
                        {topic.reviewCount}
                      </Chip>
                    ) : null}
                    {topic.simulationCount > 0 ? (
                      <Chip>
                        <Icon name="clock" size={12} />
                        {topic.simulationCount}
                      </Chip>
                    ) : null}
                  </span>
                </span>
                <Icon
                  className={[
                    "shrink-0 text-slate-400 transition-transform duration-200",
                    isOpen ? "rotate-180" : "",
                  ].join(" ")}
                  name="chevron-down"
                />
              </button>

              {isOpen ? (
                <div
                  className="animate-rise space-y-5 border-t-2 border-slate-100 px-4 pt-4 pb-5"
                  id={panelId}
                >
                  {topic.description ? (
                    <p className="text-sm leading-6 text-slate-600">
                      {topic.description}
                    </p>
                  ) : null}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <ToggleButton
                      label="Lo llevo"
                      onToggle={() =>
                        changeTopic(topic, { isSelected: !topic.isSelected })
                      }
                      pressed={topic.isSelected}
                      tone="boli"
                    />
                    <ToggleButton
                      label="Resumen hecho"
                      onToggle={() =>
                        changeTopic(topic, { summaryDone: !topic.summaryDone })
                      }
                      pressed={topic.summaryDone}
                      tone="subrayador"
                    />
                    <ToggleButton
                      label="Estudiado"
                      onToggle={() =>
                        changeTopic(topic, { studiedDone: !topic.studiedDone })
                      }
                      pressed={topic.studiedDone}
                      tone="aprobado"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Counter
                      label="Repasos"
                      onChange={(value) => changeTopic(topic, { reviewCount: value })}
                      value={topic.reviewCount}
                    />
                    <Counter
                      label="Simulacros"
                      onChange={(value) =>
                        changeTopic(topic, { simulationCount: value })
                      }
                      value={topic.simulationCount}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Segmented
                      label="Cuánto lo dominas"
                      onChange={(value) =>
                        changeTopic(topic, {
                          masteryLevel: normalizeMasteryLevel(value),
                        })
                      }
                      options={masteryOptions}
                      value={topic.masteryLevel}
                    />
                    <Segmented
                      label="Prioridad"
                      onChange={(value) =>
                        changeTopic(topic, {
                          priorityLevel: normalizePriorityLevel(value),
                        })
                      }
                      options={priorityOptions}
                      value={topic.priorityLevel}
                    />
                  </div>

                  <label className="grid grid-cols-1 gap-2 text-sm font-semibold text-slate-700">
                    Tus notas
                    <textarea
                      className={`${fieldClasses} h-auto min-h-28 py-3`}
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
                      placeholder="Qué te cuesta, qué autores citar, dónde tienes el resumen…"
                      value={topic.personalNotes}
                    />
                  </label>

                  <p
                    aria-live="polite"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500"
                  >
                    {isSaving ? (
                      "Guardando…"
                    ) : (
                      <>
                        <Icon className="text-aprobado" name="check" size={14} />
                        Guardado
                      </>
                    )}
                  </p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type TopicFilter = "all" | "selected" | "started" | "studied" | "mastered";

const filterOptions: Array<{ value: TopicFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "selected", label: "Elegidos" },
  { value: "started", label: "En marcha" },
  { value: "studied", label: "Estudiados" },
  { value: "mastered", label: "Dominados" },
];

const legendStates: BallState[] = [
  "off",
  "selected",
  "started",
  "studied",
  "mastered",
];

const ballChipTone: Record<
  BallState,
  "neutral" | "boli" | "aprobado" | "subrayador"
> = {
  off: "neutral",
  selected: "neutral",
  started: "subrayador",
  studied: "boli",
  mastered: "aprobado",
};

function matchesFilter(topic: TopicItem, filter: TopicFilter) {
  if (filter === "all") return true;
  if (filter === "selected") return topic.isSelected;

  return getTopicBallState(topic) === filter;
}

const toggleToneClasses = {
  boli: "border-boli bg-boli text-white [--press-edge:var(--color-boli-edge)]",
  subrayador:
    "border-subrayador bg-subrayador text-slate-900 [--press-edge:var(--color-subrayador-edge)]",
  aprobado:
    "border-aprobado bg-aprobado text-white [--press-edge:var(--color-aprobado-edge)]",
};

function ToggleButton({
  label,
  onToggle,
  pressed,
  tone,
}: {
  label: string;
  onToggle: () => void;
  pressed: boolean;
  tone: keyof typeof toggleToneClasses;
}) {
  return (
    <button
      aria-pressed={pressed}
      className={[
        "flex h-12 items-center justify-center gap-2 rounded-xl border-2 px-3 text-sm font-bold transition-all duration-100 active:translate-y-0.5",
        pressed
          ? `${toggleToneClasses[tone]} shadow-[0_3px_0_var(--press-edge)]`
          : "border-slate-200 bg-white text-slate-700 shadow-[0_3px_0_var(--color-slate-200)] hover:border-slate-300",
      ].join(" ")}
      onClick={onToggle}
      type="button"
    >
      <span
        className={[
          "flex h-5 w-5 items-center justify-center rounded-full border-2",
          pressed ? "border-current" : "border-slate-300",
        ].join(" ")}
      >
        {pressed ? <Icon name="check" size={12} strokeWidth={3.5} /> : null}
      </span>
      {label}
    </button>
  );
}

function Counter({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  const stepClasses =
    "press flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-xl font-bold text-slate-700 [--press-edge:var(--color-slate-200)]";

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="flex items-center gap-2 pb-1">
        <button
          aria-label={`Quitar uno de ${label.toLowerCase()}`}
          className={stepClasses}
          disabled={value <= 0}
          onClick={() => onChange(Math.max(0, value - 1))}
          type="button"
        >
          −
        </button>
        <span
          aria-live="polite"
          className="animate-pop w-9 text-center font-display text-xl font-extrabold text-slate-950 tabular-nums"
          key={value}
        >
          {value}
        </span>
        <button
          aria-label={`Sumar uno a ${label.toLowerCase()}`}
          className={stepClasses}
          onClick={() => onChange(value + 1)}
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}

function Segmented<T extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  value: T;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-slate-700">{label}</legend>
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <button
              aria-pressed={isActive}
              className={[
                "h-11 rounded-lg text-sm font-bold transition-all",
                isActive
                  ? "bg-white text-violet-700 shadow-[0_2px_0_var(--color-slate-300)]"
                  : "text-slate-500 hover:text-slate-800",
              ].join(" ")}
              key={option.value}
              onClick={() => onChange(option.value)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
