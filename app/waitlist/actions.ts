"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { after } from "next/server";
import { sendWaitlistWelcome } from "@/lib/email/send";
import { createClient } from "@/lib/supabase/server";

export type WaitlistState = {
  status: "idle" | "ok" | "error";
  message: string;
};

const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const genericError = "No hemos podido apuntarte ahora mismo. Inténtalo de nuevo en un rato.";

function text(formData: FormData, field: string, max: number) {
  const value = formData.get(field);

  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// A one-way summary of the visitor's address, different every day, so the
// database can count attempts per connection without storing the address.
async function connectionHash() {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || headerList.get("x-real-ip")?.trim() || "unknown";
  const day = new Date().toISOString().slice(0, 10);

  return createHash("sha256").update(`opolab-waitlist:${day}:${address}`).digest("hex");
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

  const specialty = text(formData, "specialty", 80) || null;
  const community = text(formData, "community", 80) || null;
  const supabase = await createClient();

  const { data: outcome, error: rpcError } = await supabase.rpc("join_waitlist", {
    p_email: email,
    p_specialty: specialty ?? "",
    p_community: community ?? "",
    p_ip_hash: await connectionHash(),
  });

  if (!rpcError) {
    // "ok_new" is a first sign-up; plain "ok" is someone already on the list,
    // who gets no second welcome (nobody can flood an inbox by resubmitting).
    if (outcome === "ok_new") {
      after(() => sendWaitlistWelcome(email));

      return { status: "ok", message: "" };
    }

    if (outcome === "ok") {
      return { status: "ok", message: "" };
    }

    if (outcome === "rate_limited") {
      return {
        status: "error",
        message: "Has hecho varios intentos seguidos. Espera un rato y vuelve a probar.",
      };
    }

    if (outcome === "invalid") {
      return { status: "error", message: "Escribe un correo válido para poder avisarte." };
    }

    if (outcome !== "busy") {
      console.error("Respuesta inesperada de la lista de espera:", outcome);
    }

    return { status: "error", message: genericError };
  }

  // The limit function is not in the database yet (its SQL has not been run):
  // fall back to the plain insert so the form keeps working meanwhile.
  if (rpcError.code !== "PGRST202") {
    console.error("No se pudo guardar en la lista de espera:", rpcError.message);

    return { status: "error", message: genericError };
  }

  const { error } = await supabase.from("waitlist").insert({ email, specialty, community });

  // Already on the list: for the visitor that is the same good news.
  if (error && error.code !== "23505") {
    console.error("No se pudo guardar en la lista de espera:", error.message);

    return { status: "error", message: genericError };
  }

  return { status: "ok", message: "" };
}
