import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type TableRow = Record<string, unknown>;

type QueryResult = {
  title: string;
  data: TableRow[];
  error: string | null;
};

const tables = [
  {
    title: "Etapas educativas",
    tableName: "education_stages",
  },
  {
    title: "Especialidades",
    tableName: "specialties",
  },
  {
    title: "Comunidades",
    tableName: "autonomous_communities",
  },
] as const;

function formatValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }

  return JSON.stringify(value);
}

function getRowLabel(row: TableRow) {
  const labelKeys = ["name", "nombre", "title", "titulo", "code", "codigo"];
  const labelKey = labelKeys.find((key) => row[key]);

  if (labelKey) {
    return formatValue(row[labelKey]);
  }

  return JSON.stringify(row);
}

function DataSection({ result }: { result: QueryResult }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">{result.title}</h2>

      {result.error ? (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Error: {result.error}
        </p>
      ) : result.data.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {result.data.map((row, index) => (
            <li
              className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700"
              key={`${result.title}-${index}`}
            >
              {getRowLabel(row)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No hay datos disponibles</p>
      )}
    </section>
  );
}

export default async function TestSupabasePage() {
  const supabase = await createClient();

  const results = await Promise.all(
    tables.map(async ({ title, tableName }) => {
      const { data, error } = await supabase.from(tableName).select("*").limit(50);

      return {
        title,
        data: data ?? [],
        error: error?.message ?? null,
      };
    }),
  );

  const hasError = results.some((result) => result.error);
  const hasData = results.some((result) => result.data.length > 0);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Prueba de conexión Supabase
          </h1>
          {hasError ? (
            <p className="mt-3 text-sm text-red-700">
              Hay errores al consultar Supabase. Revisa los mensajes de cada
              tabla.
            </p>
          ) : !hasData ? (
            <p className="mt-3 text-sm text-slate-600">
              No hay datos disponibles
            </p>
          ) : null}
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {results.map((result) => (
            <DataSection key={result.title} result={result} />
          ))}
        </div>
      </div>
    </main>
  );
}
