type Page<T> = { data: T[] | null; error: { message: string } | null };

/** Supabase answers at most this many rows per request unless told otherwise. */
const PAGE_SIZE = 1000;

// Reads every row of a query, page by page. `build` must apply a stable
// order (ending in a unique column) and the given range, for example
//   fetchAll((from, to) => query.order("task_date").order("id").range(from, to))
export async function fetchAll<T>(
  build: (from: number, to: number) => PromiseLike<Page<T>>,
): Promise<Page<T>> {
  const rows: T[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const page = await build(from, from + PAGE_SIZE - 1);

    if (page.error) {
      return { data: rows.length > 0 ? rows : null, error: page.error };
    }

    const data = page.data ?? [];
    rows.push(...data);

    if (data.length < PAGE_SIZE) {
      return { data: rows, error: null };
    }
  }
}
