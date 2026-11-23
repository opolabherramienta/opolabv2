"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type AuthActionState = {
  error: string;
  message?: string;
};

function getRequiredString(formData: FormData, field: string) {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const fullName = getRequiredString(formData, "full_name");
  const email = getRequiredString(formData, "email").toLowerCase();
  const passwordValue = formData.get("password");
  const password = typeof passwordValue === "string" ? passwordValue : "";

  if (!fullName || !email || !password) {
    return { error: "Completa nombre, email y contrasena." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { error: `No se pudo crear la cuenta: ${error.message}` };
  }

  if (!data.user) {
    return { error: "No se pudo crear la cuenta. Intentalo de nuevo." };
  }

  // Profile creation belongs to the Auth database trigger, including when
  // email confirmation is enabled and signUp returns no authenticated session.
  if (!data.session) {
    return {
      error: "",
      message: "Revisa tu correo para confirmar la cuenta. Después podrás iniciar sesión.",
    };
  }

  redirect("/onboarding");
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
) {
  const email = getRequiredString(formData, "email").toLowerCase();
  const passwordValue = formData.get("password");
  const password = typeof passwordValue === "string" ? passwordValue : "";

  if (!email || !password) {
    return { error: "Introduce email y contrasena." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: `No se pudo iniciar sesion: ${error.message}` };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/login");
}
