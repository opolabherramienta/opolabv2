"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { friendlyError } from "@/lib/errors";

type PasswordActionState = {
  error: string;
  message?: string;
};

const minPasswordLength = 8;

// Prefer the configured public URL. The request host is only a fallback for
// local development: Supabase rejects any redirect outside its allowlist.
async function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");

  if (!host) {
    return null;
  }

  const protocol =
    headerList.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${protocol}://${host}`;
}

export async function requestPasswordResetAction(
  _prevState: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const emailValue = formData.get("email");
  const email =
    typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";

  if (!email) {
    return { error: "Introduce tu email." };
  }

  const siteUrl = await getSiteUrl();

  if (!siteUrl) {
    return { error: "No se pudo preparar el enlace. Inténtalo de nuevo." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/recovery`,
  });

  if (error && error.status === 429) {
    return {
      error: "Has pedido demasiados enlaces. Espera unos minutos y vuelve a intentarlo.",
    };
  }

  // Same answer whether or not the address has an account, so this form
  // cannot be used to discover which emails are registered.
  return {
    error: "",
    message:
      "Si hay una cuenta con ese email, te hemos enviado un enlace para crear una contraseña nueva. Revisa también la carpeta de spam.",
  };
}

export async function updatePasswordAction(
  _prevState: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const passwordValue = formData.get("password");
  const confirmationValue = formData.get("password_confirmation");
  const password = typeof passwordValue === "string" ? passwordValue : "";
  const confirmation =
    typeof confirmationValue === "string" ? confirmationValue : "";

  if (password.length < minPasswordLength) {
    return {
      error: `La contraseña debe tener al menos ${minPasswordLength} caracteres.`,
    };
  }

  if (password !== confirmation) {
    return { error: "Las dos contraseñas no coinciden." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/forgot-password?enlace=caducado");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error("Cambio de contraseña:", error.message);

    return { error: `No se pudo cambiar la contraseña. ${friendlyError(error)}` };
  }

  redirect("/dashboard");
}
