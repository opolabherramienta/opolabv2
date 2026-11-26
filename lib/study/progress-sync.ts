import type { SupabaseClient } from "@supabase/supabase-js";
import { getSessionKind, toDateKey } from "./sessions";

type LinkedSession = {
  taskType: string | null;
  title: string | null;
  userTopicId?: string | null;
  userPracticalId?: string | null;
};

type DeletedSession = LinkedSession & { id: string; status: string | null };

/**
 * True when deleting `session` must take back the progress it gave: it was
 * completed and linked to a topic or practical. A study session only takes
 * "studied" back when no other completed study session of the topic is left.
 */
export function revertsProgressOnDelete(session: DeletedSession, all: DeletedSession[]) {
  if (session.status !== "completed") return false;

  const kind = getSessionKind(session.taskType, session.title);

  if (kind === "rest") return false;
  if (kind === "practical") return Boolean(session.userPracticalId);
  if (!session.userTopicId) return false;
  if (kind !== "study") return true;

  return !all.some(
    (other) =>
      other.id !== session.id &&
      other.status === "completed" &&
      other.userTopicId === session.userTopicId &&
      getSessionKind(other.taskType, other.title) === "study",
  );
}

// Completing a planned session also moves its topic or practical forward, and
// undoing it moves it back. Throws when the progress could not be saved; the
// session itself is already stored by then.
export async function syncSessionProgress(
  supabase: SupabaseClient,
  userId: string,
  session: LinkedSession,
  direction: 1 | -1,
) {
  const kind = getSessionKind(session.taskType, session.title);
  const todayKey = toDateKey(new Date());

  if (session.userTopicId && kind !== "practical" && kind !== "rest") {
    const current = await supabase
      .from("user_topics")
      .select("review_count, simulation_count")
      .eq("id", session.userTopicId)
      .eq("user_id", userId)
      .maybeSingle();

    if (current.error || !current.data) {
      throw new Error(current.error?.message ?? "Tema no encontrado");
    }

    const row = current.data as {
      review_count: number | null;
      simulation_count: number | null;
    };
    const patch: Record<string, unknown> =
      kind === "study"
        ? { studied_done: direction > 0 }
        : kind === "review"
          ? {
              review_count: Math.max(0, (row.review_count ?? 0) + direction),
              ...(direction > 0 ? { last_review_date: todayKey } : {}),
            }
          : {
              simulation_count: Math.max(0, (row.simulation_count ?? 0) + direction),
            };
    const result = await supabase
      .from("user_topics")
      .update(patch)
      .eq("id", session.userTopicId)
      .eq("user_id", userId);

    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  if (session.userPracticalId && kind === "practical") {
    const current = await supabase
      .from("user_practicals")
      .select("times_worked, status")
      .eq("id", session.userPracticalId)
      .eq("user_id", userId)
      .maybeSingle();

    if (current.error || !current.data) {
      throw new Error(current.error?.message ?? "Práctico no encontrado");
    }

    const row = current.data as {
      times_worked: number | null;
      status: string | null;
    };
    const result = await supabase
      .from("user_practicals")
      .update({
        times_worked: Math.max(0, (row.times_worked ?? 0) + direction),
        ...(direction > 0 && row.status === "not_started" ? { status: "worked" } : {}),
        ...(direction > 0 ? { last_worked_date: todayKey } : {}),
      })
      .eq("id", session.userPracticalId)
      .eq("user_id", userId);

    if (result.error) {
      throw new Error(result.error.message);
    }
  }
}
