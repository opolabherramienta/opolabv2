"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfettiBurst, useConfetti } from "@/components/ui/Confetti";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Chip, ProgressRing } from "@/components/ui/Progress";
import { getSessionXp, summarizeGame } from "@/lib/study/gamification";
import { syncSessionProgress } from "@/lib/study/progress-sync";
import {
  addDays,
  dateFromKey,
  getSessionKind,
  sessionKindLabels,
  type SessionKind,
} from "@/lib/study/sessions";
import { buildTodayView, formatMinutes, type TodaySession } from "@/lib/study/today";
import { createClient } from "@/lib/supabase/client";

type TodayClientProps = {
  initialSessions: TodaySession[];
  todayKey: string;
  userId: string;
  /** True when an automatic plan has sessions ahead. */
  hasPlan: boolean;
  /** Sample data: changes stay on screen and never reach the network. */
  preview?: boolean;
};

const kindIcons: Record<SessionKind, IconName> = {
  study: "balls",
  review: "repeat",
  simulation: "target",
  practical: "flask",
  rest: "moon",
};

const kindTones: Record<SessionKind, string> = {
  study: "bg-violet-100 text-violet-700",
  review: "bg-sky-100 text-sky-700",
  simulation: "bg-red-100 text-red-700",
  practical: "bg-yellow-100 text-yellow-900",
  rest: "bg-slate-100 text-slate-500",
};

function formatDay(dateKey: string, withWeekday = true) {
  const text = new Intl.DateTimeFormat("es-ES", {
    ...(withWeekday ? { weekday: "long" } : {}),
    day: "numeric",
    month: "long",
  }).format(dateFromKey(dateKey));

  return text.charAt(0).toUpperCase() + text.slice(1);
}

type RowProps = {
  session: TodaySession;
  busy: boolean;
  streak: number;
  /** Extra line under the title, such as the day an overdue session was for. */
  note?: string;
  moveLabel?: string;
  onMove?: () => void;
  onToggle: () => void;
};

function SessionRow({ busy, moveLabel, note, onMove, onToggle, session, streak }: RowProps) {
  const { burst, fire } = useConfetti();
  const [xpPop, setXpPop] = useState<{ id: number; xp: number } | null>(null);
  const xpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kind = getSessionKind(session.taskType, session.title);
  const isCompleted = session.status === "completed";

  function toggle() {
    if (!isCompleted) {
      fire();
      const xp = getSessionXp(session.taskType, session.title, streak);

      if (xp > 0) {
        if (xpTimer.current) clearTimeout(xpTimer.current);
        setXpPop({ id: Date.now(), xp });
        xpTimer.current = setTimeout(() => setXpPop(null), 1500);
      }
    }

    onToggle();
  }

  return (
    <li className="edge animate-rise p-3.5 sm:p-4">
      <div className="flex items-center gap-3">
        <span
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            isCompleted ? "bg-emerald-100 text-aprobado-edge" : kindTones[kind],
          ].join(" ")}
        >
          <Icon name={kindIcons[kind]} />
        </span>

        <div className="min-w-0 flex-1">
          <p
            className={[
              "text-base leading-snug font-bold sm:text-lg",
              isCompleted ? "text-slate-400 line-through" : "text-slate-950",
            ].join(" ")}
          >
            {session.title || "Sesión sin título"}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-slate-500">
            <Chip>{sessionKindLabels[kind]}</Chip>
            {session.estimatedMinutes ? (
              <span className="inline-flex items-center gap-1">
                <Icon name="clock" size={15} />
                {formatMinutes(session.estimatedMinutes)}
              </span>
            ) : null}
            {note ? <span>{note}</span> : null}
            {busy ? <span>Guardando…</span> : null}
          </p>
        </div>

        <span className="relative shrink-0">
          <button
            aria-label={
              isCompleted
                ? `Marcar ${session.title} como pendiente`
                : `Completar ${session.title}`
            }
            aria-pressed={isCompleted}
            className={[
              "flex h-14 w-14 items-center justify-center rounded-full border-2 transition-colors",
              isCompleted
                ? "animate-pop border-aprobado-edge bg-aprobado text-white shadow-[inset_0_-3px_0_var(--color-aprobado-edge)]"
                : "border-slate-300 bg-white text-slate-300 shadow-[0_3px_0_var(--color-slate-300)] hover:border-aprobado hover:text-aprobado active:translate-y-[3px] active:shadow-none",
            ].join(" ")}
            disabled={busy}
            onClick={toggle}
            type="button"
          >
            <Icon name="check" size={28} strokeWidth={3} />
          </button>
          <ConfettiBurst burst={burst} />
          {xpPop ? (
            <span
              className="xp-pop pointer-events-none absolute -top-2 right-0 z-10 rounded-full bg-subrayador px-2.5 py-1 text-sm font-extrabold whitespace-nowrap text-slate-900 shadow-[0_3px_0_var(--color-subrayador-edge)]"
              key={xpPop.id}
              role="status"
            >
              +{xpPop.xp} XP
            </span>
          ) : null}
        </span>
      </div>

      {session.description ? (
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
          {session.description}
        </p>
      ) : null}

      {onMove && moveLabel && !isCompleted ? (
        <div className="mt-2 flex justify-end">
          <button
            className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-violet-700 transition-colors hover:bg-violet-50 disabled:opacity-50"
            disabled={busy}
            onClick={onMove}
            type="button"
          >
            <Icon name="calendar" size={17} />
            {moveLabel}
          </button>
        </div>
      ) : null}
    </li>
  );
}

export function TodayClient({
  hasPlan,
  initialSessions,
  preview = false,
  todayKey,
  userId,
}: TodayClientProps) {
  const supabase = useMemo(() => (preview ? null : createClient()), [preview]);
  const [sessions, setSessions] = useState(initialSessions);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [showAllOverdue, setShowAllOverdue] = useState(false);

  const view = useMemo(() => buildTodayView(sessions, todayKey), [sessions, todayKey]);
  const game = useMemo(
    () =>
      summarizeGame(
        sessions.map((session) => ({
          taskType: session.taskType,
          title: session.title,
          status: session.status,
          completedAt: session.completedAt,
          taskDate: session.taskDate,
        })),
      ),
    [sessions],
  );

  async function save(session: TodaySession, next: TodaySession) {
    const previous = sessions;

    setError("");
    setSessions((current) =>
      current.map((item) => (item.id === session.id ? next : item)),
    );

    if (!supabase) return;

    setBusyIds((current) => new Set(current).add(session.id));

    try {
      const result = await supabase
        .from("calendar_tasks")
        .update({
          status: next.status,
          completed_at: next.completedAt,
          task_date: next.taskDate.slice(0, 10),
        })
        .eq("id", session.id)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle();

      if (result.error || !result.data) {
        throw new Error(result.error?.message ?? "La sesión ya no existe.");
      }
    } catch (saveError) {
      console.error("Error guardando la sesión:", saveError);
      setSessions(previous);
      setError("No se pudo guardar el cambio. Comprueba tu conexión y vuelve a intentarlo.");
      setBusyIds((current) => {
        const copy = new Set(current);
        copy.delete(session.id);
        return copy;
      });
      return;
    }

    if (session.status !== next.status) {
      try {
        await syncSessionProgress(
          supabase,
          userId,
          session,
          next.status === "completed" ? 1 : -1,
        );
      } catch (syncError) {
        console.error("Error actualizando el progreso:", syncError);
        setError(
          "La sesión se ha guardado, pero no se pudo actualizar el progreso del tema o práctico.",
        );
      }
    }

    setBusyIds((current) => {
      const copy = new Set(current);
      copy.delete(session.id);
      return copy;
    });
  }

  function toggle(session: TodaySession) {
    const completing = session.status !== "completed";

    void save(session, {
      ...session,
      status: completing ? "completed" : "pending",
      completedAt: completing ? new Date().toISOString() : null,
    });
  }

  function move(session: TodaySession, dateKey: string) {
    void save(session, { ...session, taskDate: dateKey });
  }

  const pendingToday = view.totalCount - view.doneCount;
  const allDone = view.totalCount > 0 && pendingToday === 0;
  const nothingToday = view.totalCount === 0;
  const percent = view.totalCount > 0 ? (view.doneCount / view.totalCount) * 100 : 0;
  const visibleOverdue = showAllOverdue ? view.overdue : view.overdue.slice(0, 3);
  const tomorrowKey = addDays(todayKey, 1);

  const headline = allDone
    ? "Hoy cumplido"
    : nothingToday
      ? view.rest.length > 0
        ? "Hoy toca descansar"
        : "Hoy no tienes sesiones"
      : pendingToday === 1
        ? "Te queda 1 sesión"
        : `Te quedan ${pendingToday} sesiones`;
  const detail = allDone
    ? game.streak > 1
      ? `Llevas ${game.streak} días de racha. Mañana más.`
      : "Buen trabajo. Mañana más."
    : nothingToday
      ? view.rest.length > 0
        ? "Descansar también es parte del plan."
        : view.overdue.length > 0
          ? "Puedes aprovechar para ponerte al día con lo atrasado."
          : "Día libre en tu plan."
      : view.minutesLeft
        ? `Unos ${formatMinutes(view.minutesLeft)} de estudio.`
        : "Ve de una en una.";

  return (
    <div className="space-y-6">
      <section className="edge flex flex-wrap items-center gap-5 p-5 sm:p-6">
        <ProgressRing size={104} stroke={13} tone="aprobado" value={percent}>
          <span className="font-display text-3xl leading-none font-extrabold text-slate-950 tabular-nums">
            {view.doneCount}
            <span className="text-lg text-slate-400">/{view.totalCount}</span>
          </span>
        </ProgressRing>
        <div className="min-w-0 flex-1 basis-56">
          <p className="text-sm font-bold text-violet-700">{formatDay(todayKey)}</p>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-950 sm:text-4xl">
            {headline}
          </h1>
          <p className="mt-1.5 text-base font-medium text-slate-600">{detail}</p>
        </div>
        <div
          className={[
            "flex items-center gap-2.5 rounded-2xl px-4 py-3",
            game.streak > 0 ? "bg-amber-50" : "bg-slate-50",
          ].join(" ")}
        >
          <span
            className={[
              "flex h-11 w-11 items-center justify-center rounded-full",
              game.streak > 0
                ? "bg-subrayador text-slate-900 shadow-[inset_0_-3px_0_var(--color-subrayador-edge)]"
                : "bg-slate-200 text-slate-400",
            ].join(" ")}
          >
            <Icon name="flame" size={24} />
          </span>
          <div>
            <p className="font-display text-2xl leading-none font-extrabold text-slate-950 tabular-nums">
              {game.streak}
            </p>
            <p className="text-xs font-semibold text-slate-600">
              {game.streak === 1 ? "día de racha" : "días de racha"}
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <p
          className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {view.today.length > 0 ? (
        <ul className="grid grid-cols-1 gap-3">
          {view.today.map((session) => (
            <SessionRow
              busy={busyIds.has(session.id)}
              key={session.id}
              moveLabel="Dejar para mañana"
              onMove={() => move(session, tomorrowKey)}
              onToggle={() => toggle(session)}
              session={session}
              streak={game.streak}
            />
          ))}
        </ul>
      ) : null}

      {view.rest.length > 0 && !nothingToday ? (
        <p className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
          <Icon name="moon" size={18} />
          Hoy también tienes descanso en el plan.
        </p>
      ) : null}

      {nothingToday && view.overdue.length === 0 ? (
        <section className="edge flex flex-col items-center px-5 py-9 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-700">
            <Icon name={view.rest.length > 0 ? "moon" : "calendar"} size={32} />
          </span>
          <p className="mt-4 max-w-sm text-base leading-7 text-slate-600">
            {hasPlan || view.rest.length > 0
              ? "Si te apetece adelantar, añade una sesión en el calendario."
              : "Todavía no tienes plan. Créalo desde Inicio o añade tus sesiones a mano."}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {!hasPlan ? <Button href="/dashboard">Crear mi plan</Button> : null}
            <Button href="/calendario" variant={hasPlan ? "primary" : "secondary"}>
              Abrir el calendario
            </Button>
          </div>
        </section>
      ) : null}

      {view.overdue.length > 0 ? (
        <section>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <h2 className="text-xl font-extrabold text-slate-950">
              Se te ha quedado atrás
            </h2>
            <p className="text-sm font-semibold text-slate-500">
              {view.overdue.length === 1
                ? "1 sesión pendiente"
                : `${view.overdue.length} sesiones pendientes`}
            </p>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Márcala si ya la hiciste o tráela a hoy. Si son muchas, recalcula el
            plan desde el calendario.
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-3">
            {visibleOverdue.map((session) => (
              <SessionRow
                busy={busyIds.has(session.id)}
                key={session.id}
                moveLabel="Hacerla hoy"
                note={`Era del ${formatDay(session.taskDate).toLowerCase()}`}
                onMove={() => move(session, todayKey)}
                onToggle={() => toggle(session)}
                session={session}
                streak={game.streak}
              />
            ))}
          </ul>
          {view.overdue.length > 3 ? (
            <button
              className="mt-3 inline-flex h-10 items-center rounded-xl px-3 text-sm font-bold text-violet-700 hover:bg-violet-50"
              onClick={() => setShowAllOverdue((current) => !current)}
              type="button"
            >
              {showAllOverdue
                ? "Ver menos"
                : `Ver las ${view.overdue.length - 3} restantes`}
            </button>
          ) : null}
        </section>
      ) : null}

      <section className="edge p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-slate-950">Mañana</h2>
          <Link className="text-sm font-bold text-violet-700" href="/calendario">
            Calendario
          </Link>
        </div>
        {view.tomorrow.length === 0 ? (
          <p className="mt-2 text-sm font-medium text-slate-500">
            Nada planificado para mañana.
          </p>
        ) : (
          <ul className="mt-3 grid grid-cols-1 gap-2">
            {view.tomorrow.map((session) => {
              const kind = getSessionKind(session.taskType, session.title);

              return (
                <li className="flex items-center gap-3" key={session.id}>
                  <span
                    className={[
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      kindTones[kind],
                    ].join(" ")}
                  >
                    <Icon name={kindIcons[kind]} size={18} />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-slate-800">
                    {session.title || "Sesión sin título"}
                  </span>
                  {session.estimatedMinutes ? (
                    <span className="shrink-0 text-sm font-medium text-slate-500">
                      {formatMinutes(session.estimatedMinutes)}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
