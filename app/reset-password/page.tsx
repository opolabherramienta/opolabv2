import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/forgot-password?enlace=caducado");
  }

  return (
    <AuthShell
      description={`Vas a cambiar la contraseña de ${user.email}.`}
      title="Crear contraseña nueva"
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
