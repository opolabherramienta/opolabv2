"use client";

import { useActionState } from "react";
import { requestPasswordResetAction } from "@/app/auth/password-actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: { error: string; message?: string } = {
  error: "",
};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 grid grid-cols-1 gap-4">
      <Input
        autoComplete="email"
        id="email"
        label="Email"
        name="email"
        placeholder="tu@email.com"
        required
        type="email"
      />
      {state.error ? (
        <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p
          className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-800"
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      <Button className="mt-2 w-full" size="lg" disabled={pending} type="submit">
        {pending ? "Enviando..." : "Enviar enlace"}
      </Button>
    </form>
  );
}
