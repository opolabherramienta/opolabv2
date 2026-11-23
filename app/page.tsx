import Link from "next/link";
import { Ball, ballStateLabels, type BallState } from "@/components/ui/Ball";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { ProgressBar, ProgressRing } from "@/components/ui/Progress";

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
    tone: "bg-boli text-white shadow-[0_4px_0_var(--color-boli-edge)]",
  },
  {
    icon: "flask",
    title: "Los prácticos no se quedan para mayo",
    body: "Apunta cada supuesto, cuántas veces lo has trabajado y cuáles tienes ya dominados.",
    tone: "bg-subrayador text-slate-900 shadow-[0_4px_0_var(--color-subrayador-edge)]",
  },
  {
    icon: "calendar",
    title: "Un calendario solo para la oposición",
    body: "Reparte sesiones de temas, prácticos y descanso, y ve tachando lo que cumples.",
    tone: "bg-aprobado text-white shadow-[0_4px_0_var(--color-aprobado-edge)]",
  },
  {
    icon: "chart",
    title: "Sabes cómo vas",
    body: "Días que faltan, temas estudiados, prácticos dominados y sesiones cumplidas en una sola pantalla.",
    tone: "bg-azul text-white shadow-[0_4px_0_var(--color-azul-edge)]",
  },
];

const steps = [
  {
    title: "Dinos qué preparas",
    body: "Especialidad, comunidad autónoma, fecha del examen y horas que tienes a la semana.",
    state: "started" as BallState,
  },
  {
    title: "Elige tus bolas",
    body: "Cargamos el temario oficial de tu especialidad y tú decides qué temas llevas.",
    state: "studied" as BallState,
  },
  {
    title: "Estudia y ve pintándolas",
    body: "Cada sesión que cumples cambia el color de tus bolas y acerca tu progreso al examen.",
    state: "mastered" as BallState,
  },
];

const sampleSessions: Array<{ icon: IconName; title: string; kind: string; tone: string; done: boolean }> = [
  {
    icon: "balls",
    title: "Tema 14: La célula eucariota",
    kind: "Tema",
    tone: "bg-violet-100 text-violet-700",
    done: true,
  },
  {
    icon: "flask",
    title: "Problemas de genética",
    kind: "Práctico",
    tone: "bg-amber-100 text-amber-700",
    done: false,
  },
  {
    icon: "repeat",
    title: "Repaso de los temas 1 a 5",
    kind: "Tema",
    tone: "bg-violet-100 text-violet-700",
    done: false,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-clip">
      {/* Hero */}
      <section className="relative overflow-hidden bg-boli text-white">
        <span aria-hidden className="absolute -top-28 -left-24 h-80 w-80 rounded-full bg-white/10" />
        <span aria-hidden className="absolute top-36 left-[43%] hidden h-14 w-14 rounded-full bg-subrayador lg:block" />
        <span aria-hidden className="absolute -right-20 -bottom-24 h-96 w-96 rounded-full bg-aprobado/35" />
        <span aria-hidden className="absolute right-[38%] bottom-10 hidden h-8 w-8 rounded-full bg-azul lg:block" />

        <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
          <Logo height={44} variant="blanco" />
          <Button href="/login" size="sm" variant="glass">
            Iniciar sesión
          </Button>
        </header>

        <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-5 pt-8 pb-20 lg:grid-cols-[1fr_1.05fr] lg:pt-12 lg:pb-28">
          <div>
            <p className="inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold">
              Para opositores a profesorado de Secundaria
            </p>
            <h1 className="mt-5 text-[2.7rem] leading-[1.04] font-extrabold sm:text-6xl lg:text-[4.3rem]">
              Que la bola que salga sea{" "}
              <span className="inline-block rounded-[0.35em] bg-aprobado px-[0.22em] pb-[0.06em] shadow-[0_5px_0_var(--color-aprobado-edge)]">
                una de las tuyas.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-violet-50">
              OpoLab ordena tu temario, tus prácticos y tus semanas de estudio
              para que veas, bola a bola, qué te sabes y qué te falta antes
              del examen.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Button href="/register" size="lg" variant="light">
                Crear cuenta gratis
              </Button>
              <Button href="/login" size="lg" variant="glass">
                Ya tengo cuenta
              </Button>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-white p-5 text-slate-950 shadow-[0_8px_0_var(--color-boli-edge)] sm:p-7 lg:rotate-1">
            <div className="flex items-baseline justify-between gap-4">
              <p className="font-display text-xl font-extrabold">Tu temario</p>
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
        </div>
      </section>

      {/* Inside the app */}
      <section className="mx-auto w-full max-w-6xl px-5 py-20">
        <h2 className="max-w-2xl text-3xl font-extrabold text-slate-950 sm:text-4xl">
          Abres OpoLab y sabes qué toca hoy
        </h2>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">
          Sin hojas de cálculo ni agendas a medias. Tres pantallas y tu
          oposición entera a la vista.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-boli p-6 text-white shadow-[0_6px_0_var(--color-boli-edge)]">
            <span aria-hidden className="absolute -top-10 -right-8 h-36 w-36 rounded-full bg-white/10" />
            <p className="relative text-base font-bold text-violet-100">Hola, Silvia</p>
            <p className="relative mt-2 font-display text-7xl leading-none font-extrabold tabular-nums">
              207
            </p>
            <p className="relative mt-1 text-xl font-extrabold">
              días para tu examen
            </p>
            <div className="relative mt-6 flex items-center gap-4 rounded-2xl bg-white p-4 text-slate-950">
              <ProgressRing size={76} stroke={10} tone="aprobado" value={60}>
                <span className="font-display text-lg font-extrabold tabular-nums">
                  3<span className="text-sm text-slate-400">/5</span>
                </span>
              </ProgressRing>
              <div>
                <p className="font-display font-extrabold">Esta semana</p>
                <p className="text-sm font-medium text-slate-500">Te quedan 2</p>
              </div>
            </div>
          </div>

          <div className="edge p-6">
            <p className="font-display text-xl font-extrabold text-slate-950">Hoy</p>
            <ul className="mt-4 grid grid-cols-1 gap-2.5">
              {sampleSessions.map((session) => (
                <li
                  className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 p-3"
                  key={session.title}
                >
                  <span
                    className={[
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                      session.tone,
                    ].join(" ")}
                  >
                    <Icon name={session.icon} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={[
                        "truncate font-bold",
                        session.done ? "text-slate-400 line-through" : "text-slate-950",
                      ].join(" ")}
                    >
                      {session.title}
                    </p>
                    <p className="text-sm font-medium text-slate-500">{session.kind}</p>
                  </div>
                  <span
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                      session.done
                        ? "border-aprobado bg-aprobado text-white shadow-[0_3px_0_var(--color-aprobado-edge)]"
                        : "border-slate-200 text-slate-300",
                    ].join(" ")}
                  >
                    <Icon name="check" size={20} />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="edge p-6">
            <p className="font-display text-xl font-extrabold text-slate-950">
              Vas cogiendo ritmo
            </p>
            <div className="mt-5 space-y-5">
              <ProgressBar detail="27 de 62" label="Temas estudiados" value={44} />
              <ProgressBar
                detail="38 de 62"
                label="Con resumen"
                tone="subrayador"
                value={61}
              />
              <ProgressBar
                detail="2 de 6"
                label="Prácticos dominados"
                tone="aprobado"
                value={33}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y-2 border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-20">
          <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2">
            {features.map((feature) => (
              <article className="flex gap-5" key={feature.title}>
                <span
                  className={[
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl",
                    feature.tone,
                  ].join(" ")}
                >
                  <Icon name={feature.icon} size={28} />
                </span>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-950">
                    {feature.title}
                  </h2>
                  <p className="mt-1.5 text-base leading-7 text-slate-600">
                    {feature.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto w-full max-w-6xl px-5 py-20">
        <h2 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">
          Empiezas en cinco minutos
        </h2>
        <ol className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li className="edge p-6" key={step.title}>
              <Ball number={index + 1} size="lg" state={step.state} />
              <h3 className="mt-4 text-xl font-extrabold text-slate-950">
                {step.title}
              </h3>
              <p className="mt-1.5 text-base leading-7 text-slate-600">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Closing call */}
      <section className="px-5 pb-20">
        <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] bg-boli px-6 py-14 text-center text-white shadow-[0_8px_0_var(--color-boli-edge)] sm:py-20">
          <span aria-hidden className="absolute -top-16 -left-10 h-52 w-52 rounded-full bg-white/10" />
          <span aria-hidden className="absolute -right-12 -bottom-20 h-64 w-64 rounded-full bg-aprobado/40" />
          <span aria-hidden className="absolute top-10 right-[22%] h-10 w-10 rounded-full bg-subrayador" />
          <h2 className="relative mx-auto max-w-2xl text-3xl font-extrabold sm:text-5xl">
            Tu oposición, organizada desde hoy.
          </h2>
          <div className="relative mt-9 flex justify-center">
            <Button href="/register" size="lg" variant="light">
              Crear cuenta gratis
            </Button>
          </div>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-slate-200 bg-white px-5 py-6 text-sm font-medium text-slate-500">
        <Logo height={30} />
        <p>Hecho por y para opositores.</p>
        <Link className="font-bold text-violet-700" href="/login">
          Iniciar sesión
        </Link>
      </footer>
    </main>
  );
}
