"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { createClient } from "@/lib/supabase/client";

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
  { value: "worked", label: "En preparación" },
  { value: "mastered", label: "Resuelto" },
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

function getSupabaseErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "No se pudo guardar el práctico.";
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
        throw new Error("Supabase no devolvio el práctico creado.");
      }

      setPracticals((current) => [
        ...current,
        rowToPractical(insertResult.data as unknown as UserPracticalRow),
      ]);
      setNewName("");
      setNewDescription("");
    } catch (saveError) {
      console.error("Error guardando práctico:", saveError);
      console.error("Payload enviado:", payload);
      console.error("User ID:", userId);
      console.error("Practical ID:", null);

      setError(`No se pudo crear el práctico: ${getSupabaseErrorMessage(saveError)}`);
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
        throw new Error("Supabase no devolvio el práctico actualizado.");
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
      console.error("Payload enviado:", payload);
      console.error("User ID:", userId);
      console.error("Practical ID:", practicalId);

      setPracticals(previousPracticals);
      setError(
        `No se pudo guardar el cambio: ${getSupabaseErrorMessage(saveError)}`,
      );
    } finally {
      setSavingIds((current) => {
        const next = new Set(current);
        next.delete(practicalId);
        return next;
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Prácticos disponibles" value={String(stats.available)} />
        <StatCard label="Prácticos trabajados" value={String(stats.worked)} />
        <StatCard
          label="Prácticos resueltos"
          tone="green"
          value={String(stats.mastered)}
        />
        <StatCard label="Intentos totales" value={String(stats.attempts)} />
        <StatCard
          label="Sin empezar"
          tone="orange"
          value={String(stats.notStarted)}
        />
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Card>
        <form
          className="grid gap-4 lg:grid-cols-[1fr_1.5fr_auto]"
          onSubmit={createPractical}
        >
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Nombre
            <input
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              disabled={creating}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Supuesto práctico 1"
              value={newName}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Descripción
            <input
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              disabled={creating}
              onChange={(event) => setNewDescription(event.target.value)}
              placeholder="Contexto, fuente o notas iniciales"
              value={newDescription}
            />
          </label>
          <div className="flex items-end">
            <Button className="w-full" disabled={creating} type="submit">
              {creating ? "Creando..." : "Crear práctico"}
            </Button>
          </div>
        </form>
      </Card>

      {practicals.length === 0 ? (
        <Card>
          <p className="text-sm leading-6 text-slate-600">
            Todavía no tienes prácticos registrados.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {practicals.map((practical) => {
            const isSaving = savingIds.has(practical.id);

            return (
              <Card className="space-y-5" key={practical.id}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <input
                      className="w-full rounded-lg border border-transparent bg-transparent px-0 text-lg font-semibold text-slate-950 outline-none transition-colors focus:border-violet-200 focus:bg-white focus:px-3 focus:py-2 focus:ring-2 focus:ring-violet-100"
                      disabled={isSaving}
                      onBlur={(event) =>
                        updatePractical(practical.id, {
                          name: event.target.value,
                        })
                      }
                      onChange={(event) =>
                        setPracticals((current) =>
                          current.map((currentPractical) =>
                            currentPractical.id === practical.id
                              ? {
                                  ...currentPractical,
                                  name: event.target.value,
                                }
                              : currentPractical,
                          ),
                        )
                      }
                      value={practical.name}
                    />
                    <p className="text-sm font-medium text-slate-500">
                      Estado: {getStatusLabel(practical.status)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-slate-500">
                    {isSaving ? "Guardando..." : "Guardado"}
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <Button
                    disabled={isSaving}
                    onClick={() =>
                      updatePractical(practical.id, {
                        status: "worked",
                      })
                    }
                    variant="secondary"
                  >
                    En preparación
                  </Button>
                  <Button
                    disabled={isSaving}
                    onClick={() =>
                      updatePractical(practical.id, {
                        status: "mastered",
                      })
                    }
                    variant="secondary"
                  >
                    Marcar resuelto
                  </Button>
                  <Button
                    disabled={isSaving}
                    onClick={() =>
                      updatePractical(practical.id, {
                        status:
                          practical.status === "not_started"
                            ? "worked"
                            : practical.status,
                        timesWorked: practical.timesWorked + 1,
                      })
                    }
                    variant="secondary"
                  >
                    +1 intento ({practical.timesWorked})
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Estado
                    <select
                      className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                      disabled={isSaving}
                      onChange={(event) =>
                        updatePractical(practical.id, {
                          status: normalizePracticalStatus(event.target.value),
                        })
                      }
                      value={practical.status}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Descripción
                    <textarea
                      className="min-h-28 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                      disabled={isSaving}
                      onBlur={(event) =>
                        updatePractical(practical.id, {
                          description: event.target.value,
                        })
                      }
                      onChange={(event) =>
                        setPracticals((current) =>
                          current.map((currentPractical) =>
                            currentPractical.id === practical.id
                              ? {
                                  ...currentPractical,
                                  description: event.target.value,
                                }
                              : currentPractical,
                          ),
                        )
                      }
                      placeholder="Añade contexto o notas para este práctico."
                      value={practical.description}
                    />
                  </label>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
