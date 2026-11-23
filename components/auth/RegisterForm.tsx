"use client";

import { useActionState } from "react";
import { signUpAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: { error: string; message?: string } = {
  error: "",
};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    signUpAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 grid grid-cols-1 gap-4">
      <Input
        id="full_name"
        label="Nombre completo"
        name="full_name"
        placeholder="Tu nombre completo"
        required
      />
      <Input
        id="email"
        label="Email"
        name="email"
        placeholder="tu@email.com"
        required
        type="email"
      />
      <Input
        id="password"
        label="Contraseña"
        minLength={6}
        name="password"
        placeholder="Elige una contraseña"
        required
        type="password"
      />
      {state.error ? (
        <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p role="status" className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-800">
          {state.message}
        </p>
      ) : null}
      <Button className="mt-2 w-full" size="lg" disabled={pending} type="submit">
        {pending ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </form>
  );
}
