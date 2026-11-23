"use client";

import { useActionState } from "react";
import { updatePasswordAction } from "@/app/auth/password-actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: { error: string; message?: string } = {
  error: "",
};

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 grid gap-4">
      <Input
        autoComplete="new-password"
        id="password"
        label="Contraseña nueva"
        minLength={8}
        name="password"
        placeholder="Mínimo 8 caracteres"
        required
        type="password"
      />
      <Input
        autoComplete="new-password"
        id="password_confirmation"
        label="Repite la contraseña"
        minLength={8}
        name="password_confirmation"
        required
        type="password"
      />
      {state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <Button className="mt-2 w-full" disabled={pending} type="submit">
        {pending ? "Guardando..." : "Guardar contraseña"}
      </Button>
    </form>
  );
}
