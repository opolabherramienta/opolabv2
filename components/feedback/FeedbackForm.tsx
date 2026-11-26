"use client";

import { useActionState, useState } from "react";
import { sendFeedbackAction, type FeedbackState } from "@/app/feedback/actions";
import { Button } from "@/components/ui/Button";
import { fieldClasses } from "@/components/ui/Input";

const initialState: FeedbackState = { status: "idle", message: "" };

export function FeedbackForm({ page }: { page: string | null }) {
  const [state, formAction, pending] = useActionState(sendFeedbackAction, initialState);
  // Kept here so a failed send does not wipe what the user wrote.
  const [text, setText] = useState("");

  if (state.status === "sent") {
    return (
      <div className="space-y-4">
        <p
          className="rounded-xl bg-emerald-50 px-3.5 py-3 text-[15px] font-medium text-emerald-900"
          role="status"
        >
          {state.message}
        </p>
        <Button href={page ?? "/dashboard"} variant="secondary">
          Volver a donde estaba
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4">
      <input name="page" type="hidden" value={page ?? ""} />
      <label className="grid grid-cols-1 gap-2 text-sm font-semibold text-slate-700">
        Qué ha pasado, qué esperabas o qué echas de menos
        <textarea
          className={`${fieldClasses} h-auto min-h-40 py-3`}
          maxLength={4000}
          name="message"
          onChange={(event) => setText(event.target.value)}
          placeholder="Por ejemplo: he marcado un repaso como hecho y al recalcular me ha vuelto a salir."
          required
          value={text}
        />
      </label>
      {page ? (
        <p className="text-sm text-slate-500">
          Lo enviamos junto con la pantalla desde la que vienes ({page}), para
          encontrarlo antes.
        </p>
      ) : null}
      {state.status === "error" ? (
        <p
          className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}
      <div>
        <Button disabled={pending} size="lg" type="submit">
          {pending ? "Enviando…" : "Enviar"}
        </Button>
      </div>
    </form>
  );
}
