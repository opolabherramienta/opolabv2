"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type OnboardingActionState = {
  error: string;
};

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

export async function saveOnboardingAction(
  _prevState: OnboardingActionState,
  formData: FormData,
) {
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
    !oppositionDate ||
    weeklyAvailableHours === null ||
    defaultTopicDurationMinutes === null ||
    defaultPracticalDurationMinutes === null ||
    !mainGoal ||
    availableDays.length === 0
  ) {
    return { error: "Completa todos los campos principales del onboarding." };
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
      opposition_date: oppositionDate,
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

  redirect("/dashboard");
}
