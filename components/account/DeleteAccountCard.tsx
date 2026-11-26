"use client";

import { useActionState, useState } from "react";
import { deleteAccountAction, type DeleteAccountState } from "@/app/account/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const initialState: DeleteAccountState = { error: "" };

export function DeleteAccountCard() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(deleteAccountAction, initialState);

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-950">Borrar mi cuenta</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        Se eliminan tu cuenta y todo lo que has guardado: temas, prácticos,
        calendario, progreso y notas. No se puede deshacer.
      </p>

      {open ? (
        <form action={formAction} className="mt-4 grid max-w-sm grid-cols-1 gap-3">
          <Input
            autoComplete="off"
            id="delete_confirmation"
            label="Escribe BORRAR para confirmar"
            name="confirmation"
            required
          />
          {state.error ? (
            <p
              className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700"
              role="alert"
            >
              {state.error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex h-11 items-center rounded-xl bg-red-600 px-4 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              disabled={pending}
              type="submit"
            >
              {pending ? "Borrando…" : "Borrar mi cuenta para siempre"}
            </button>
            <Button onClick={() => setOpen(false)} type="button" variant="secondary">
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-4">
          <Button onClick={() => setOpen(true)} type="button" variant="secondary">
            Quiero borrar mi cuenta
          </Button>
        </div>
      )}
    </Card>
  );
}
