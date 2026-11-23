import Link from "next/link";
import { Ball, ballStateLabels, type BallState } from "@/components/ui/Ball";
import { GeneratePlanCard } from "@/components/plan/GeneratePlanCard";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ProgressBar, ProgressRing } from "@/components/ui/Progress";
import { StatCard } from "@/components/ui/StatCard";
import type { GameSummary } from "@/lib/study/gamification";

export type DashboardBall = {
  id: string;
  number: number | null;
  title: string;
  state: BallState;
};

export type DashboardTask = {
  id: string;
  dateLabel: string;
  isToday: boolean;
  title: string;
  type: string;
  durationLabel: string | null;
};

export type DashboardViewProps = {
  firstName: string | null;
  specialtyName: string;
  communityName: string;
  oppositionDateLabel: string;
  daysRemaining: number | null;
  loadError: string | null;
  game: GameSummary;
  hasPlan: boolean;
  balls: DashboardBall[];
  topics: {
    selected: number;
    summarized: number;
    studied: number;
    reviews: number;
    simulations: number;
  };
  practicals: {
    total: number;
    worked: number;
    mastered: number;
  };
  week: {
    completed: number;
    pending: number;
  };
  upcomingTasks: DashboardTask[];
};

const taskIcons: Record<string, { icon: IconName; label: string; tone: string }> = {
  study_topic: { icon: "balls", label: "Tema", tone: "bg-violet-100 text-violet-700" },
  practical: { icon: "flask", label: "Práctico", tone: "bg-amber-100 text-amber-700" },
  rest: { icon: "moon", label: "Descanso", tone: "bg-slate-100 text-slate-600" },
};

const legend: BallState[] = ["selected", "started", "studied", "mastered"];

function getCountdownMessage(daysRemaining: number | null) {
  if (daysRemaining === null) {
    return "Pon la fecha de tu examen en Ajustes para ver la cuenta atrás.";
  }

  if (daysRemaining === 0) {
    return "Es hoy. Respira, lo llevas trabajado.";
  }

  const weeks = Math.floor(daysRemaining / 7);

  if (weeks >= 2) {
    return `Son ${weeks} semanas. Cada sesión cuenta.`;
  }

  return "Recta final: repasa lo que ya dominas.";
}

export function DashboardView({
  balls,
  communityName,
  daysRemaining,
  firstName,
  game,
  hasPlan,
  loadError,
  oppositionDateLabel,
  practicals,
  specialtyName,
  topics,
  upcomingTasks,
  week,
}: DashboardViewProps) {
  const weekTotal = week.completed + week.pending;
  const weekPercent = weekTotal > 0 ? (week.completed / weekTotal) * 100 : 0;
  const studiedPercent =
    topics.selected > 0 ? (topics.studied / topics.selected) * 100 : 0;

  return (
    <div className="space-y-6">
      {loadError ? (
        <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
          {loadError}
        </p>
      ) : null}

      {/* Countdown */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-boli px-6 py-7 text-white shadow-[0_6px_0_var(--color-boli-edge)] sm:px-9 sm:py-9">
        <div
          aria-hidden
          className="absolute -top-10 -right-8 h-44 w-44 rounded-full bg-white/10"
        />
        <div
          aria-hidden
          className="absolute right-24 -bottom-16 h-36 w-36 rounded-full bg-white/10"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-lg font-bold text-violet-100">
              {firstName ? `Hola, ${firstName}` : "Hola"}
            </p>
            <h1 className="mt-2 flex flex-wrap items-baseline gap-x-3 text-white">
              {daysRemaining === null ? (
                <span className="text-4xl font-extrabold sm:text-5xl">
                  Sin fecha de examen
                </span>
              ) : (
                <>
                  <span className="font-display text-7xl leading-none font-extrabold tabular-nums sm:text-8xl">
                    {daysRemaining}
                  </span>
                  <span className="text-2xl font-extrabold sm:text-3xl">
                    {daysRemaining === 1 ? "día para tu examen" : "días para tu examen"}
                  </span>
                </>
              )}
            </h1>
            <p className="mt-3 max-w-md text-base font-medium text-violet-100">
              {getCountdownMessage(daysRemaining)}
            </p>
            <p className="mt-4 inline-flex flex-wrap items-center gap-x-2 rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-bold">
              <Icon name="calendar" size={16} />
              {oppositionDateLabel}
              <span className="font-medium text-violet-100">
                {specialtyName}, {communityName}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-3xl bg-white px-5 py-4 text-slate-950">
            <ProgressRing size={96} stroke={12} tone="aprobado" value={weekPercent}>
              <span className="font-display text-2xl leading-none font-extrabold tabular-nums">
                {week.completed}
                <span className="text-base text-slate-400">/{weekTotal}</span>
              </span>
            </ProgressRing>
            <div>
              <p className="font-display text-lg leading-tight font-extrabold">
                Esta semana
              </p>
              <p className="mt-0.5 text-sm font-medium text-slate-500">
                {weekTotal === 0
                  ? "Sin sesiones planificadas"
                  : week.pending === 0
                    ? "Semana cumplida"
                    : `Te quedan ${week.pending}`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Streak and level */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr]">
        <div
          className={[
            "edge flex items-center gap-3.5 px-5 py-4",
            game.streak > 0 ? "border-subrayador-edge/60 bg-amber-50" : "",
          ].join(" ")}
        >
          <span
            className={[
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-full",
              game.streak > 0
                ? "bg-subrayador text-slate-900 shadow-[inset_0_-4px_0_var(--color-subrayador-edge)]"
                : "bg-slate-100 text-slate-400",
            ].join(" ")}
          >
            <Icon name="flame" size={30} />
          </span>
          <div>
            <p className="font-display text-3xl leading-none font-extrabold text-slate-950 tabular-nums">
              {game.streak}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              {game.streak === 1 ? "día de racha" : "días de racha"}
            </p>
            <p className="text-xs font-medium text-slate-500">
              {game.streak === 0
                ? "Completa una sesión para empezar"
                : game.studiedToday
                  ? "Hoy ya has estudiado"
                  : "Se mantiene si no paras una semana"}
            </p>
          </div>
        </div>

        <div className="edge min-w-0 px-5 py-4">
          <div className="flex items-center gap-3.5">
            <Ball number={game.level.number} size="lg" state="mastered" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="font-display text-xl font-extrabold text-slate-950">
                  {game.level.name}
                </p>
                <p className="text-sm font-bold text-slate-500 tabular-nums">
                  {game.xpTotal} XP
                </p>
              </div>
              <ProgressBar className="mt-2" tone="aprobado" value={game.levelPercent} />
              <p className="mt-1.5 text-sm font-medium text-slate-500">
                {game.xpToNextLevel === null
                  ? "Has llegado al nivel más alto"
                  : `Te faltan ${game.xpToNextLevel} XP para el nivel ${game.level.number + 1}`}
                {game.xpThisWeek > 0 ? `. Esta semana llevas ${game.xpThisWeek} XP` : ""}
              </p>
            </div>
          </div>
        </div>
      </section>

      {!hasPlan ? <GeneratePlanCard hasPlan={false} /> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_1fr]">
        {/* Temario as balls */}
        <section className="edge min-w-0 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold text-slate-950">Tu bombo</h2>
            <Link className="text-sm font-bold text-violet-700" href="/temas">
              Ver temas
            </Link>
          </div>

          {balls.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-center">
              <p className="font-semibold text-slate-700">
                Tu especialidad todavía no tiene temario cargado.
              </p>
            </div>
          ) : (
            <>
              <ProgressBar
                className="mt-4"
                detail={`${topics.studied} de ${topics.selected}`}
                label={
                  topics.selected === 0
                    ? "Aún no has elegido temas"
                    : "Temas estudiados"
                }
                tone="boli"
                value={studiedPercent}
              />
              <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(2.15rem,1fr))] gap-1.5">
                {balls.map((ball, index) => (
                  <Ball
                    className="animate-drop !h-auto !w-full aspect-square"
                    key={ball.id}
                    number={ball.number ?? ""}
                    size="sm"
                    state={ball.state}
                    style={{ animationDelay: `${Math.min(index * 12, 900)}ms` }}
                    title={`${ball.title} (${ballStateLabels[ball.state]})`}
                  />
                ))}
              </div>
              <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-slate-600">
                {legend.map((state) => (
                  <li className="flex items-center gap-1.5" key={state}>
                    <Ball className="!h-4 !w-4" number="" size="sm" state={state} />
                    {ballStateLabels[state]}
                  </li>
                ))}
              </ul>
              {topics.selected === 0 ? (
                <div className="mt-5">
                  <Button href="/temas">Elegir mis temas</Button>
                </div>
              ) : null}
            </>
          )}
        </section>

        {/* Next sessions */}
        <section className="edge flex min-w-0 flex-col p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold text-slate-950">
              Lo siguiente
            </h2>
            {upcomingTasks.some((task) => task.isToday) ? (
              <Link className="text-sm font-bold text-violet-700" href="/hoy">
                Ir a hoy
              </Link>
            ) : (
              <Link className="text-sm font-bold text-violet-700" href="/calendario">
                Calendario
              </Link>
            )}
          </div>

          {upcomingTasks.length === 0 ? (
            <div className="mt-5 flex flex-1 flex-col items-center justify-center rounded-2xl bg-slate-50 px-5 py-8 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                <Icon name="calendar" size={28} />
              </span>
              <p className="mt-3 font-display text-lg font-extrabold text-slate-950">
                No tienes nada planificado
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Reserva tu próxima sesión y deja de improvisar.
              </p>
              <div className="mt-4">
                <Button href="/calendario">Planificar una sesión</Button>
              </div>
            </div>
          ) : (
            <ul className="mt-4 grid grid-cols-1 gap-2.5">
              {upcomingTasks.map((task, index) => {
                const kind = taskIcons[task.type] ?? {
                  icon: "note" as IconName,
                  label: "Sesión",
                  tone: "bg-slate-100 text-slate-600",
                };

                return (
                  <li
                    className="animate-rise flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white p-3"
                    key={task.id}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <span
                      className={[
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                        kind.tone,
                      ].join(" ")}
                    >
                      <Icon name={kind.icon} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-slate-950">
                        {task.title}
                      </p>
                      <p className="text-sm font-medium text-slate-500">
                        {kind.label}
                        {task.durationLabel ? `, ${task.durationLabel}` : ""}
                      </p>
                    </div>
                    <span
                      className={[
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold",
                        task.isToday
                          ? "bg-subrayador text-slate-900"
                          : "bg-slate-100 text-slate-600",
                      ].join(" ")}
                    >
                      {task.isToday ? "Hoy" : task.dateLabel}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Totals */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Icon name="note" />}
          label="Temas con resumen"
          value={String(topics.summarized)}
        />
        <StatCard
          icon={<Icon name="repeat" />}
          label="Repasos hechos"
          tone="orange"
          value={String(topics.reviews)}
        />
        <StatCard
          icon={<Icon name="target" />}
          label="Simulacros"
          value={String(topics.simulations)}
        />
        <StatCard
          icon={<Icon name="flask" />}
          label="Prácticos dominados"
          tone="green"
          value={`${practicals.mastered}/${practicals.total}`}
        />
      </section>
    </div>
  );
}
