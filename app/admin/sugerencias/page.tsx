import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireAdmin } from "@/lib/auth/authorization";
import { friendlyError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type FeedbackRow = {
  id: string;
  user_id: string;
  message: string;
  page: string | null;
  created_at: string;
};

const dateFormat = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Madrid",
});

// What people send from "Cuéntanos qué falla", newest first.
export default async function AdminSugerenciasPage() {
  await requireAdmin();

  const supabase = await createClient();
  const feedbackResult = await supabase
    .from("feedback")
    .select("id, user_id, message, page, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (feedbackResult.data ?? []) as FeedbackRow[];
  const userIds = [...new Set(rows.map((row) => row.user_id))];
  const profilesResult =
    userIds.length > 0
      ? await supabase.from("profiles").select("id, email, full_name").in("id", userIds)
      : { data: [] };
  const people = new Map(
    ((profilesResult.data ?? []) as Array<{ id: string; email: string | null; full_name: string | null }>).map(
      (profile) => [profile.id, profile.full_name?.trim() || profile.email || "Sin nombre"],
    ),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        description="Lo que la gente envía desde «Cuéntanos qué falla». Se ven los 200 mensajes más recientes."
        title="Mensajes recibidos"
      />

      {feedbackResult.error ? (
        <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
          No se pudieron cargar los mensajes. {friendlyError(feedbackResult.error)} Si
          es la primera vez, falta ejecutar el SQL de la tabla feedback.
        </p>
      ) : rows.length === 0 ? (
        <Card>
          <p className="text-sm leading-6 text-slate-600">Todavía no ha llegado ningún mensaje.</p>
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-3">
          {rows.map((row) => (
            <li className="edge p-4" key={row.id}>
              <p className="text-sm font-semibold text-slate-500">
                {dateFormat.format(new Date(row.created_at))} · {people.get(row.user_id) ?? "Cuenta borrada"}
                {row.page ? ` · ${row.page}` : ""}
              </p>
              <p className="mt-2 text-[15px] leading-6 whitespace-pre-wrap text-slate-900">
                {row.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
