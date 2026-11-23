import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const features = [
  {
    title: "Tu temario, tema a tema",
    body: "Elige los temas que vas a llevar y marca en cada uno si tienes el resumen, si lo has estudiado, cuántos repasos llevas y cuánto lo dominas.",
  },
  {
    title: "Los prácticos no se quedan para el final",
    body: "Apunta cada supuesto práctico, cuántas veces lo has trabajado y cuáles tienes ya dominados.",
  },
  {
    title: "Un calendario solo para la oposición",
    body: "Reparte sesiones de temas, prácticos y descanso por días y marca lo que vas cumpliendo.",
  },
  {
    title: "Sabes cómo vas",
    body: "Días que faltan para el examen, temas estudiados, prácticos dominados y sesiones cumplidas, en una sola pantalla.",
  },
];

const steps = [
  {
    title: "Dinos qué preparas",
    body: "Especialidad, comunidad autónoma, fecha del examen y horas que tienes a la semana.",
  },
  {
    title: "Elige tus temas",
    body: "Cargamos el temario oficial de tu especialidad y tú decides cuáles llevas.",
  },
  {
    title: "Estudia y apunta",
    body: "Cada sesión que cumples actualiza tu progreso. Tú solo te ocupas de estudiar.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-xl font-bold text-violet-800">Opolab</span>
        <Link
          className="text-sm font-semibold text-violet-800 hover:text-violet-900"
          href="/login"
        >
          Iniciar sesión
        </Link>
      </header>

      <section className="mx-auto w-full max-w-6xl px-6 pt-10 pb-16 sm:pt-16">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-violet-700">
            Para opositores a profesorado de Secundaria
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
            Deja de preguntarte si llegas al examen.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Opolab ordena tu temario, tus prácticos y tus semanas de estudio
            para que veas de un vistazo qué llevas hecho y qué te falta.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/register">Crear cuenta gratis</Button>
            <Button href="/login" variant="secondary">
              Ya tengo cuenta
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title}>
              <h2 className="font-semibold text-slate-950">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {feature.body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Empiezas en cinco minutos
          </h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-800">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-semibold text-slate-950">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">
          Tu oposición, organizada desde hoy.
        </h2>
        <div className="mt-6 flex justify-center">
          <Button href="/register">Crear cuenta gratis</Button>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-6 py-6 text-center text-sm text-slate-500">
        Opolab · Hecho por y para opositores
      </footer>
    </main>
  );
}
