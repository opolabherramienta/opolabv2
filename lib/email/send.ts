import "server-only";

import { createHash } from "node:crypto";
import { buildWaitlistWelcome, type EmailContent } from "./welcome";

const defaultFrom = "OpoLab <hola@opolab.net>";
// opolab.net has no mailbox: replies go to the Gmail account.
const defaultReplyTo = "opolabherramienta@gmail.com";

type SendResult = "sent" | "skipped" | "failed";

async function send(to: string, content: EmailContent, idempotencyKey: string): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;

  // No key (local work, or not configured yet): the sign-up still counts.
  if (!apiKey) {
    return "skipped";
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || defaultFrom,
        to: [to],
        reply_to: process.env.EMAIL_REPLY_TO || defaultReplyTo,
        subject: content.subject,
        html: content.html,
        text: content.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error("Resend rechazó el correo de bienvenida:", response.status, await response.text());

      return "failed";
    }

    return "sent";
  } catch (error) {
    console.error("No se pudo enviar el correo de bienvenida:", error);

    return "failed";
  }
}

export async function sendWaitlistWelcome(email: string): Promise<SendResult> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://opolab.net";
  // Same address twice within a day is one email, whatever happens upstream.
  const key = createHash("sha256").update(`waitlist-welcome:${email}`).digest("hex");

  return send(email, buildWaitlistWelcome(siteUrl), `waitlist-welcome-${key}`);
}
