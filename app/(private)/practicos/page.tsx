import { PageHeader } from "@/components/ui/PageHeader";
import {
  PracticalsClient,
  type PracticalItem,
} from "@/components/practicals/practicals-client";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type PracticalStatus = "not_started" | "worked" | "mastered";

type UserOppositionProfile = {
  specialty_id: string | null;
  onboarding_completed: boolean | null;
};

type UserPractical = {
  id: string;
  name: string;
  description: string | null;
  status: PracticalStatus | null;
  times_worked: number | null;
  created_at: string | null;
};

const defaultPracticalStatus: PracticalStatus = "not_started";

function normalizePracticalStatus(
  value: PracticalStatus | string | null | undefined,
): PracticalStatus {
  if (value === "worked" || value === "mastered") {
    return value;
  }

  return defaultPracticalStatus;
}

function getLoadError(errors: Array<{ message: string } | null>) {
  const error = errors.find(Boolean);

  if (!error) {
    return null;
  }

  return `No se pudieron cargar los prácticos: ${error.message}`;
}

export default async function PracticosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profileResult = await supabase
    .from("user_opposition_profiles")
    .select("specialty_id, onboarding_completed")
    .eq("user_id", user.id)
    .maybeSingle();
  const profile = profileResult.data as UserOppositionProfile | null;

  if (!profile || profile.onboarding_completed === false) {
    redirect("/onboarding");
  }

  const practicalsResult = await supabase
    .from("user_practicals")
    .select("id, name, description, status, times_worked, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  const userPracticals = (practicalsResult.data ?? []) as UserPractical[];
  const practicals: PracticalItem[] = userPracticals.map((practical) => ({
    id: practical.id,
    name: practical.name,
    description: practical.description ?? "",
    status: normalizePracticalStatus(practical.status),
    timesWorked: practical.times_worked ?? 0,
    createdAt: practical.created_at,
  }));
  const loadError = getLoadError([profileResult.error, practicalsResult.error]);

  return (
    <div className="space-y-8">
      <PageHeader
        description="Registra tus supuestos prácticos, intentos, puntuaciones y progreso."
        title="Mis prácticos"
      />

      {loadError ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {loadError}
        </p>
      ) : null}

      <PracticalsClient initialPracticals={practicals} userId={user.id} />
    </div>
  );
}
