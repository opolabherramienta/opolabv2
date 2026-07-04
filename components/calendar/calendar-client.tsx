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

type CalendarDay = {
  date: Date;
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  sessions: CalendarSession[];
};

const defaultTaskType: CalendarTaskType = "study_topic";
const defaultTaskStatus: CalendarTaskStatus = "pending";
const weekDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

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

const taskTypeClasses: Record<CalendarTaskType, string> = {
  study_topic: "border-violet-200 bg-violet-50 text-violet-800",
  practical: "border-sky-200 bg-sky-50 text-sky-800",
  rest: "border-slate-200 bg-slate-100 text-slate-700",
};

const statusClasses: Record<CalendarTaskStatus, string> = {
  pending: "ring-1 ring-orange-200",
  completed: "opacity-80 ring-1 ring-emerald-200",
  cancelled: "opacity-60 line-through ring-1 ring-slate-200",
};

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
    taskDate: normalizeDateKey(row.task_date ?? ""),
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
    task_date: normalizeDateKey(session.taskDate),
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

function normalizeDateKey(value: string) {
  return value ? value.slice(0, 10) : "";
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function dateFromKey(value: string) {
  const [year, month, day] = normalizeDateKey(value).split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatDate(value: string) {
  const date = dateFromKey(value);

  if (!date) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getTodayInputValue() {
  return toDateKey(new Date());
}

function getMonthDays(visibleMonth: Date, sessions: CalendarSession[]) {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysBeforeMonth = (firstDay.getDay() + 6) % 7;
  const daysAfterMonth = (7 - ((daysBeforeMonth + lastDay.getDate()) % 7)) % 7;
  const firstGridDay = new Date(year, month, 1 - daysBeforeMonth);
  const totalDays = daysBeforeMonth + lastDay.getDate() + daysAfterMonth;
  const todayKey = getTodayInputValue();
  const sessionsByDate = new Map<string, CalendarSession[]>();

  sessions.forEach((session) => {
    const dateKey = normalizeDateKey(session.taskDate);
    const dateSessions = sessionsByDate.get(dateKey) ?? [];
    dateSessions.push(session);
    sessionsByDate.set(dateKey, dateSessions);
  });

  return Array.from({ length: totalDays }, (_, index): CalendarDay => {
    const date = new Date(firstGridDay);
    date.setDate(firstGridDay.getDate() + index);
    const dateKey = toDateKey(date);

    return {
      date,
      dateKey,
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: dateKey === todayKey,
      sessions: sessionsByDate.get(dateKey) ?? [],
    };
  });
}

function getSessionPillClasses(session: CalendarSession, isSelected: boolean) {
  return [
    "w-full truncate rounded-md border px-2 py-1 text-left text-xs font-medium transition-colors",
    taskTypeClasses[session.taskType],
    statusClasses[session.status],
    isSelected ? "outline outline-2 outline-offset-1 outline-violet-500" : "",
  ]
    .filter(Boolean)
    .join(" ");
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
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const date = dateFromKey(getTodayInputValue()) ?? new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

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
    const todayKey = getTodayInputValue();
    const nextSession = sessions
      .filter((session) => normalizeDateKey(session.taskDate) >= todayKey)
      .sort((a, b) => normalizeDateKey(a.taskDate).localeCompare(normalizeDateKey(b.taskDate)))[0];

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

  const calendarDays = useMemo(
    () => getMonthDays(visibleMonth, sessions),
    [sessions, visibleMonth],
  );
  const visibleMonthKey = monthKey(visibleMonth);
  const monthSessions = useMemo(
    () =>
      sessions.filter(
        (session) => normalizeDateKey(session.taskDate).slice(0, 7) === visibleMonthKey,
      ),
    [sessions, visibleMonthKey],
  );
  const selectedSession = selectedSessionId
    ? sessions.find((session) => session.id === selectedSessionId) ?? null
    : null;

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

      const createdSession = rowToSession(insertResult.data as unknown as CalendarTaskRow);

      setSessions((current) =>
        [...current, createdSession].sort((a, b) => a.taskDate.localeCompare(b.taskDate)),
      );
      const createdDate = dateFromKey(createdSession.taskDate);
      if (createdDate) {
        setVisibleMonth(new Date(createdDate.getFullYear(), createdDate.getMonth(), 1));
      }
      setSelectedSessionId(createdSession.id);
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
      taskDate: normalizeDateKey(patch.taskDate ?? currentSession.taskDate),
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

      if (selectedSessionId === sessionId) {
        setSelectedSessionId(null);
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

  function goToPreviousMonth() {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  }

  function goToNextMonth() {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  }

  function goToToday() {
    const today = new Date();
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  function renderSessionCard(session: CalendarSession) {
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
              onBlur={(event) => updateSession(session.id, { title: event.target.value })}
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
              onChange={(event) => {
                if (event.target.value) {
                  updateSession(session.id, { taskDate: event.target.value });
                }
              }}
              type="date"
              value={normalizeDateKey(session.taskDate)}
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
            onBlur={(event) => updateSession(session.id, { description: event.target.value })}
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
        <form
          className="grid gap-4 xl:grid-cols-[1fr_180px_180px_180px]"
          onSubmit={createSession}
        >
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

      <Card className="space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button onClick={goToPreviousMonth} variant="secondary">
              Mes anterior
            </Button>
            <Button onClick={goToToday} variant="ghost">
              Hoy
            </Button>
            <Button onClick={goToNextMonth} variant="secondary">
              Mes siguiente
            </Button>
          </div>
          <h2 className="text-xl font-semibold capitalize text-slate-950">
            {formatMonth(visibleMonth)}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-7 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
              {weekDays.map((day) => (
                <div className="px-3 py-2" key={day}>
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 border-l border-slate-200">
              {calendarDays.map((day) => (
                <div
                  className={[
                    "min-h-32 border-b border-r border-slate-200 p-2",
                    day.isCurrentMonth ? "bg-white" : "bg-slate-50 text-slate-400",
                  ].join(" ")}
                  key={day.dateKey}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={[
                        "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                        day.isToday ? "bg-violet-700 text-white" : "text-slate-700",
                      ].join(" ")}
                    >
                      {day.dayNumber}
                    </span>
                    {day.sessions.length > 0 ? (
                      <span className="text-xs font-medium text-slate-400">
                        {day.sessions.length}
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-1">
                    {day.sessions.map((session) => (
                      <button
                        className={getSessionPillClasses(
                          session,
                          selectedSessionId === session.id,
                        )}
                        key={session.id}
                        onClick={() => setSelectedSessionId(session.id)}
                        title={`${session.title} · ${getTaskTypeLabel(session.taskType)} · ${getStatusLabel(session.status)}`}
                        type="button"
                      >
                        {session.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {selectedSession ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-950">Sesión seleccionada</h2>
          {renderSessionCard(selectedSession)}
        </div>
      ) : null}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">
          Tareas de {formatMonth(visibleMonth)}
        </h2>
        {monthSessions.length === 0 ? (
          <Card>
            <p className="text-sm leading-6 text-slate-600">
              No hay sesiones planificadas en este mes.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {monthSessions.map((session) => renderSessionCard(session))}
          </div>
        )}
      </div>
    </div>
  );
}
