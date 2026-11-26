"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfettiBurst, useConfetti } from "@/components/ui/Confetti";
import { Icon, type IconName } from "@/components/ui/Icon";
import { fieldClasses } from "@/components/ui/Input";
import { Chip } from "@/components/ui/Progress";
import { getCompletionXp } from "@/lib/study/gamification";
import { revertsProgressOnDelete, syncSessionProgress } from "@/lib/study/progress-sync";
import { createClient } from "@/lib/supabase/client";
import { friendlyError } from "@/lib/errors";

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
  /** Links set by the automatic plan; completing the session updates them. */
  userTopicId?: string | null;
  userPracticalId?: string | null;
  estimatedMinutes?: number | null;
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
  user_topic_id?: string | null;
  user_practical_id?: string | null;
  estimated_duration_minutes?: number | null;
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
const weekDays = [
  { short: "L", name: "Lunes" },
  { short: "M", name: "Martes" },
  { short: "X", name: "Miércoles" },
  { short: "J", name: "Jueves" },
  { short: "V", name: "Viernes" },
  { short: "S", name: "Sábado" },
  { short: "D", name: "Domingo" },
];

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

const taskTypeIcons: Record<CalendarTaskType, IconName> = {
  study_topic: "balls",
  practical: "flask",
  rest: "moon",
};

const taskTypeIconClasses: Record<CalendarTaskType, string> = {
  study_topic: "bg-violet-100 text-violet-700",
  practical: "bg-yellow-100 text-yellow-900",
  rest: "bg-slate-100 text-slate-500",
};

const taskTypeDotClasses: Record<CalendarTaskType, string> = {
  study_topic: "bg-boli",
  practical: "bg-subrayador-edge",
  rest: "bg-slate-400",
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
    userTopicId: row.user_topic_id ?? null,
    userPracticalId: row.user_practical_id ?? null,
    estimatedMinutes: row.estimated_duration_minutes ?? null,
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

// What to tell the user when a save fails: never the raw text.
function getSupabaseErrorMessage(error: unknown) {
  return friendlyError(error);
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

function formatShortDate(value: string) {
  const date = dateFromKey(value);

  if (!date) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatLongDate(value: string) {
  const date = dateFromKey(value);

  if (!date) {
    return "Sin fecha";
  }

  const text = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);

  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getDotClasses(session: CalendarSession) {
  if (session.status === "completed") {
    return "bg-aprobado";
  }

  if (session.status === "cancelled") {
    return "border border-slate-300 bg-white";
  }

  return taskTypeDotClasses[session.taskType];
}

function getDayLabel(day: CalendarDay) {
  const count = day.sessions.length;
  const sessionsText =
    count === 0 ? "sin sesiones" : count === 1 ? "1 sesión" : `${count} sesiones`;

  return `${formatLongDate(day.dateKey)}, ${sessionsText}`;
}

type SessionRowProps = {
  session: CalendarSession;
  isEditing: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  onDelete: () => void;
  onLocalChange: (patch: Partial<CalendarSession>) => void;
  onToggleEdit: () => void;
  onUpdate: (patch: Partial<CalendarSession>) => void;
  /** XP gained by completing this session right now. */
  xpOnComplete: () => number;
};

function SessionRow({
  isDeleting,
  isEditing,
  isSaving,
  onDelete,
  onLocalChange,
  onToggleEdit,
  onUpdate,
  session,
  xpOnComplete,
}: SessionRowProps) {
  const { burst, fire } = useConfetti();
  const [xpPop, setXpPop] = useState<{ id: number; xp: number } | null>(null);
  const xpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const disabled = isSaving || isDeleting;
  const isCompleted = session.status === "completed";
  const isCancelled = session.status === "cancelled";

  function toggleCompleted() {
    if (isCompleted) {
      onUpdate({ status: "pending" });
      return;
    }

    fire();
    const xp = xpOnComplete();

    if (xp > 0) {
      if (xpTimer.current) clearTimeout(xpTimer.current);
      setXpPop({ id: Date.now(), xp });
      xpTimer.current = setTimeout(() => setXpPop(null), 1500);
    }

    onUpdate({ status: "completed" });
  }

  return (
    <li className="edge animate-rise p-3 sm:p-4">
      <div className="flex items-center gap-3">
        <span
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            isCompleted
              ? "bg-emerald-100 text-aprobado-edge"
              : taskTypeIconClasses[session.taskType],
          ].join(" ")}
        >
          <Icon name={taskTypeIcons[session.taskType]} />
        </span>

        <div className="min-w-0 flex-1">
          <p
            className={[
              "truncate text-base font-bold",
              isCompleted || isCancelled
                ? "text-slate-400 line-through"
                : "text-slate-950",
            ].join(" ")}
          >
            {session.title || "Sesión sin título"}
          </p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
            <span>{getTaskTypeLabel(session.taskType)}</span>
            {isCancelled ? <Chip>{getStatusLabel(session.status)}</Chip> : null}
            {isSaving ? <span>Guardando…</span> : null}
            {isDeleting ? <span>Borrando…</span> : null}
          </p>
        </div>

        <button
          aria-expanded={isEditing}
          aria-label={isEditing ? "Cerrar edición" : `Editar ${session.title}`}
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
            isEditing
              ? "bg-violet-100 text-violet-700"
              : "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
          ].join(" ")}
          onClick={onToggleEdit}
          type="button"
        >
          <Icon name={isEditing ? "chevron-down" : "pencil"} size={20} />
        </button>

        <span className="relative shrink-0">
          <button
            aria-label={
              isCompleted
                ? `Marcar ${session.title} como pendiente`
                : `Completar ${session.title}`
            }
            aria-pressed={isCompleted}
            className={[
              "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors",
              isCompleted
                ? "animate-pop border-aprobado-edge bg-aprobado text-white shadow-[inset_0_-3px_0_var(--color-aprobado-edge)]"
                : "border-slate-300 bg-white text-slate-300 shadow-[0_3px_0_var(--color-slate-300)] hover:border-aprobado hover:text-aprobado active:translate-y-[3px] active:shadow-none",
            ].join(" ")}
            disabled={disabled}
            onClick={toggleCompleted}
            type="button"
          >
            <Icon name="check" size={24} strokeWidth={3} />
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

      {session.description && !isEditing ? (
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
          {session.description}
        </p>
      ) : null}

      {isEditing ? (
        <div className="mt-4 grid grid-cols-1 gap-4 border-t-2 border-slate-100 pt-4">
          <label className="grid grid-cols-1 gap-2 text-sm font-semibold text-slate-700">
            Título
            <input
              className={fieldClasses}
              disabled={disabled}
              onBlur={(event) => onUpdate({ title: event.target.value })}
              onChange={(event) => onLocalChange({ title: event.target.value })}
              value={session.title}
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-1">
            <label className="grid grid-cols-1 min-w-0 gap-2 text-sm font-semibold text-slate-700">
              Fecha
              <input
                className={`${fieldClasses} min-w-0`}
                disabled={disabled}
                onChange={(event) => {
                  if (event.target.value) {
                    onUpdate({ taskDate: event.target.value });
                  }
                }}
                type="date"
                value={normalizeDateKey(session.taskDate)}
              />
            </label>
            <label className="grid grid-cols-1 min-w-0 gap-2 text-sm font-semibold text-slate-700">
              Tipo
              <select
                className={`${fieldClasses} min-w-0`}
                disabled={disabled}
                onChange={(event) =>
                  onUpdate({ taskType: normalizeTaskType(event.target.value) })
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
            <label className="grid grid-cols-1 min-w-0 gap-2 text-sm font-semibold text-slate-700">
              Estado
              <select
                className={`${fieldClasses} min-w-0`}
                disabled={disabled}
                onChange={(event) =>
                  onUpdate({ status: normalizeTaskStatus(event.target.value) })
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

          <label className="grid grid-cols-1 gap-2 text-sm font-semibold text-slate-700">
            Notas
            <textarea
              className={`${fieldClasses} h-auto min-h-24 py-3`}
              disabled={disabled}
              onBlur={(event) => onUpdate({ description: event.target.value })}
              onChange={(event) =>
                onLocalChange({ description: event.target.value })
              }
              placeholder="Qué quieres hacer en esta sesión."
              value={session.description}
            />
          </label>

          <div className="flex justify-end">
            <button
              className="inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-red-700 transition-colors hover:bg-red-50"
              disabled={disabled}
              onClick={onDelete}
              type="button"
            >
              <Icon name="trash" size={18} />
              Borrar sesión
            </button>
          </div>
        </div>
      ) : null}
    </li>
  );
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
  const newStatus = defaultTaskStatus;
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const date = dateFromKey(getTodayInputValue()) ?? new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [selectedDateKey, setSelectedDateKey] = useState(getTodayInputValue());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const selectColumns = [
    "id",
    "title",
    "description",
    "task_date",
    "task_type",
    "status",
    "completed_at",
    "created_at",
    "user_topic_id",
    "user_practical_id",
    "estimated_duration_minutes",
  ].join(", ");

  // Completing a planned session also moves the topic or practical forward,
  // and undoing it moves it back. A failure here never blocks the calendar.
  async function syncProgress(
    session: CalendarSession,
    direction: 1 | -1,
    done = "La sesión se ha guardado",
  ) {
    try {
      await syncSessionProgress(supabase, userId, session, direction);
    } catch (syncError) {
      console.error("Error actualizando el progreso:", syncError);
      setError(`${done}, pero no se pudo actualizar el progreso del tema o práctico.`);
    }
  }

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
      nextSession: nextSession ? formatShortDate(nextSession.taskDate) : "Ninguna",
    };
  }, [sessions]);

  const calendarDays = useMemo(
    () => getMonthDays(visibleMonth, sessions),
    [sessions, visibleMonth],
  );
  const selectedDaySessions = useMemo(
    () =>
      sessions.filter(
        (session) => normalizeDateKey(session.taskDate) === selectedDateKey,
      ),
    [sessions, selectedDateKey],
  );

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
        throw new Error("El servidor no devolvió la sesión creada.");
      }

      const createdSession = rowToSession(insertResult.data as unknown as CalendarTaskRow);

      setSessions((current) =>
        [...current, createdSession].sort((a, b) => a.taskDate.localeCompare(b.taskDate)),
      );
      const createdDate = dateFromKey(createdSession.taskDate);
      if (createdDate) {
        setVisibleMonth(new Date(createdDate.getFullYear(), createdDate.getMonth(), 1));
      }
      setSelectedDateKey(createdSession.taskDate);
      setNewTitle("");
      setNewDescription("");
      setNewTaskDate(createdSession.taskDate);
      setNewTaskType(defaultTaskType);
      setIsFormOpen(false);
    } catch (saveError) {
      console.error("Error guardando sesión:", saveError);

      setError(`No se pudo crear la sesión. ${getSupabaseErrorMessage(saveError)}`);
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
        throw new Error("El servidor no devolvió la sesión actualizada.");
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

      const wasCompleted = currentSession.status === "completed";
      const isNowCompleted = nextStatus === "completed";

      if (wasCompleted !== isNowCompleted) {
        await syncProgress(currentSession, isNowCompleted ? 1 : -1);
      }
    } catch (saveError) {
      console.error("Error guardando sesión:", saveError);

      setSessions(previousSessions);
      setError(
        `No se pudo guardar el cambio. ${getSupabaseErrorMessage(saveError)}`,
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
    const deletedSession = sessions.find((session) => session.id === sessionId);

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
        throw new Error("El servidor no devolvió la sesión eliminada.");
      }

      if (editingId === sessionId) {
        setEditingId(null);
      }

      // A completed session takes its review, mock exam or practical attempt
      // with it, the same as marking it pending again.
      if (deletedSession && revertsProgressOnDelete(deletedSession, previousSessions)) {
        await syncProgress(deletedSession, -1, "La sesión se ha eliminado");
      }
    } catch (saveError) {
      console.error("Error guardando sesión:", saveError);

      setSessions(previousSessions);
      setError(
        `No se pudo eliminar la sesión. ${getSupabaseErrorMessage(saveError)}`,
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
    selectDay(toDateKey(today));
  }

  function selectDay(dateKey: string) {
    setSelectedDateKey(dateKey);
    setNewTaskDate(dateKey);
    setEditingId(null);
  }

  function patchLocalSession(sessionId: string, patch: Partial<CalendarSession>) {
    setSessions((current) =>
      current.map((currentSession) =>
        currentSession.id === sessionId
          ? { ...currentSession, ...patch }
          : currentSession,
      ),
    );
  }

  const selectedDayPending = selectedDaySessions.filter(
    (session) => session.status === "pending",
  ).length;
  const isSelectedToday = selectedDateKey === getTodayInputValue();

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="edge px-3 py-3 sm:px-4">
          <dd className="font-display text-2xl leading-tight font-extrabold text-slate-950 tabular-nums">
            {stats.pending}
          </dd>
          <dt className="text-xs font-medium text-slate-500 sm:text-sm">
            Pendientes
          </dt>
        </div>
        <div className="edge px-3 py-3 sm:px-4">
          <dd className="font-display text-2xl leading-tight font-extrabold text-aprobado-edge tabular-nums">
            {stats.completed}
          </dd>
          <dt className="text-xs font-medium text-slate-500 sm:text-sm">
            Completadas
          </dt>
        </div>
        <div className="edge px-3 py-3 sm:px-4">
          <dd className="truncate font-display text-2xl leading-tight font-extrabold text-violet-700">
            {stats.nextSession}
          </dd>
          <dt className="text-xs font-medium text-slate-500 sm:text-sm">
            Próxima sesión
          </dt>
        </div>
      </dl>

      {error ? (
        <p
          className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <section aria-label="Mes" className="edge p-3 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <button
              aria-label="Mes anterior"
              className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-700 [--press-edge:var(--color-slate-200)]"
              onClick={goToPreviousMonth}
              type="button"
            >
              <Icon name="chevron-left" />
            </button>
            <div className="min-w-0 text-center">
              <h2 className="truncate text-xl font-extrabold text-slate-950 first-letter:uppercase">
                {formatMonth(visibleMonth)}
              </h2>
              <button
                className="rounded-md px-2 text-sm font-bold text-violet-700 hover:underline"
                onClick={goToToday}
                type="button"
              >
                Ir a hoy
              </button>
            </div>
            <button
              aria-label="Mes siguiente"
              className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-700 [--press-edge:var(--color-slate-200)]"
              onClick={goToNextMonth}
              type="button"
            >
              <Icon name="chevron-right" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400">
            {weekDays.map((day) => (
              <span key={day.name} title={day.name}>
                <span aria-hidden>{day.short}</span>
                <span className="sr-only">{day.name}</span>
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const isSelected = day.dateKey === selectedDateKey;
              const visibleDots = day.sessions.slice(0, 3);
              const extraCount = day.sessions.length - visibleDots.length;

              return (
                <button
                  aria-label={getDayLabel(day)}
                  aria-pressed={isSelected}
                  className={[
                    "flex min-h-12 flex-col items-center justify-start gap-1 rounded-xl border-2 px-0.5 pt-1 pb-1.5 transition-colors sm:min-h-16",
                    isSelected
                      ? "border-violet-500 bg-violet-50"
                      : "border-transparent hover:bg-slate-100",
                    day.isCurrentMonth ? "" : "opacity-40",
                  ].join(" ")}
                  key={day.dateKey}
                  onClick={() => selectDay(day.dateKey)}
                  type="button"
                >
                  <span
                    className={[
                      "flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold tabular-nums",
                      day.isToday
                        ? "bg-boli text-white shadow-[inset_0_-2px_0_var(--color-boli-edge)]"
                        : "text-slate-800",
                    ].join(" ")}
                  >
                    {day.dayNumber}
                  </span>
                  <span className="flex h-2 items-center gap-0.5">
                    {visibleDots.map((session) => (
                      <span
                        className={[
                          "h-2 w-2 rounded-full",
                          getDotClasses(session),
                        ].join(" ")}
                        key={session.id}
                      />
                    ))}
                    {extraCount > 0 ? (
                      <span className="text-[10px] leading-none font-bold text-slate-500">
                        +{extraCount}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>

          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t-2 border-slate-100 pt-3 text-xs font-medium text-slate-500">
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-boli" />
              Tema
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-subrayador-edge" />
              Práctico
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              Descanso
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-aprobado" />
              Completada
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold text-slate-950">
              {isSelectedToday ? "Hoy" : formatLongDate(selectedDateKey)}
            </h2>
            <p aria-live="polite" className="text-sm text-slate-500">
              {isSelectedToday ? `${formatLongDate(selectedDateKey)}. ` : ""}
              {selectedDaySessions.length === 0
                ? "Día libre."
                : selectedDayPending === 0
                  ? "Todo hecho."
                  : selectedDayPending === 1
                    ? "1 sesión pendiente."
                    : `${selectedDayPending} sesiones pendientes.`}
            </p>
          </div>

          {selectedDaySessions.length === 0 ? (
            <div className="cuadricula rounded-2xl border-2 border-dashed border-slate-300 px-5 py-8 text-center">
              <p className="font-display text-lg font-extrabold text-slate-900">
                Nada planificado
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Añade un tema, un práctico o un descanso para este día.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-3">
              {selectedDaySessions.map((session) => (
                <SessionRow
                  isDeleting={deletingIds.has(session.id)}
                  isEditing={editingId === session.id}
                  isSaving={savingIds.has(session.id)}
                  key={session.id}
                  onDelete={() => deleteSession(session.id)}
                  onLocalChange={(patch) => patchLocalSession(session.id, patch)}
                  onToggleEdit={() =>
                    setEditingId((current) =>
                      current === session.id ? null : session.id,
                    )
                  }
                  onUpdate={(patch) => updateSession(session.id, patch)}
                  session={session}
                  xpOnComplete={() => getCompletionXp(sessions, session)}
                />
              ))}
            </ul>
          )}

          {isFormOpen ? (
            <form
              className="edge animate-rise grid grid-cols-1 gap-4 p-4"
              onSubmit={createSession}
            >
              <label className="grid grid-cols-1 gap-2 text-sm font-semibold text-slate-700">
                Qué vas a hacer
                <input
                  autoFocus
                  className={fieldClasses}
                  disabled={creating}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="Estudiar tema 12"
                  value={newTitle}
                />
              </label>

              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-slate-700">
                  Tipo
                </legend>
                <div className="grid grid-cols-3 gap-2">
                  {taskTypeOptions.map((option) => {
                    const isActive = newTaskType === option.value;

                    return (
                      <button
                        aria-pressed={isActive}
                        className={[
                          "flex h-12 min-w-0 items-center justify-center gap-1.5 rounded-xl border-2 px-1 text-sm font-bold transition-colors",
                          isActive
                            ? "border-violet-500 bg-violet-50 text-violet-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                        ].join(" ")}
                        disabled={creating}
                        key={option.value}
                        onClick={() => setNewTaskType(option.value)}
                        type="button"
                      >
                        <Icon
                          className="hidden shrink-0 min-[400px]:block"
                          name={taskTypeIcons[option.value]}
                          size={18}
                        />
                        <span className="truncate">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <label className="grid grid-cols-1 min-w-0 gap-2 text-sm font-semibold text-slate-700">
                Día
                <input
                  className={`${fieldClasses} min-w-0`}
                  disabled={creating}
                  onChange={(event) => setNewTaskDate(event.target.value)}
                  type="date"
                  value={newTaskDate}
                />
              </label>

              <label className="grid grid-cols-1 gap-2 text-sm font-semibold text-slate-700">
                Notas (opcional)
                <input
                  className={fieldClasses}
                  disabled={creating}
                  onChange={(event) => setNewDescription(event.target.value)}
                  placeholder="Apartados, páginas, lo que quieras recordar"
                  value={newDescription}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  disabled={creating}
                  onClick={() => setIsFormOpen(false)}
                  variant="secondary"
                >
                  Cancelar
                </Button>
                <Button disabled={creating} type="submit">
                  {creating ? "Añadiendo…" : "Añadir sesión"}
                </Button>
              </div>
            </form>
          ) : (
            <Button
              className="w-full"
              onClick={() => {
                setNewTaskDate(selectedDateKey);
                setIsFormOpen(true);
              }}
              size="lg"
            >
              <Icon name="plus" />
              Añadir sesión
            </Button>
          )}
        </section>
      </div>
    </div>
  );
}
