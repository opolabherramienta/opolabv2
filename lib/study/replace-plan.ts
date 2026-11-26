// Swaps the pending sessions of an earlier plan for a new one without ever
// leaving the calendar empty: the new plan is written first and the old one
// is removed only once all of it is stored.

/** The two writes the swap needs, so it can be tested without a database. */
export type PlanStore<Row> = {
  /** Stores the rows and returns their new ids. */
  insert(rows: Row[]): Promise<{ ids: string[]; error: string | null }>;
  remove(ids: string[]): Promise<{ error: string | null }>;
};

export type ReplacePlanResult =
  | { ok: true }
  | {
      ok: false;
      /**
       * "kept-old": the new plan could not be stored and the old one is intact.
       * "mixed": the new plan could not be stored and part of it is still there.
       * "old-left": the new plan is stored, but old sessions could not be removed.
       */
      state: "kept-old" | "mixed" | "old-left";
      message: string;
    };

const INSERT_CHUNK = 200;
/** Ids travel in the URL of the request: keep each one short. */
const REMOVE_CHUNK = 100;

async function removeAll<Row>(store: PlanStore<Row>, ids: string[]) {
  let firstError: string | null = null;

  for (let index = 0; index < ids.length; index += REMOVE_CHUNK) {
    const chunk = ids.slice(index, index + REMOVE_CHUNK);
    let result = await store.remove(chunk);

    if (result.error) {
      // One more try: a passing network failure should not leave leftovers.
      result = await store.remove(chunk);
    }

    firstError ??= result.error;
  }

  return firstError;
}

export async function replacePlan<Row>(
  store: PlanStore<Row>,
  oldIds: string[],
  rows: Row[],
): Promise<ReplacePlanResult> {
  const newIds: string[] = [];

  for (let index = 0; index < rows.length; index += INSERT_CHUNK) {
    const result = await store.insert(rows.slice(index, index + INSERT_CHUNK));

    if (result.error) {
      // Undo what was written, so the earlier plan stays as it was.
      const undoError = await removeAll(store, newIds);

      return { ok: false, state: undoError ? "mixed" : "kept-old", message: result.error };
    }

    newIds.push(...result.ids);
  }

  // The new plan is complete. Old sessions that resist are only leftovers:
  // the next recalculation replaces them like any other pending session.
  const removeError = await removeAll(store, oldIds);

  return removeError ? { ok: false, state: "old-left", message: removeError } : { ok: true };
}
