"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type DeleteAccountState = {
  error: string;
};

/** What the user has to type to confirm. */
const CONFIRMATION = "BORRAR";

export async function deleteAccountAction(
  _prevState: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const typed = formData.get("confirmation");

  if (typeof typed !== "string" || typed.trim().toUpperCase() !== CONFIRMATION) {
    return { error: `Escribe ${CONFIRMATION} para confirmar.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // The database deletes the study data and the account of whoever calls it
  // (supabase/proposals/20261126_borrar_cuenta.sql). It takes no id.
  const { error } = await supabase.rpc("delete_my_account");

  if (error) {
    console.error("Borrado de cuenta:", error.message);

    if (/admin account/i.test(error.message)) {
      return {
        error: "La cuenta de administración no se puede borrar desde aquí.",
      };
    }

    return {
      error:
        "No se pudo borrar la cuenta. No se ha eliminado nada. Escríbenos y la borramos nosotros.",
    };
  }

  // The account is gone: drop the session cookies as well.
  await supabase.auth.signOut();

  redirect("/login?cuenta=borrada");
}
