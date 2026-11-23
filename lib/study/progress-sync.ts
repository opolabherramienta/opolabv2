import type { SupabaseClient } from "@supabase/supabase-js";
import { getSessionKind, toDateKey } from "./sessions";

type LinkedSession = {
  taskType: string | null;
  title: string | null;
  userTopicId?: string | null;
  userPracticalId?: string | null;
};

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
