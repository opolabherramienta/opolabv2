import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <AuthShell
      description="En cinco minutos tienes tu temario cargado y tu plan en marcha."
      footer={
        <Link className="text-violet-700" href="/login">
          Ya tengo cuenta
        </Link>
      }
      title="Crea tu cuenta"
    >
      <RegisterForm />
    </AuthShell>
  );
}
