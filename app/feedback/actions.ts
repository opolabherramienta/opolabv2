"use server";

import { createClient } from "@/lib/supabase/server";

export type FeedbackState = {
  status: "idle" | "sent" | "error";
  message: string;
};

const MAX_LENGTH = 4000;
/** Messages one account may send in an hour. */
const HOURLY_LIMIT = 10;

export async function sendFeedbackAction(
  _prevState: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const textValue = formData.get("message");
  const pageValue = formData.get("page");
  const text = typeof textValue === "string" ? textValue.trim() : "";
  // Only a path of this site, never a full address typed by someone else.
  const page =
    typeof pageValue === "string" && /^\/[\w\-/]{0,150}$/.test(pageValue) ? pageValue : null;

  if (text.length < 3) {
    return { status: "error", message: "Cuéntanos qué ha pasado, aunque sea en una frase." };
  }

  if (text.length > MAX_LENGTH) {
    return {
      status: "error",
      message: `El mensaje es demasiado largo. Déjalo en ${MAX_LENGTH} caracteres como mucho.`,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Tu sesión ha caducado. Vuelve a entrar y envíalo otra vez." };
  }

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recent = await supabase
    .from("feedback")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", hourAgo);

  if (!recent.error && (recent.count ?? 0) >= HOURLY_LIMIT) {
    return {
      status: "error",
      message: "Nos has escrito muchas veces seguidas. Espera un rato y sigue contándonos.",
    };
  }

  const { error } = await supabase.from("feedback").insert({ message: text, page });

  if (error) {
    console.error("Cuéntanos qué falla:", error.message);

    return {
      status: "error",
      message:
        "No se pudo enviar el mensaje. Copia el texto para no perderlo y vuelve a probar en un momento.",
    };
  }

  return { status: "sent", message: "Recibido. Gracias: lo leemos todo." };
}
