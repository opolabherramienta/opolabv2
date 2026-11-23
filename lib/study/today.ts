import { addDays, getSessionKind, type SessionKind } from "./sessions";

// What the "Hoy" screen shows, worked out from the calendar sessions.
export type TodaySession = {
  id: string;
  title: string;
  description: string;
  taskDate: string;
  taskType: string;
  status: string;
  completedAt: string | null;
  userTopicId: string | null;
  userPracticalId: string | null;
  estimatedMinutes: number | null;
};

export type TodayView<T extends TodaySession> = {
  /** Today's sessions that count as work: pending first, then done. */
  today: T[];
  /** Rest sessions planned for today. They never count towards the total. */
  rest: T[];
  /** Pending work from earlier days, most recent first. */
  overdue: T[];
  tomorrow: T[];
  doneCount: number;
  totalCount: number;
  /** Planned minutes still pending today; null when no session has a duration. */
  minutesLeft: number | null;
};

const kindOrder: Record<SessionKind, number> = {
  study: 0,
  review: 1,
  practical: 2,
  simulation: 3,
  rest: 4,
};

function dayKey(session: TodaySession) {
  return session.taskDate.slice(0, 10);
}

export function buildTodayView<T extends TodaySession>(
  sessions: T[],
  todayKey: string,
): TodayView<T> {
  const tomorrowKey = addDays(todayKey, 1);
  const active = sessions.filter(
    (session) => session.status !== "cancelled" && dayKey(session) !== "",
  );
  const isRest = (session: T) =>
    getSessionKind(session.taskType, session.title) === "rest";
  const byKind = (a: T, b: T) =>
    kindOrder[getSessionKind(a.taskType, a.title)] -
    kindOrder[getSessionKind(b.taskType, b.title)];

  const todays = active.filter((session) => dayKey(session) === todayKey);
  const work = todays.filter((session) => !isRest(session));
  const pending = work.filter((session) => session.status !== "completed").sort(byKind);
  const done = work.filter((session) => session.status === "completed").sort(byKind);
  const withMinutes = pending.filter((session) => (session.estimatedMinutes ?? 0) > 0);

  return {
    today: [...pending, ...done],
    rest: todays.filter(isRest),
    overdue: active
      .filter(
        (session) =>
          dayKey(session) < todayKey &&
          session.status !== "completed" &&
          !isRest(session),
      )
      .sort((a, b) => dayKey(b).localeCompare(dayKey(a)) || byKind(a, b)),
    tomorrow: active
      .filter(
        (session) => dayKey(session) === tomorrowKey && session.status !== "completed",
      )
      .sort(byKind),
    doneCount: done.length,
    totalCount: work.length,
    minutesLeft:
      withMinutes.length === 0
        ? null
        : withMinutes.reduce(
            (total, session) => total + (session.estimatedMinutes ?? 0),
            0,
          ),
  };
}

export function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}
