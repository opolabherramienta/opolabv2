// What a calendar session is for. The database only stores three task types,
// so reviews and mock exams are told apart by the title the planner gives them.
export type SessionKind = "study" | "review" | "simulation" | "practical" | "rest";

export const REVIEW_PREFIX = "Repaso: ";
export const SIMULATION_PREFIX = "Simulacro: ";
export const PRACTICAL_PREFIX = "Práctico: ";

export function getSessionKind(
  taskType: string | null | undefined,
  title: string | null | undefined,
): SessionKind {
  if (taskType === "rest") return "rest";
  if (taskType === "practical") return "practical";

  const text = (title ?? "").trim().toLowerCase();

  if (text.startsWith("repaso")) return "review";
  if (text.startsWith("simulacro")) return "simulation";

  return "study";
}

export const sessionKindLabels: Record<SessionKind, string> = {
  study: "Tema nuevo",
  review: "Repaso",
  simulation: "Simulacro",
  practical: "Práctico",
  rest: "Descanso",
};

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function dateFromKey(key: string) {
  const [year, month, day] = key.slice(0, 10).split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function addDays(key: string, days: number) {
  const date = dateFromKey(key);
  date.setDate(date.getDate() + days);

  return toDateKey(date);
}

export function daysBetween(fromKey: string, toKey: string) {
  return Math.round(
    (dateFromKey(toKey).getTime() - dateFromKey(fromKey).getTime()) / 86400000,
  );
}
