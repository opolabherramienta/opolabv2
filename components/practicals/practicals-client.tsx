"use client";

import { type CSSProperties, type FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfettiBurst, useConfetti } from "@/components/ui/Confetti";
import { Icon } from "@/components/ui/Icon";
import { fieldClasses } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/Progress";
import { StatCard } from "@/components/ui/StatCard";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/errors";

type PracticalStatus = "not_started" | "worked" | "mastered";

export type PracticalItem = {
  id: string;
  name: string;
  description: string;
  status: PracticalStatus;
  timesWorked: number;
  createdAt: string | null;
};

type UserPracticalRow = {
  id: string;
  name: string;
  description: string | null;
  status: PracticalStatus | null;
  times_worked: number | null;
  created_at: string | null;
};

type UserPracticalPayload = {
  user_id: string;
  name: string;
  description: string;
  status: PracticalStatus;
  times_worked: number;
};

type PracticalsClientProps = {
  initialPracticals: PracticalItem[];
  userId: string;
};

const defaultPracticalStatus: PracticalStatus = "not_started";

const statusOptions: Array<{ value: PracticalStatus; label: string }> = [
  { value: "not_started", label: "Sin empezar" },
  { value: "worked", label: "Trabajado" },
  { value: "mastered", label: "Dominado" },
];

function normalizePracticalStatus(
  value: PracticalStatus | string | null | undefined,
): PracticalStatus {
  if (value === "worked" || value === "mastered") {
    return value;
  }

  return defaultPracticalStatus;
}

function rowToPractical(row: UserPracticalRow): PracticalItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    status: normalizePracticalStatus(row.status),
    timesWorked: row.times_worked ?? 0,
    createdAt: row.created_at,
  };
}

function buildPayload(
  userId: string,
  practical: Omit<PracticalItem, "id" | "createdAt">,
): UserPracticalPayload {
  return {
    user_id: userId,
    name: practical.name.trim(),
    description: practical.description.trim(),
    status: normalizePracticalStatus(practical.status),
    times_worked: practical.timesWorked ?? 0,
  };
}

// What to tell the user when a save fails: never the raw text.
function getSupabaseErrorMessage(error: unknown) {
  return friendlyError(error);
}

function getStatusLabel(status: PracticalStatus) {
  return (
    statusOptions.find((option) => option.value === status)?.label ??
    statusOptions[0].label
  );
}

export function PracticalsClient({
  initialPracticals,
  userId,
}: PracticalsClientProps) {
  const supabase = createClient();
  const [practicals, setPracticals] = useState(initialPracticals);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const stats = useMemo(
    () => ({
      available: practicals.length,
      worked: practicals.filter(
        (practical) =>
          practical.status === "worked" ||
          practical.status === "mastered" ||
          practical.timesWorked > 0,
      ).length,
      mastered: practicals.filter((practical) => practical.status === "mastered")
        .length,
      attempts: practicals.reduce(
        (total, practical) => total + practical.timesWorked,
        0,
      ),
      notStarted: practicals.filter(
        (practical) => practical.status === "not_started",
      ).length,
    }),
    [practicals],
  );

  const selectColumns = [
    "id",
    "name",
    "description",
    "status",
    "times_worked",
    "created_at",
  ].join(", ");

  async function createPractical(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const practicalName = newName.trim();

    if (!practicalName) {
      setError("Escribe un nombre para crear el práctico.");
      return;
    }

    const payload = buildPayload(userId, {
      name: practicalName,
      description: newDescription,
      status: "not_started",
      timesWorked: 0,
    });

    setError("");
    setCreating(true);

    try {
      const insertResult = await supabase
        .from("user_practicals")
        .insert(payload)
        .select(selectColumns)
        .maybeSingle();

      if (insertResult.error) {
        throw new Error(getSupabaseErrorMessage(insertResult.error));
      }

      if (!insertResult.data) {
        throw new Error("El servidor no devolvió el práctico creado.");
      }

      setPracticals((current) => [
        ...current,
        rowToPractical(insertResult.data as unknown as UserPracticalRow),
      ]);
      setNewName("");
      setNewDescription("");
      setFormOpen(false);
    } catch (saveError) {
      console.error("Error guardando práctico:", saveError);

      setError(`No se pudo crear el práctico. ${getSupabaseErrorMessage(saveError)}`);
    } finally {
      setCreating(false);
    }
  }

  async function updatePractical(
    practicalId: string,
    patch: Partial<PracticalItem>,
  ) {
    const currentPractical = practicals.find(
      (practical) => practical.id === practicalId,
    );

    if (!currentPractical) {
      return;
    }

    const previousPracticals = practicals;
    const nextPractical = { ...currentPractical, ...patch };
    const payload = buildPayload(userId, nextPractical);

    setError("");
    setSavingIds((current) => new Set(current).add(practicalId));
    setPracticals((current) =>
      current.map((practical) =>
        practical.id === practicalId ? nextPractical : practical,
      ),
    );

    try {
      const updateResult = await supabase
        .from("user_practicals")
        .update(payload)
        .eq("id", practicalId)
        .select(selectColumns)
        .maybeSingle();

      if (updateResult.error) {
        throw new Error(getSupabaseErrorMessage(updateResult.error));
      }

      if (!updateResult.data) {
        throw new Error("El servidor no devolvió el práctico actualizado.");
      }

      setPracticals((current) =>
        current.map((practical) =>
          practical.id === practicalId
            ? rowToPractical(updateResult.data as unknown as UserPracticalRow)
            : practical,
        ),
      );
    } catch (saveError) {
      console.error("Error guardando práctico:", saveError);

      setPracticals(previousPracticals);
      setError(
        `No se pudo guardar el cambio. ${getSupabaseErrorMessage(saveError)}`,
      );
    } finally {
      setSavingIds((current) => {
        const next = new Set(current);
        next.delete(practicalId);
        return next;
      });
    }
  }


  const masteredPercent =
    stats.available > 0 ? (stats.mastered / stats.available) * 100 : 0;

  function patchLocal(practicalId: string, patch: Partial<PracticalItem>) {
    setPracticals((current) =>
      current.map((practical) =>
        practical.id === practicalId ? { ...practical, ...patch } : practical,
      ),
    );
  }

  return (
    <div className="space-y-6">
      {practicals.length > 0 ? (
        <section className="edge p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <div>
              <p className="font-display text-4xl leading-none font-extrabold text-slate-950 tabular-nums">
                {stats.mastered}
                <span className="text-2xl text-slate-400">
                  {" "}
                  de {stats.available}
                </span>
              </p>
              <p className="mt-1.5 text-sm font-semibold text-slate-600">
                {stats.mastered === stats.available
                  ? "Todos tus prácticos están dominados"
                  : "prácticos dominados"}
              </p>
            </div>
            <Button onClick={() => setFormOpen((open) => !open)} size="lg">
              <Icon name="plus" />
              Añadir práctico
            </Button>
          </div>
          <ProgressBar className="mt-5" tone="aprobado" value={masteredPercent} />
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              icon={<Icon name="flask" />}
              label="Trabajados"
              value={String(stats.worked)}
            />
            <StatCard
              icon={<Icon name="repeat" />}
              label="Intentos en total"
              tone="green"
              value={String(stats.attempts)}
            />
            <StatCard
              icon={<Icon name="clock" />}
              label="Sin empezar"
              tone="orange"
              value={String(stats.notStarted)}
            />
          </div>
        </section>
      ) : null}

      {error ? (
        <p
          className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {formOpen || practicals.length === 0 ? (
        <section className="edge animate-rise border-violet-200 p-5 sm:p-6">
          {practicals.length === 0 ? (
            <div className="mb-5 flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                <Icon name="flask" size={30} />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-slate-950">
                  Apunta tu primer práctico
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Un problema de genética, un corte geológico, una clave
                  dicotómica… Cada vez que lo trabajes, suma un intento y verás
                  cuáles tienes ya dominados.
                </p>
              </div>
            </div>
          ) : (
            <h2 className="mb-4 text-lg font-extrabold text-slate-950">
              Nuevo práctico
            </h2>
          )}
          <form className="grid grid-cols-1 gap-4" onSubmit={createPractical}>
            <label className="grid grid-cols-1 gap-2 text-sm font-semibold text-slate-700">
              Nombre
              <input
                autoFocus={practicals.length > 0}
                className={fieldClasses}
                disabled={creating}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Problema de genética: herencia ligada al sexo"
                value={newName}
              />
            </label>
            <label className="grid grid-cols-1 gap-2 text-sm font-semibold text-slate-700">
              Notas (opcional)
              <input
                className={fieldClasses}
                disabled={creating}
                onChange={(event) => setNewDescription(event.target.value)}
                placeholder="De dónde lo has sacado, qué te cuesta…"
                value={newDescription}
              />
            </label>
            <div className="flex flex-wrap gap-3">
              <Button disabled={creating} type="submit">
                {creating ? "Guardando…" : "Guardar práctico"}
              </Button>
              {practicals.length > 0 ? (
                <Button
                  disabled={creating}
                  onClick={() => setFormOpen(false)}
                  variant="ghost"
                >
                  Cancelar
                </Button>
              ) : null}
            </div>
          </form>
        </section>
      ) : null}

      {practicals.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4">
          {practicals.map((practical) => (
            <li key={practical.id}>
              <PracticalCard
                isSaving={savingIds.has(practical.id)}
                onLocalChange={(patch) => patchLocal(practical.id, patch)}
                onUpdate={(patch) => updatePractical(practical.id, patch)}
                practical={practical}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

type PracticalCardProps = {
  isSaving: boolean;
  onLocalChange: (patch: Partial<PracticalItem>) => void;
  onUpdate: (patch: Partial<PracticalItem>) => void;
  practical: PracticalItem;
};

const stepStyles: Record<PracticalStatus, { active: string; edge: string }> = {
  not_started: {
    active: "border-slate-300 bg-slate-100 text-slate-800",
    edge: "var(--color-slate-300)",
  },
  worked: {
    active: "border-subrayador-edge bg-subrayador text-slate-900",
    edge: "var(--color-subrayador-edge)",
  },
  mastered: {
    active: "border-aprobado-edge bg-aprobado text-white",
    edge: "var(--color-aprobado-edge)",
  },
};

function PracticalCard({
  isSaving,
  onLocalChange,
  onUpdate,
  practical,
}: PracticalCardProps) {
  const { burst, fire } = useConfetti();
  const [notesOpen, setNotesOpen] = useState(false);
  const notesId = `practical-notes-${practical.id}`;
  const currentStep = statusOptions.findIndex(
    (option) => option.value === practical.status,
  );
  const isMastered = practical.status === "mastered";

  function chooseStatus(status: PracticalStatus) {
    if (status === practical.status) {
      return;
    }

    if (status === "mastered") {
      fire();
    }

    onUpdate({ status });
  }

  return (
    <article
      className={[
        "edge relative p-4 transition-colors sm:p-5",
        isMastered ? "border-emerald-300 bg-emerald-50/40" : "",
      ].join(" ")}
    >
      <ConfettiBurst burst={burst} />

      <div className="flex items-start gap-3">
        <span
          className={[
            "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            isMastered
              ? "bg-aprobado text-white"
              : practical.status === "worked"
                ? "bg-yellow-100 text-yellow-900"
                : "bg-slate-100 text-slate-500",
          ].join(" ")}
        >
          <Icon name={isMastered ? "check" : "flask"} />
        </span>
        <div className="min-w-0 flex-1">
          <input
            aria-label="Nombre del práctico"
            className="w-full min-w-0 rounded-lg border-transparent bg-transparent py-1.5 font-display text-lg leading-snug font-extrabold text-slate-950 outline-none transition-[padding,background-color,border-color] hover:border-slate-200 focus:border-violet-500 focus:bg-white focus:px-2.5 focus:ring-4 focus:ring-violet-100"
            disabled={isSaving}
            onBlur={(event) => onUpdate({ name: event.target.value })}
            onChange={(event) => onLocalChange({ name: event.target.value })}
            value={practical.name}
          />
          <p
            aria-live="polite"
            className="text-xs font-semibold text-slate-400"
          >
            {isSaving ? "Guardando…" : getStatusLabel(practical.status)}
          </p>
        </div>
      </div>

      <div
        aria-label="Estado del práctico"
        className="mt-4 grid grid-cols-3 gap-2"
        role="group"
      >
        {statusOptions.map((option, index) => {
          const isCurrent = option.value === practical.status;
          const isPassed = index < currentStep;

          return (
            <button
              aria-pressed={isCurrent}
              className={[
                "press flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-1 py-1.5 text-center text-xs leading-tight font-bold sm:flex-row sm:gap-2 sm:text-sm",
                isCurrent
                  ? stepStyles[option.value].active
                  : isPassed
                    ? "border-slate-200 bg-white text-slate-700"
                    : "border-slate-200 bg-white text-slate-400",
              ].join(" ")}
              disabled={isSaving}
              key={option.value}
              onClick={() => chooseStatus(option.value)}
              style={
                {
                  "--press-edge": isCurrent
                    ? stepStyles[option.value].edge
                    : "var(--color-slate-200)",
                } as CSSProperties
              }
              type="button"
            >
              <span
                className={[
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] tabular-nums",
                  isCurrent
                    ? "bg-white/70 text-slate-900"
                    : isPassed
                      ? "bg-slate-200 text-slate-700"
                      : "bg-slate-100 text-slate-400",
                ].join(" ")}
              >
                {isPassed ? <Icon name="check" size={12} /> : index + 1}
              </span>
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-3 sm:p-4">
        <div className="flex items-baseline gap-2">
          <span
            className="inline-block animate-pop font-display text-4xl leading-none font-extrabold text-violet-700 tabular-nums"
            key={practical.timesWorked}
          >
            {practical.timesWorked}
          </span>
          <span className="text-sm font-semibold text-slate-600">
            {practical.timesWorked === 1 ? "intento" : "intentos"}
          </span>
        </div>
        <Button
          disabled={isSaving}
          onClick={() =>
            onUpdate({
              status:
                practical.status === "not_started"
                  ? "worked"
                  : practical.status,
              timesWorked: practical.timesWorked + 1,
            })
          }
        >
          <Icon name="plus" size={18} />
          1 intento
        </Button>
      </div>

      <div className="mt-2">
        <button
          aria-controls={notesId}
          aria-expanded={notesOpen}
          className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-1 text-left text-sm font-bold text-slate-600 transition-colors hover:text-slate-900"
          onClick={() => setNotesOpen((open) => !open)}
          type="button"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Icon className="shrink-0" name="note" size={18} />
            <span className="truncate">
              {notesOpen
                ? "Notas"
                : practical.description.trim()
                  ? practical.description
                  : "Añadir notas"}
            </span>
          </span>
          <Icon
            className={[
              "shrink-0 transition-transform",
              notesOpen ? "rotate-180" : "",
            ].join(" ")}
            name="chevron-down"
            size={18}
          />
        </button>
        {notesOpen ? (
          <textarea
            aria-label="Notas del práctico"
            className="mt-1 min-h-28 w-full animate-rise rounded-xl border-slate-200 bg-white px-3.5 py-3 text-base text-slate-950 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            disabled={isSaving}
            id={notesId}
            onBlur={(event) => onUpdate({ description: event.target.value })}
            onChange={(event) =>
              onLocalChange({ description: event.target.value })
            }
            placeholder="Qué te ha costado, de dónde lo has sacado, qué repasar…"
            value={practical.description}
          />
        ) : null}
      </div>
    </article>
  );
}
