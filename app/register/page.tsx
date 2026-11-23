import { RegisterForm } from "@/components/auth/RegisterForm";
import { Card } from "@/components/ui/Card";
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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-950">Crear cuenta</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Crea tu cuenta para empezar a planificar tu oposición.
        </p>
        <RegisterForm />
      </Card>
    </main>
  );
}
