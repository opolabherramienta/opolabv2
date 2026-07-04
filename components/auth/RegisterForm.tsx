"use client";

import { useActionState } from "react";
import { signUpAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState = {
  error: "",
};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    signUpAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 grid gap-4">
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
        label="Contrasena"
        minLength={6}
        name="password"
        placeholder="Elige una contrasena"
        required
        type="password"
      />
      {state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <Button className="mt-2 w-full" disabled={pending} type="submit">
        {pending ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </form>
  );
}
