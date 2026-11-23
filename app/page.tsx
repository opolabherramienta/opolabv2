import Link from "next/link";
import { Ball, ballStateLabels, type BallState } from "@/components/ui/Ball";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";

// Illustrative temario: 75 balls part-way through a preparation.
const heroBalls: BallState[] = Array.from({ length: 75 }, (_, index) => {
  const n = index + 1;

  if (n % 11 === 0 || n % 13 === 0) return "off";
  if (n <= 14 || n % 9 === 0) return "mastered";
  if (n <= 31 || n % 7 === 0) return "studied";
  if (n <= 44 || n % 5 === 0) return "started";
  return "selected";
});

const legend: BallState[] = ["selected", "started", "studied", "mastered"];

const features: Array<{ icon: IconName; title: string; body: string; tone: string }> = [
  {
    icon: "balls",
    title: "Tu temario, bola a bola",
    body: "Elige los temas que llevas y marca en cada uno el resumen, el estudio, los repasos y cuánto lo dominas. Cada bola cambia de color contigo.",
    tone: "bg-violet-100 text-violet-700",
  },
  {
    icon: "flask",
    title: "Los prácticos no se quedan para mayo",
    body: "Apunta cada supuesto, cuántas veces lo has trabajado y cuáles tienes ya dominados.",
    tone: "bg-yellow-100 text-yellow-800",
  },
  {
    icon: "calendar",
    title: "Un calendario solo para la oposición",
    body: "Reparte sesiones de temas, prácticos y descanso, y ve tachando lo que cumples.",
    tone: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: "chart",
    title: "Sabes cómo vas",
    body: "Días que faltan, temas estudiados, prácticos dominados y sesiones cumplidas en una sola pantalla.",
    tone: "bg-red-100 text-red-700",
  },
];

const steps = [
  {
    title: "Dinos qué preparas",
    body: "Especialidad, comunidad autónoma, fecha del examen y horas que tienes a la semana.",
  },
  {
    title: "Elige tus bolas",
    body: "Cargamos el temario oficial de tu especialidad y tú decides qué temas llevas.",
  },
  {
    title: "Estudia y ve pintándolas",
    body: "Cada sesión que cumples cambia el color de tus bolas y acerca tu progreso al examen.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-clip">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <span className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-boli font-display text-lg font-extrabold text-white shadow-[inset_0_-3px_0_var(--color-boli-edge)]">
            O
          </span>
          <span className="font-display text-xl font-extrabold text-slate-950">
            Opolab
          </span>
        </span>
        <Button href="/login" size="sm" variant="secondary">
          Iniciar sesión
        </Button>
      </header>

      <section className="mx-auto grid grid-cols-1 w-full max-w-6xl items-center gap-12 px-5 pt-8 pb-16 lg:grid-cols-[1fr_1.05fr] lg:pt-14 lg:pb-24">
        <div>
          <p className="text-base font-bold text-violet-700">
            Para opositores a profesorado de Secundaria
          </p>
          <h1 className="mt-4 text-[2.6rem] leading-[1.02] font-extrabold text-slate-950 sm:text-6xl lg:text-[4.2rem]">
            Que la bola que salga sea{" "}
            <span className="subrayado">una de las tuyas.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Opolab ordena tu temario, tus prácticos y tus semanas de estudio
            para que veas, bola a bola, qué te sabes y qué te falta antes del
            examen.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button href="/register" size="lg">
              Crear cuenta gratis
            </Button>
            <Button href="/login" size="lg" variant="secondary">
              Ya tengo cuenta
            </Button>
          </div>
        </div>

        <div className="edge relative p-5 sm:p-7">
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-display text-xl font-extrabold text-slate-950">
              Tu temario
            </p>
            <p className="text-sm font-semibold text-slate-500">
              75 temas, 75 bolas
            </p>
          </div>
          <div
            aria-hidden
            className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(2.1rem,1fr))] gap-1.5 sm:gap-2"
          >
            {heroBalls.map((state, index) => (
              <Ball
                className="animate-drop !h-auto !w-full aspect-square"
                key={index}
                number={index + 1}
                size="sm"
                state={state}
                style={{ animationDelay: `${index * 14}ms` }}
              />
            ))}
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-600">
            {legend.map((state) => (
              <li className="flex items-center gap-2" key={state}>
                <Ball className="!h-4 !w-4" number="" size="sm" state={state} />
                {ballStateLabels[state]}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <article className="edge flex gap-4 p-5 sm:p-6" key={feature.title}>
              <span
                className={[
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                  feature.tone,
                ].join(" ")}
              >
                <Icon name={feature.icon} size={26} />
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-slate-950">
                  {feature.title}
                </h2>
                <p className="mt-1.5 text-[15px] leading-6 text-slate-600">
                  {feature.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cuadricula border-y-2 border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-16">
          <h2 className="text-3xl font-extrabold text-slate-950">
            Empiezas en cinco minutos
          </h2>
          <ol className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <li className="edge p-5" key={step.title}>
                <Ball number={index + 1} size="lg" state="studied" />
                <h3 className="mt-4 text-lg font-extrabold text-slate-950">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-[15px] leading-6 text-slate-600">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-20 text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-extrabold text-slate-950 sm:text-4xl">
          Tu oposición, organizada desde hoy.
        </h2>
        <div className="mt-8 flex justify-center">
          <Button href="/register" size="lg">
            Crear cuenta gratis
          </Button>
        </div>
      </section>

      <footer className="border-t-2 border-slate-200 px-5 py-6 text-center text-sm font-medium text-slate-500">
        Opolab, hecho por y para opositores.{" "}
        <Link className="font-bold text-violet-700" href="/login">
          Iniciar sesión
        </Link>
      </footer>
    </main>
  );
}
