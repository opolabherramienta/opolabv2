"use client";

import { useActionState, type ReactNode } from "react";
import { saveOnboardingAction } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type CatalogOption = {
  id: string;
  name: string;
};

type UserOppositionProfile = {
  education_stage_id: string | null;
  specialty_id: string | null;
  autonomous_community_id: string | null;
  opposition_date: string | null;
  weekly_available_hours: number | null;
  available_days: string[] | null;
  default_topic_duration_minutes: number | null;
  default_practical_duration_minutes: number | null;
  main_goal: string | null;
};

type OnboardingFormProps = {
  autonomousCommunities: CatalogOption[];
  educationStages: CatalogOption[];
  profile: UserOppositionProfile | null;
  specialties: CatalogOption[];
};

const initialState = {
  error: "",
};

const dayOptions = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miercoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sabado" },
  { value: "sunday", label: "Domingo" },
];

const goalOptions = [
  "Primera vuelta del temario",
  "Repasar temas",
  "Priorizar practicos",
  "Preparar simulacros",
  "Preparacion general",
];

function SelectField({
  children,
  defaultValue,
  id,
  label,
  name,
}: {
  children: ReactNode;
  defaultValue?: string;
  id: string;
  label: string;
  name: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor={id}>
      {label}
      <select
        className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        defaultValue={defaultValue ?? ""}
        id={id}
        name={name}
        required
      >
        <option value="">Selecciona una opcion</option>
        {children}
      </select>
    </label>
  );
}

export function OnboardingForm({
  autonomousCommunities,
  educationStages,
  profile,
  specialties,
}: OnboardingFormProps) {
  const [state, formAction, pending] = useActionState(
    saveOnboardingAction,
    initialState,
  );
  const selectedDays = new Set(profile?.available_days ?? []);

  return (
    <form action={formAction} className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SelectField
          defaultValue={profile?.education_stage_id ?? ""}
          id="education_stage_id"
          label="Etapa educativa"
          name="education_stage_id"
        >
          {educationStages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.name}
            </option>
          ))}
        </SelectField>

        <SelectField
          defaultValue={profile?.specialty_id ?? ""}
          id="specialty_id"
          label="Especialidad"
          name="specialty_id"
        >
          {specialties.map((specialty) => (
            <option key={specialty.id} value={specialty.id}>
              {specialty.name}
            </option>
          ))}
        </SelectField>

        <SelectField
          defaultValue={profile?.autonomous_community_id ?? ""}
          id="autonomous_community_id"
          label="Comunidad autonoma"
          name="autonomous_community_id"
        >
          {autonomousCommunities.map((community) => (
            <option key={community.id} value={community.id}>
              {community.name}
            </option>
          ))}
        </SelectField>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Input
          defaultValue={profile?.opposition_date ?? ""}
          id="opposition_date"
          label="Fecha de oposicion"
          name="opposition_date"
          required
          type="date"
        />
        <Input
          defaultValue={profile?.weekly_available_hours ?? 12}
          id="weekly_available_hours"
          label="Horas disponibles por semana"
          min={1}
          name="weekly_available_hours"
          required
          type="number"
        />
        <SelectField
          defaultValue={profile?.main_goal ?? "Preparacion general"}
          id="main_goal"
          label="Objetivo principal"
          name="main_goal"
        >
          {goalOptions.map((goal) => (
            <option key={goal} value={goal}>
              {goal}
            </option>
          ))}
        </SelectField>
      </div>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-medium text-slate-700">
          Dias disponibles
        </legend>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {dayOptions.map((day) => (
            <label
              className="flex h-11 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700"
              key={day.value}
            >
              <input
                className="h-4 w-4 rounded border-slate-300 text-violet-700 focus:ring-violet-500"
                defaultChecked={selectedDays.has(day.value)}
                name="available_days"
                type="checkbox"
                value={day.value}
              />
              {day.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          defaultValue={profile?.default_topic_duration_minutes ?? 60}
          id="default_topic_duration_minutes"
          label="Tiempo por defecto para tema"
          min={1}
          name="default_topic_duration_minutes"
          required
          type="number"
        />
        <Input
          defaultValue={profile?.default_practical_duration_minutes ?? 90}
          id="default_practical_duration_minutes"
          label="Tiempo por defecto para practico"
          min={1}
          name="default_practical_duration_minutes"
          required
          type="number"
        />
      </div>

      {state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button disabled={pending} type="submit">
          {pending ? "Guardando..." : "Guardar y continuar"}
        </Button>
      </div>
    </form>
  );
}
