"use client";

import { useActionState } from "react";
import { signInAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState = {
  error: "",
};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    signInAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 grid grid-cols-1 gap-4">
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
        name="password"
        placeholder="Tu contraseña"
        required
        type="password"
      />
      {state.error ? (
        <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}
      <Button className="mt-2 w-full" size="lg" disabled={pending} type="submit">
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
