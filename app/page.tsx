import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-violet-700">
            Opolab Planner
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
            Planifica tu oposición docente sin estudiar a ciegas.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Organiza tus temas, prácticos, repasos y simulacros en un calendario
            pensado para opositores.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/register">Crear cuenta</Button>
            <Button href="/login" variant="secondary">
              Iniciar sesión
            </Button>
          </div>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          <Card>
            <h2 className="font-semibold text-slate-950">Temas ordenados</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Vista base para distribuir estudio, repasos y simulacros.
            </p>
          </Card>
          <Card>
            <h2 className="font-semibold text-slate-950">Progreso visible</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Indicadores preparados para medir avance sin conectar datos aún.
            </p>
          </Card>
          <Card>
            <h2 className="font-semibold text-slate-950">Avisos claros</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Espacios para prioridades, retrasos y próximas tareas.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
