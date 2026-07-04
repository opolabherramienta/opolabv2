import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-950">
          Recuperar contraseña
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Pantalla visual para preparar el flujo de recuperación más adelante.
        </p>
        <form className="mt-6 grid gap-4">
          <Input id="email" label="Email" placeholder="tu@email.com" />
          <Button className="mt-2 w-full">Enviar instrucciones</Button>
        </form>
      </Card>
    </main>
  );
}
