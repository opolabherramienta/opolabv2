"use server";

import { createClient } from "@/lib/supabase/server";

export type WaitlistState = {
  status: "idle" | "ok" | "error";
  message: string;
};

const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function text(formData: FormData, field: string, max: number) {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function joinWaitlistAction(
  _prevState: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  // Hidden field that only bots fill in: pretend it worked and store nothing.
  if (text(formData, "website", 200)) {
    return { status: "ok", message: "" };
  }

  const email = text(formData, "email", 254).toLowerCase();

  if (!emailPattern.test(email)) {
    return { status: "error", message: "Escribe un correo válido para poder avisarte." };
  }

  if (formData.get("consent") !== "on") {
    return {
      status: "error",
      message: "Marca la casilla para que podamos guardar tu correo y avisarte.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("waitlist").insert({
    email,
    specialty: text(formData, "specialty", 80) || null,
    community: text(formData, "community", 80) || null,
  });

  // Already on the list: for the visitor that is the same good news.
  if (error && error.code !== "23505") {
    console.error("No se pudo guardar en la lista de espera:", error.message);

    return {
      status: "error",
      message: "No hemos podido apuntarte ahora mismo. Inténtalo de nuevo en un rato.",
    };
  }

  return { status: "ok", message: "" };
}
