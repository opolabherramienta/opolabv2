import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Card } from "@/components/ui/Card";
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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-950">
          Crear contraseña nueva
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Vas a cambiar la contraseña de {user.email}.
        </p>
        <ResetPasswordForm />
      </Card>
    </main>
  );
}
