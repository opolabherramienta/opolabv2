import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const linkExpired = (await searchParams).enlace === "caducado";

  return (
    <AuthShell
      description="Escribe el email de tu cuenta y te enviaremos un enlace para crear una contraseña nueva."
      footer={
        <Link className="text-violet-700" href="/login">
          Volver a iniciar sesión
        </Link>
      }
      title="Recuperar contraseña"
    >
      {linkExpired ? (
        <p className="mt-4 rounded-xl bg-yellow-100 px-3.5 py-2.5 text-sm font-medium text-yellow-900">
          El enlace ya no es válido o ha caducado. Pide uno nuevo.
        </p>
      ) : null}
      <ForgotPasswordForm />
    </AuthShell>
  );
}
