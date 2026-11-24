import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { isTeaserMode } from "@/lib/site-mode";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      description="Entra para seguir donde lo dejaste."
      footer={
        <>
          <Link className="text-violet-700" href="/forgot-password">
            He olvidado mi contraseña
          </Link>
          {isTeaserMode ? null : (
            <Link className="text-violet-700" href="/register">
              Crear cuenta
            </Link>
          )}
        </>
      }
      title="Hola de nuevo"
    >
      <LoginForm />
    </AuthShell>
  );
}
