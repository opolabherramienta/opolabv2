"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type OnboardingActionState = {
  error: string;
};

// "Today" is the date in mainland Spain, whatever the server clock says.
function madridDateKey() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
}

function getRequiredString(formData: FormData, field: string) {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getRequiredNumber(formData: FormData, field: string) {
  const rawValue = getRequiredString(formData, field);
  const value = Number(rawValue);

  if (!rawValue || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

async function saveOppositionProfile(formData: FormData, destination: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return { error: `No se pudo comprobar la sesion: ${userError.message}` };
  }

  if (!user) {
    redirect("/login");
  }

  const educationStageId = getRequiredString(formData, "education_stage_id");
  const specialtyId = getRequiredString(formData, "specialty_id");
  const autonomousCommunityId = getRequiredString(
    formData,
    "autonomous_community_id",
  );
  const oppositionDate = getRequiredString(formData, "opposition_date");
  const weeklyAvailableHours = getRequiredNumber(
    formData,
    "weekly_available_hours",
  );
  const defaultTopicDurationMinutes = getRequiredNumber(
    formData,
    "default_topic_duration_minutes",
  );
  const defaultPracticalDurationMinutes = getRequiredNumber(
    formData,
    "default_practical_duration_minutes",
  );
  const mainGoal = getRequiredString(formData, "main_goal");
  const availableDays = formData
    .getAll("available_days")
    .filter((value): value is string => typeof value === "string");

  if (
    !educationStageId ||
    !specialtyId ||
    !autonomousCommunityId ||
    weeklyAvailableHours === null ||
    defaultTopicDurationMinutes === null ||
    defaultPracticalDurationMinutes === null ||
    !mainGoal ||
    availableDays.length === 0
  ) {
    return { error: "Completa todos los campos principales del onboarding." };
  }

  // The exam date is optional: many people do not know it until the call is
  // published. When given, it must be a real day from today on.
  if (oppositionDate) {
    const parsed = new Date(`${oppositionDate}T12:00:00Z`);

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(oppositionDate) ||
      Number.isNaN(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== oppositionDate
    ) {
      return { error: "La fecha del examen no es válida." };
    }

    if (oppositionDate < madridDateKey()) {
      return {
        error:
          "La fecha del examen ya ha pasado. Pon la de tu próxima convocatoria o déjala vacía si aún no la sabes.",
      };
    }
  }

  if (
    weeklyAvailableHours <= 0 ||
    defaultTopicDurationMinutes <= 0 ||
    defaultPracticalDurationMinutes <= 0
  ) {
    return { error: "Las horas y duraciones deben ser mayores que cero." };
  }

  const { error } = await supabase.from("user_opposition_profiles").upsert(
    {
      user_id: user.id,
      education_stage_id: educationStageId,
      specialty_id: specialtyId,
      autonomous_community_id: autonomousCommunityId,
      opposition_date: oppositionDate || null,
      weekly_available_hours: weeklyAvailableHours,
      available_days: availableDays,
      default_topic_duration_minutes: defaultTopicDurationMinutes,
      default_practical_duration_minutes: defaultPracticalDurationMinutes,
      main_goal: mainGoal,
      onboarding_completed: true,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { error: `No se pudo guardar el onboarding: ${error.message}` };
  }

  redirect(destination);
}

export async function saveOnboardingAction(
  _prevState: OnboardingActionState,
  formData: FormData,
) {
  return saveOppositionProfile(formData, "/dashboard");
}

export async function saveSettingsAction(
  _prevState: OnboardingActionState,
  formData: FormData,
) {
  return saveOppositionProfile(formData, "/ajustes?guardado=1");
}
