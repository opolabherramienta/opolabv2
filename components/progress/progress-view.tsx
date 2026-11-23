import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ProgressBar, ProgressRing } from "@/components/ui/Progress";

export type ProgressViewProps = {
  loadError: string | null;
  generalPercent: number;
  nextTaskLabel: string | null;
  topics: {
    total: number;
    selected: number;
    summarized: number;
    studied: number;
    reviews: number;
    simulations: number;
    highPriority: number;
    highMastery: number;
  };
  practicals: {
    total: number;
    notStarted: number;
    worked: number;
    mastered: number;
    attempts: number;
  };
  tasks: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
    studyTopic: number;
    practical: number;
    rest: number;
  };
  recommendations: string[];
};

function percent(value: number, total: number) {
  return total > 0 ? (value / total) * 100 : 0;
}

function getHeadline(generalPercent: number) {
  if (generalPercent === 0) return "Todo por empezar";
  if (generalPercent < 25) return "Has arrancado";
  if (generalPercent < 50) return "Vas cogiendo ritmo";
  if (generalPercent < 75) return "Más de medio camino";
  if (generalPercent < 100) return "Recta final";
  return "Lo tienes todo";
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3.5 py-3">
      <dd className="font-display text-2xl leading-tight font-extrabold text-slate-950 tabular-nums">
        {value}
      </dd>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
    </div>
  );
}

function Block({
  children,
  href,
  icon,
  linkLabel,
  title,
  tone,
}: {
  children: React.ReactNode;
  href: string;
  icon: IconName;
  linkLabel: string;
  title: string;
  tone: string;
}) {
  return (
    <section className="edge flex min-w-0 flex-col p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            tone,
          ].join(" ")}
        >
          <Icon name={icon} />
        </span>
        <h2 className="text-xl font-extrabold text-slate-950">{title}</h2>
      </div>
      <div className="mt-5 flex-1 space-y-5">{children}</div>
      <div className="mt-5">
        <Button href={href} size="sm" variant="secondary">
          {linkLabel}
        </Button>
      </div>
    </section>
  );
}

export function ProgressView({
  generalPercent,
  loadError,
  nextTaskLabel,
  practicals,
  recommendations,
  tasks,
  topics,
}: ProgressViewProps) {
  return (
    <div className="space-y-6">
      {loadError ? (
        <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
          {loadError}
        </p>
      ) : null}

      <section className="edge flex flex-wrap items-center gap-6 p-5 sm:gap-9 sm:p-7">
        <ProgressRing size={156} stroke={18} tone="aprobado" value={generalPercent}>
          <span className="font-display text-4xl leading-none font-extrabold text-slate-950 tabular-nums">
            {generalPercent}
            <span className="text-xl text-slate-400">%</span>
          </span>
        </ProgressRing>
        <div className="min-w-0 flex-1 basis-64">
          <h1 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">
            {getHeadline(generalPercent)}
          </h1>
          <p className="mt-2 max-w-xl text-base leading-7 text-slate-600">
            Tu avance junta temas estudiados, resúmenes, prácticos dominados y
            sesiones cumplidas.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3.5 py-1.5 text-sm font-bold text-violet-800">
            <Icon name="clock" size={16} />
            {nextTaskLabel
              ? `Próxima sesión: ${nextTaskLabel}`
              : "Sin sesiones pendientes"}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Block
          href="/temas"
          icon="balls"
          linkLabel="Ir a mis temas"
          title="Temas"
          tone="bg-violet-100 text-violet-700"
        >
          <ProgressBar
            detail={`${topics.studied} de ${topics.selected}`}
            label="Estudiados"
            value={percent(topics.studied, topics.selected)}
          />
          <ProgressBar
            detail={`${topics.summarized} de ${topics.selected}`}
            label="Con resumen"
            tone="subrayador"
            value={percent(topics.summarized, topics.selected)}
          />
          <ProgressBar
            detail={`${topics.highMastery} de ${topics.selected}`}
            label="Dominados"
            tone="aprobado"
            value={percent(topics.highMastery, topics.selected)}
          />
          <dl className="grid grid-cols-2 gap-2.5">
            <Metric label="Repasos" value={topics.reviews} />
            <Metric label="Simulacros" value={topics.simulations} />
          </dl>
        </Block>

        <Block
          href="/practicos"
          icon="flask"
          linkLabel="Ir a mis prácticos"
          title="Prácticos"
          tone="bg-amber-100 text-amber-700"
        >
          <ProgressBar
            detail={`${practicals.mastered} de ${practicals.total}`}
            label="Dominados"
            tone="aprobado"
            value={percent(practicals.mastered, practicals.total)}
          />
          <ProgressBar
            detail={`${practicals.worked + practicals.mastered} de ${practicals.total}`}
            label="Trabajados"
            tone="subrayador"
            value={percent(practicals.worked + practicals.mastered, practicals.total)}
          />
          <dl className="grid grid-cols-2 gap-2.5">
            <Metric label="Sin empezar" value={practicals.notStarted} />
            <Metric label="Intentos" value={practicals.attempts} />
          </dl>
        </Block>

        <Block
          href="/calendario"
          icon="calendar"
          linkLabel="Ir al calendario"
          title="Sesiones"
          tone="bg-emerald-100 text-emerald-700"
        >
          <ProgressBar
            detail={`${tasks.completed} de ${tasks.total}`}
            label="Cumplidas"
            tone="aprobado"
            value={percent(tasks.completed, tasks.total)}
          />
          <dl className="grid grid-cols-2 gap-2.5">
            <Metric label="Pendientes" value={tasks.pending} />
            <Metric label="Canceladas" value={tasks.cancelled} />
            <Metric label="De temas" value={tasks.studyTopic} />
            <Metric label="De prácticos" value={tasks.practical} />
          </dl>
        </Block>
      </div>

      <section className="rounded-[1.375rem] border-2 border-b-[5px] border-subrayador-edge/50 bg-amber-50 p-5 sm:p-6">
        <h2 className="text-xl font-extrabold text-slate-950">
          Tu siguiente paso
        </h2>
        <ul className="mt-3 grid grid-cols-1 gap-2.5">
          {recommendations.map((recommendation) => (
            <li
              className="flex gap-3 text-[15px] leading-6 font-medium text-slate-800"
              key={recommendation}
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-subrayador text-slate-900">
                <Icon name="chevron-right" size={14} />
              </span>
              {recommendation}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
