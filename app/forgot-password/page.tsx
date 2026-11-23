import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Card } from "@/components/ui/Card";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const linkExpired = (await searchParams).enlace === "caducado";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-950">
          Recuperar contraseña
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Escribe el email de tu cuenta y te enviaremos un enlace para crear
          una contraseña nueva.
        </p>
        {linkExpired ? (
          <p className="mt-4 rounded-md bg-orange-50 px-3 py-2 text-sm text-orange-800">
            El enlace ya no es válido o ha caducado. Pide uno nuevo.
          </p>
        ) : null}
        <ForgotPasswordForm />
        <div className="mt-5 text-sm">
          <Link className="font-medium text-violet-700" href="/login">
            Volver a iniciar sesión
          </Link>
        </div>
      </Card>
    </main>
  );
}
