"use client";

import { useActionState } from "react";
import { generatePlanAction, type PlanActionState } from "@/app/plan/actions";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

type GeneratePlanCardProps = {
  /** True when an automatic plan already has sessions ahead. */
  hasPlan: boolean;
};

const initialState: PlanActionState = { error: "", summary: null };

function formatDate(dateKey: string | null) {
  if (!dateKey) return "";
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long" }).format(
    new Date(year, month - 1, day),
  );
}

export function GeneratePlanCard({ hasPlan }: GeneratePlanCardProps) {
  const [state, formAction, pending] = useActionState(generatePlanAction, initialState);
  const summary = state.summary;
  const planExists = hasPlan || summary !== null;

  return (
    <section className="edge p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-boli text-white shadow-[0_4px_0_var(--color-boli-edge)]">
          <Icon name="target" size={26} />
        </span>
        <div className="min-w-0 flex-1 basis-56">
          <h2 className="text-xl font-extrabold text-slate-950">
            {planExists ? "Tu plan de estudio" : "Deja que OpoLab te haga el plan"}
          </h2>
          <p className="mt-1 text-[15px] leading-6 text-slate-600">
            {planExists
              ? "Recalcúlalo cuando cambies de temas, de horario o te retrases. Solo se sustituyen las sesiones automáticas pendientes."
              : "Reparte tus temas hasta el examen según tus horas, con repasos a los 3, 7, 14 y 30 días, un práctico por semana y simulacros."}
          </p>
        </div>
        <form action={formAction}>
          <Button disabled={pending} size="lg" type="submit">
            {pending
              ? "Creando tu plan..."
              : planExists
                ? "Recalcular plan"
                : "Crear mi plan"}
          </Button>
        </form>
      </div>

      {state.error ? (
        <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}

      {summary ? (
        <div className="animate-rise mt-4 space-y-3" role="status">
          <p className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-[15px] leading-6 font-medium text-emerald-900">
            Plan creado: {summary.sessions} sesiones hasta el{" "}
            {formatDate(summary.lastDateKey)}.
            {summary.newTopics > 0
              ? ` ${summary.newTopics} temas nuevos a ${summary.newTopicsPerWeek} por semana; el último lo estudias el ${formatDate(summary.firstPassEndKey)}.`
              : ""}
          </p>
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              ["Temas nuevos", summary.newTopics],
              ["Repasos", summary.reviews],
              ["Prácticos", summary.practicals],
              ["Simulacros", summary.simulations],
            ].map(([label, value]) => (
              <li className="rounded-2xl bg-slate-50 px-3.5 py-3" key={label}>
                <p className="font-display text-2xl leading-tight font-extrabold text-slate-950 tabular-nums">
                  {value}
                </p>
                <p className="text-sm font-medium text-slate-500">{label}</p>
              </li>
            ))}
          </ul>
          {!summary.reachesExam ? (
            <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-[15px] leading-6 font-medium text-amber-900">
              Con tu tiempo actual no da para estudiar todos los temas elegidos y
              repasarlos antes del examen. Harían falta unas{" "}
              {summary.hoursPerWeekNeeded} horas a la semana, o llevar menos temas.
              {summary.topicsLeftForLater > 0
                ? ` Se quedan ${summary.topicsLeftForLater} sin planificar.`
                : ""}
            </p>
          ) : summary.topicsLeftForLater > 0 ? (
            <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-[15px] leading-6 font-medium text-amber-900">
              {summary.topicsLeftForLater} temas quedan para más adelante. Recalcula
              el plan cuando avances.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
