import { Ball } from "@/components/ui/Ball";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-5 py-16 text-center">
      <Ball number="?" size="lg" state="selected" />
      <h1 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">
        Esta bola no está en el bombo
      </h1>
      <p className="max-w-md text-base leading-7 text-slate-600">
        La página que buscas no existe o ha cambiado de sitio.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button href="/dashboard">Ir a Inicio</Button>
        <Button href="/" variant="secondary">
          Portada
        </Button>
      </div>
    </main>
  );
}
