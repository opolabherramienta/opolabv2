import { daysBetween, getSessionKind, toDateKey, type SessionKind } from "./sessions";

// Rules carried over from the first OpoLab planner. Everything is derived from
// the completed calendar sessions, so there is no separate score to keep in sync.
export const XP_BY_KIND: Record<SessionKind, number> = {
  study: 20,
  review: 10,
  simulation: 30,
  practical: 15,
  rest: 0,
};

/** Extra XP per session once the streak reaches this many study days. */
export const STREAK_BONUS = 5;
export const STREAK_BONUS_FROM = 5;

/** The streak counts study days and only breaks after this many days off. */
export const STREAK_GRACE_DAYS = 7;

export type Level = {
  number: number;
  name: string;
  minXp: number;
  /** XP needed for the next level, or null at the top. */
  nextXp: number | null;
};

const levelSteps: Array<[number, string]> = [
  [0, "Opositor novel"],
  [200, "Estudiante constante"],
  [500, "Preparador dedicado"],
  [900, "Especialista"],
  [1400, "Opositor experto"],
  [2000, "Maestro del temario"],
  [2800, "Opositor élite"],
  [3800, "Crack de la oposición"],
  [5000, "Gran maestro"],
  [6500, "Catedrático supremo"],
];

export const LEVELS: Level[] = levelSteps.map(([minXp, name], index) => ({
  number: index + 1,
  name,
  minXp,
  nextXp: levelSteps[index + 1]?.[0] ?? null,
}));

export function getLevel(xp: number): Level {
  for (let index = LEVELS.length - 1; index >= 0; index--) {
    if (xp >= LEVELS[index].minXp) return LEVELS[index];
  }

  return LEVELS[0];
}

export type CompletedSession = {
  taskType: string | null;
  title: string | null;
  status: string | null;
  completedAt: string | null;
  taskDate?: string | null;
};

export type GameSummary = {
  xpTotal: number;
  xpThisWeek: number;
  streak: number;
  bestStreak: number;
  studiedToday: boolean;
  level: Level;
  /** 0 to 100 within the current level. */
  levelPercent: number;
  xpToNextLevel: number | null;
};

function getCompletionDayKey(session: CompletedSession) {
  if (session.completedAt) {
    const date = new Date(session.completedAt);

    if (!Number.isNaN(date.getTime())) return toDateKey(date);
  }

  return session.taskDate ? session.taskDate.slice(0, 10) : null;
}

function getWeekStartKey(today: Date) {
  const start = new Date(today);
  start.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  return toDateKey(start);
}

export function summarizeGame(
  sessions: CompletedSession[],
  today: Date = new Date(),
): GameSummary {
  const todayKey = toDateKey(today);
  const weekStartKey = getWeekStartKey(today);
  const completed = sessions
    .filter((session) => session.status === "completed")
    .map((session) => ({
      dayKey: getCompletionDayKey(session),
      kind: getSessionKind(session.taskType, session.title),
    }))
    .filter(
      (session): session is { dayKey: string; kind: SessionKind } =>
        session.dayKey !== null && session.kind !== "rest",
    )
    .sort((a, b) => a.dayKey.localeCompare(b.dayKey));

  let xpTotal = 0;
  let xpThisWeek = 0;
  let streak = 0;
  let bestStreak = 0;
  let lastDayKey: string | null = null;

  for (const session of completed) {
    if (session.dayKey !== lastDayKey) {
      const gap = lastDayKey ? daysBetween(lastDayKey, session.dayKey) : 0;
      streak = lastDayKey && gap < STREAK_GRACE_DAYS ? streak + 1 : 1;
      bestStreak = Math.max(bestStreak, streak);
      lastDayKey = session.dayKey;
    }

    const xp =
      XP_BY_KIND[session.kind] + (streak >= STREAK_BONUS_FROM ? STREAK_BONUS : 0);
    xpTotal += xp;

    if (session.dayKey >= weekStartKey) {
      xpThisWeek += xp;
    }
  }

  // A streak nobody has fed for a week is over.
  if (lastDayKey && daysBetween(lastDayKey, todayKey) >= STREAK_GRACE_DAYS) {
    streak = 0;
  }

  const level = getLevel(xpTotal);
  const span = level.nextXp === null ? 0 : level.nextXp - level.minXp;

  return {
    xpTotal,
    xpThisWeek,
    streak,
    bestStreak,
    studiedToday: lastDayKey === todayKey,
    level,
    levelPercent:
      span === 0 ? 100 : Math.round(((xpTotal - level.minXp) / span) * 100),
    xpToNextLevel: level.nextXp === null ? null : level.nextXp - xpTotal,
  };
}

/** XP a session is worth right now, for the "+XP" shown when completing it. */
export function getSessionXp(
  taskType: string | null,
  title: string | null,
  streak: number,
) {
  const base = XP_BY_KIND[getSessionKind(taskType, title)];

  return base === 0 ? 0 : base + (streak >= STREAK_BONUS_FROM ? STREAK_BONUS : 0);
}
