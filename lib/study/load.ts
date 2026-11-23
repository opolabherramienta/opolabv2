import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchAll } from "@/lib/supabase/fetch-all";

// Every calendar session of a user, oldest first. A full plan is several
// hundred rows, so this reads in pages instead of trusting a single request.
export function loadCalendarTasks<T>(
  supabase: SupabaseClient,
  userId: string,
  columns: string,
) {
  return fetchAll<T>(
    (from, to) =>
      supabase
        .from("calendar_tasks")
        .select(columns)
        .eq("user_id", userId)
        .order("task_date", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to) as unknown as PromiseLike<{
        data: T[] | null;
        error: { message: string } | null;
      }>,
  );
}

type OnboardingCheck = {
  data: { onboarding_completed?: boolean | null } | null;
  error: unknown;
};

/**
 * True when the user still has to go through onboarding. A failed read is
 * not proof of that: the page shows its load error instead of redirecting.
 */
export function needsOnboarding(result: OnboardingCheck) {
  if (result.error) return false;

  return !result.data || result.data.onboarding_completed === false;
}
