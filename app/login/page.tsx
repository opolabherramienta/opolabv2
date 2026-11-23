import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card } from "@/components/ui/Card";
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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-950">Iniciar sesión</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Entra con tu email y contraseña.
        </p>
        <LoginForm />
        <div className="mt-5 flex justify-between gap-4 text-sm">
          <Link className="font-medium text-violet-700" href="/forgot-password">
            He olvidado mi contraseña
          </Link>
          <Link className="font-medium text-violet-700" href="/register">
            Crear cuenta
          </Link>
        </div>
      </Card>
    </main>
  );
}
