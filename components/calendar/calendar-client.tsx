"use client";

import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { createClient } from "@/lib/supabase/client";

type CalendarTaskType = "study_topic" | "practical" | "rest";
type CalendarTaskStatus = "pending" | "completed" | "cancelled";

export type CalendarSession = {
  id: string;
  title: string;
  description: string;
  taskDate: string;
  taskType: CalendarTaskType;
  status: CalendarTaskStatus;
  completedAt: string | null;
  createdAt: string | null;
};

type CalendarTaskRow = {
  id: string;
  title: string;
  description: string | null;
  task_date: string | null;
  task_type: CalendarTaskType | null;
  status: CalendarTaskStatus | null;
  completed_at: string | null;
  created_at: string | null;
};

type CalendarTaskPayload = {
  user_id: string;
  title: string;
  description: string;
  task_date: string;
  task_type: CalendarTaskType;
  status: CalendarTaskStatus;
  completed_at: string | null;
};

type CalendarClientProps = {
  initialSessions: CalendarSession[];
  userId: string;
};

const defaultTaskType: CalendarTaskType = "study_topic";
const defaultTaskStatus: CalendarTaskStatus = "pending";

const taskTypeOptions: Array<{ value: CalendarTaskType; label: string }> = [
  { value: "study_topic", label: "Tema" },
  { value: "practical", label: "Práctico" },
  { value: "rest", label: "Descanso" },
];

const statusOptions: Array<{ value: CalendarTaskStatus; label: string }> = [
  { value: "pending", label: "Pendiente" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" },
];

function normalizeTaskType(
  value: CalendarTaskType | string | null | undefined,
): CalendarTaskType {
  if (value === "practical" || value === "rest") {
    return value;
  }

  return defaultTaskType;
}

function normalizeTaskStatus(
  value: CalendarTaskStatus | string | null | undefined,
): CalendarTaskStatus {
  if (value === "completed" || value === "cancelled") {
    return value;
  }

  return defaultTaskStatus;
}

function rowToSession(row: CalendarTaskRow): CalendarSession {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    taskDate: row.task_date ?? "",
    taskType: normalizeTaskType(row.task_type),
    status: normalizeTaskStatus(row.status),
    completedAt: row.completed_at,
    createdAt: row.created_at,
  };
}

function buildPayload(
  userId: string,
  session: Omit<CalendarSession, "id" | "createdAt">,
): CalendarTaskPayload {
  const status = normalizeTaskStatus(session.status);

  return {
    user_id: userId,
    title: session.title.trim(),
    description: session.description.trim(),
    task_date: session.taskDate,
    task_type: normalizeTaskType(session.taskType),
    status,
    completed_at:
      status === "completed" ? session.completedAt ?? new Date().toISOString() : null,
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

  return "No se pudo guardar la sesión.";
}

function getTaskTypeLabel(taskType: CalendarTaskType) {
  return (
    taskTypeOptions.find((option) => option.value === taskType)?.label ??
    taskTypeOptions[0].label
  );
}

function getStatusLabel(status: CalendarTaskStatus) {
  return (
    statusOptions.find((option) => option.value === status)?.label ??
    statusOptions[0].label
  );
}

function formatDate(value: string) {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function CalendarClient({ initialSessions, userId }: CalendarClientProps) {
  const supabase = createClient();
  const [sessions, setSessions] = useState(initialSessions);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newTaskDate, setNewTaskDate] = useState(getTodayInputValue());
  const [newTaskType, setNewTaskType] = useState<CalendarTaskType>(defaultTaskType);
  const [newStatus, setNewStatus] = useState<CalendarTaskStatus>(defaultTaskStatus);

  const selectColumns = [
    "id",
    "title",
    "description",
    "task_date",
    "task_type",
    "status",
    "completed_at",
    "created_at",
  ].join(", ");

  const stats = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const nextSession = sessions
      .filter((session) => {
        const date = new Date(session.taskDate);

        return !Number.isNaN(date.getTime()) && date >= now;
      })
      .sort(
        (a, b) =>
          new Date(a.taskDate).getTime() - new Date(b.taskDate).getTime(),
      )[0];

    return {
      total: sessions.length,
      pending: sessions.filter((session) => session.status === "pending").length,
      completed: sessions.filter((session) => session.status === "completed")
        .length,
      cancelled: sessions.filter((session) => session.status === "cancelled")
        .length,
      nextSession: nextSession ? formatDate(nextSession.taskDate) : "Sin sesiones",
    };
  }, [sessions]);

  async function createSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = newTitle.trim();

    if (!title) {
      setError("Escribe un título para crear la sesión.");
      return;
    }

    if (!newTaskDate) {
      setError("Selecciona una fecha para crear la sesión.");
      return;
    }

    const payload = buildPayload(userId, {
      title,
      description: newDescription,
      taskDate: newTaskDate,
      taskType: newTaskType,
      status: newStatus,
      completedAt: newStatus === "completed" ? new Date().toISOString() : null,
    });

    setError("");
    setCreating(true);

    try {
      const insertResult = await supabase
        .from("calendar_tasks")
        .insert(payload)
        .select(selectColumns)
        .maybeSingle();

      if (insertResult.error) {
        throw new Error(getSupabaseErrorMessage(insertResult.error));
      }

      if (!insertResult.data) {
        throw new Error("Supabase no devolvio la sesión creada.");
      }

      setSessions((current) =>
        [...current, rowToSession(insertResult.data as unknown as CalendarTaskRow)].sort(
          (a, b) => a.taskDate.localeCompare(b.taskDate),
        ),
      );
      setNewTitle("");
      setNewDescription("");
      setNewTaskDate(getTodayInputValue());
      setNewTaskType(defaultTaskType);
      setNewStatus(defaultTaskStatus);
    } catch (saveError) {
      console.error("Error guardando sesión:", saveError);
      console.error("Payload enviado:", payload);
      console.error("User ID:", userId);
      console.error("Session ID:", null);

      setError(`No se pudo crear la sesión: ${getSupabaseErrorMessage(saveError)}`);
    } finally {
      setCreating(false);
    }
  }

  async function updateSession(
    sessionId: string,
    patch: Partial<CalendarSession>,
  ) {
    const currentSession = sessions.find((session) => session.id === sessionId);

    if (!currentSession) {
      return;
    }

    const previousSessions = sessions;
    const nextStatus = patch.status ?? currentSession.status;
    const nextSession = {
      ...currentSession,
      ...patch,
      completedAt:
        nextStatus === "completed"
          ? patch.completedAt ?? currentSession.completedAt ?? new Date().toISOString()
          : null,
    };
    const payload = buildPayload(userId, nextSession);

    setError("");
    setSavingIds((current) => new Set(current).add(sessionId));
    setSessions((current) =>
      current.map((session) => (session.id === sessionId ? nextSession : session)),
    );

    try {
      const updateResult = await supabase
        .from("calendar_tasks")
        .update(payload)
        .eq("id", sessionId)
        .eq("user_id", userId)
        .select(selectColumns)
        .maybeSingle();

      if (updateResult.error) {
        throw new Error(getSupabaseErrorMessage(updateResult.error));
      }

      if (!updateResult.data) {
        throw new Error("Supabase no devolvio la sesión actualizada.");
      }

      setSessions((current) =>
        current
          .map((session) =>
            session.id === sessionId
              ? rowToSession(updateResult.data as unknown as CalendarTaskRow)
              : session,
          )
          .sort((a, b) => a.taskDate.localeCompare(b.taskDate)),
      );
    } catch (saveError) {
      console.error("Error guardando sesión:", saveError);
      console.error("Payload enviado:", payload);
      console.error("User ID:", userId);
      console.error("Session ID:", sessionId);

      setSessions(previousSessions);
      setError(
        `No se pudo guardar el cambio: ${getSupabaseErrorMessage(saveError)}`,
      );
    } finally {
      setSavingIds((current) => {
        const next = new Set(current);
        next.delete(sessionId);
        return next;
      });
    }
  }

  async function deleteSession(sessionId: string) {
    const previousSessions = sessions;

    setError("");
    setDeletingIds((current) => new Set(current).add(sessionId));
    setSessions((current) => current.filter((session) => session.id !== sessionId));

    try {
      const deleteResult = await supabase
        .from("calendar_tasks")
        .delete()
        .eq("id", sessionId)
        .eq("user_id", userId)
        .select("id")
        .maybeSingle();

      if (deleteResult.error) {
        throw new Error(getSupabaseErrorMessage(deleteResult.error));
      }

      if (!deleteResult.data) {
        throw new Error("Supabase no devolvio la sesión eliminada.");
      }
    } catch (saveError) {
      console.error("Error guardando sesión:", saveError);
      console.error("Payload enviado:", { deleted: true });
      console.error("User ID:", userId);
      console.error("Session ID:", sessionId);

      setSessions(previousSessions);
      setError(
        `No se pudo eliminar la sesión: ${getSupabaseErrorMessage(saveError)}`,
      );
    } finally {
      setDeletingIds((current) => {
        const next = new Set(current);
        next.delete(sessionId);
        return next;
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Sesiones totales" value={String(stats.total)} />
        <StatCard label="Pendientes" tone="orange" value={String(stats.pending)} />
        <StatCard label="Completadas" tone="green" value={String(stats.completed)} />
        <StatCard label="Canceladas" value={String(stats.cancelled)} />
        <StatCard label="Próxima sesión" value={stats.nextSession} />
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Card>
        <form className="grid gap-4 xl:grid-cols-[1fr_180px_180px_180px]" onSubmit={createSession}>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Título
            <input
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              disabled={creating}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="Estudiar tema 12"
              value={newTitle}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Fecha
            <input
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              disabled={creating}
              onChange={(event) => setNewTaskDate(event.target.value)}
              type="date"
              value={newTaskDate}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Tipo
            <select
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              disabled={creating}
              onChange={(event) => setNewTaskType(normalizeTaskType(event.target.value))}
              value={newTaskType}
            >
              {taskTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Estado
            <select
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              disabled={creating}
              onChange={(event) => setNewStatus(normalizeTaskStatus(event.target.value))}
              value={newStatus}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700 xl:col-span-3">
            Descripción
            <input
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
              disabled={creating}
              onChange={(event) => setNewDescription(event.target.value)}
              placeholder="Notas de planificación para esta sesión"
              value={newDescription}
            />
          </label>
          <div className="flex items-end">
            <Button className="w-full" disabled={creating} type="submit">
              {creating ? "Creando..." : "Crear sesión"}
            </Button>
          </div>
        </form>
      </Card>

      {sessions.length === 0 ? (
        <Card>
          <p className="text-sm leading-6 text-slate-600">
            Todavía no tienes sesiones planificadas.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => {
            const isSaving = savingIds.has(session.id);
            const isDeleting = deletingIds.has(session.id);
            const disabled = isSaving || isDeleting;

            return (
              <Card className="space-y-5" key={session.id}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <input
                      className="w-full rounded-lg border border-transparent bg-transparent px-0 text-lg font-semibold text-slate-950 outline-none transition-colors focus:border-violet-200 focus:bg-white focus:px-3 focus:py-2 focus:ring-2 focus:ring-violet-100"
                      disabled={disabled}
                      onBlur={(event) =>
                        updateSession(session.id, { title: event.target.value })
                      }
                      onChange={(event) =>
                        setSessions((current) =>
                          current.map((currentSession) =>
                            currentSession.id === session.id
                              ? { ...currentSession, title: event.target.value }
                              : currentSession,
                          ),
                        )
                      }
                      value={session.title}
                    />
                    <p className="text-sm font-medium text-slate-500">
                      {formatDate(session.taskDate)} · {getTaskTypeLabel(session.taskType)} · {getStatusLabel(session.status)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-slate-500">
                    {isDeleting ? "Eliminando..." : isSaving ? "Guardando..." : "Guardado"}
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <Button
                    disabled={disabled}
                    onClick={() => updateSession(session.id, { status: "completed" })}
                    variant="secondary"
                  >
                    Marcar completada
                  </Button>
                  <Button
                    disabled={disabled}
                    onClick={() => updateSession(session.id, { status: "pending" })}
                    variant="secondary"
                  >
                    Marcar pendiente
                  </Button>
                  <Button
                    disabled={disabled}
                    onClick={() => deleteSession(session.id)}
                    variant="warning"
                  >
                    Eliminar
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Fecha
                    <input
                      className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                      disabled={disabled}
                      onChange={(event) =>
                        updateSession(session.id, { taskDate: event.target.value })
                      }
                      type="date"
                      value={session.taskDate.slice(0, 10)}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Tipo
                    <select
                      className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                      disabled={disabled}
                      onChange={(event) =>
                        updateSession(session.id, {
                          taskType: normalizeTaskType(event.target.value),
                        })
                      }
                      value={session.taskType}
                    >
                      {taskTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Estado
                    <select
                      className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                      disabled={disabled}
                      onChange={(event) =>
                        updateSession(session.id, {
                          status: normalizeTaskStatus(event.target.value),
                        })
                      }
                      value={session.status}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Descripción
                  <textarea
                    className="min-h-24 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                    disabled={disabled}
                    onBlur={(event) =>
                      updateSession(session.id, { description: event.target.value })
                    }
                    onChange={(event) =>
                      setSessions((current) =>
                        current.map((currentSession) =>
                          currentSession.id === session.id
                            ? {
                                ...currentSession,
                                description: event.target.value,
                              }
                            : currentSession,
                        ),
                      )
                    }
                    placeholder="Añade notas para esta sesión."
                    value={session.description}
                  />
                </label>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
