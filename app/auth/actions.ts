"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { friendlyError } from "@/lib/errors";

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

const minPasswordLength = 8;

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  // Teaser mode (see lib/site-mode.ts): registration is closed.
  if (process.env.NEXT_PUBLIC_SITE_MODE === "teaser") {
    return { error: "El registro todavía no está abierto. Abrimos en enero de 2027." };
  }

  const fullName = getRequiredString(formData, "full_name");
  const email = getRequiredString(formData, "email").toLowerCase();
  const passwordValue = formData.get("password");
  const password = typeof passwordValue === "string" ? passwordValue : "";

  if (!fullName || !email || !password) {
    return { error: "Completa tu nombre, tu correo y la contraseña." };
  }

  // The same rule as when changing the password, checked here and not
  // only in the browser.
  if (password.length < minPasswordLength) {
    return {
      error: `La contraseña debe tener al menos ${minPasswordLength} caracteres.`,
    };
  }

  if (formData.get("accept_terms") !== "on") {
    return {
      error: "Para crear la cuenta tienes que aceptar el aviso legal y la política de privacidad.",
    };
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
    console.error("Registro:", error.message);

    return { error: `No se pudo crear la cuenta. ${friendlyError(error)}` };
  }

  if (!data.user) {
    return { error: "No se pudo crear la cuenta. Inténtalo de nuevo." };
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
    return { error: "Escribe tu correo y tu contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Inicio de sesión:", error.message);

    return { error: `No se pudo iniciar sesión. ${friendlyError(error)}` };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/login");
}
