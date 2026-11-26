import Link from "next/link";
import { LegalLinks } from "@/components/legal/LegalPage";
import { WaitlistForm } from "@/components/landing/waitlist-form";
import { Ball, type BallState } from "@/components/ui/Ball";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { ProgressBar, ProgressRing } from "@/components/ui/Progress";

// A bombo part-way through a preparation, as the app draws it.
const bombo: BallState[] = Array.from({ length: 40 }, (_, index) => {
  const n = index + 1;

  if (n % 11 === 0) return "off";
  if (n <= 8 || n % 9 === 0) return "mastered";
  if (n <= 17 || n % 7 === 0) return "studied";
  if (n <= 24 || n % 5 === 0) return "started";
  return "selected";
});

const today: Array<{ icon: IconName; title: string; kind: string; tone: string; done: boolean }> = [
  {
    icon: "balls",
    title: "Tema 15: El sistema inmunitario",
    kind: "Tema nuevo, 1 h 30 min",
    tone: "bg-violet-100 text-violet-700",
    done: true,
  },
  {
    icon: "repeat",
    title: "Repaso: Tema 12",
    kind: "Repaso, 30 min",
    tone: "bg-sky-100 text-sky-700",
    done: false,
  },
  {
    icon: "flask",
    title: "Práctico: Claves dicotómicas",
    kind: "Práctico, 1 h",
    tone: "bg-yellow-100 text-yellow-900",
    done: false,
  },
];

const reviews = [
  { day: "+3", label: "días" },
  { day: "+7", label: "días" },
  { day: "+14", label: "días" },
  { day: "+30", label: "días" },
];

const facts: Array<{ icon: IconName; title: string; body: string }> = [
  {
    icon: "target",
    title: "Un plan que se hace solo",
    body: "Le dices tu fecha de examen y tus horas. OpoLab reparte temas, repasos, prácticos y simulacros hasta el día del examen.",
  },
  {
    icon: "repeat",
    title: "Repasos cuando toca",
    body: "Cada tema vuelve a los 3, 7, 14 y 30 días, que es cuando empieza a olvidarse.",
  },
  {
    icon: "flame",
    title: "Constancia que se ve",
    body: "Racha, experiencia y niveles para los días en que cuesta sentarse.",
  },
];

export function Teaser() {
  return (
    <main className="min-h-screen overflow-x-clip">
      {/* Hero */}
      <section className="relative overflow-hidden bg-boli text-white">
        <span aria-hidden className="absolute -top-28 -left-24 h-80 w-80 rounded-full bg-white/10" />
        <span aria-hidden className="absolute -right-24 -bottom-28 h-96 w-96 rounded-full bg-aprobado/35" />
        <span aria-hidden className="absolute top-40 left-[46%] hidden h-12 w-12 rounded-full bg-subrayador lg:block" />
        <span aria-hidden className="absolute bottom-16 left-[8%] hidden h-7 w-7 rounded-full bg-azul lg:block" />

        <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
          <Logo height={44} variant="blanco" />
          <Button href="#lista" size="sm" variant="glass">
            Avísame
          </Button>
        </header>

        <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-5 pt-6 pb-20 lg:grid-cols-[1.1fr_1fr] lg:gap-14 lg:pt-12 lg:pb-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-subrayador" />
              Abrimos en enero de 2027
            </p>
            <h1 className="mt-5 text-[2.6rem] leading-[1.04] font-extrabold sm:text-6xl lg:text-[4.2rem]">
              Algo se está cociendo{" "}
              <span className="inline-block rounded-[0.35em] bg-aprobado px-[0.22em] pb-[0.06em] shadow-[0_5px_0_var(--color-aprobado-edge)]">
                en el laboratorio.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-violet-50">
              OpoLab es el planificador para opositores a profesorado de
              Secundaria: tu temario en bolas, un plan de estudio que se hace
              solo y repasos que llegan cuando toca.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-2.5" aria-hidden>
              {(["mastered", "studied", "started", "selected"] as BallState[]).map(
                (state, index) => (
                  <Ball
                    className="animate-drop"
                    key={state}
                    number={[14, 27, 52, "?"][index]}
                    size="lg"
                    state={state}
                    style={{ animationDelay: `${index * 110}ms` }}
                  />
                ),
              )}
              <p className="ml-1 max-w-[13rem] text-sm leading-5 font-semibold text-violet-100">
                Que la bola que salga sea una de las tuyas.
              </p>
            </div>
          </div>

          <div className="scroll-mt-6" id="lista">
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* Presentation video */}
      <section className="mx-auto w-full max-w-6xl px-5 pt-16 sm:pt-20">
        <h2 className="max-w-2xl text-3xl font-extrabold text-slate-950 sm:text-4xl">
          OpoLab en un minuto
        </h2>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">
          Del bombo al plan de estudio: así funciona por dentro.
        </p>
        <div className="mt-8 overflow-hidden rounded-[1.75rem] border-2 border-b-[6px] border-slate-200 bg-boli">
          <video
            aria-label="Vídeo de presentación de OpoLab"
            className="block aspect-video w-full"
            controls
            playsInline
            poster="/video/opolab-presentacion.jpg"
            preload="none"
          >
            <source src="/video/opolab-presentacion.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      {/* A look inside */}
      <section className="mx-auto w-full max-w-6xl px-5 pt-16 sm:pt-20">
        <p className="text-sm font-extrabold tracking-wide text-violet-700 uppercase">
          Un vistazo antes de abrir
        </p>
        <h2 className="mt-2 max-w-2xl text-3xl font-extrabold text-slate-950 sm:text-4xl">
          Abres OpoLab y sabes qué toca hoy
        </h2>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-600">
          Sin hojas de cálculo ni agendas a medias. Esto es lo que ya funciona
          por dentro.
        </p>

        <div className="mt-9 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <article className="edge p-5 sm:p-6">
            <p className="font-display text-xl font-extrabold text-slate-950">Tu bombo</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Cada tema es una bola y cambia de color según lo preparado que
              lo tengas.
            </p>
            <div
              aria-hidden
              className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(1.9rem,1fr))] gap-1.5"
            >
              {bombo.map((state, index) => (
                <Ball
                  className="!h-auto !w-full aspect-square"
                  key={index}
                  number={index + 1}
                  size="sm"
                  state={state}
                />
              ))}
            </div>
          </article>

          <article className="edge p-5 sm:p-6">
            <div className="flex items-center gap-3.5">
              <ProgressRing size={64} stroke={9} tone="aprobado" value={33}>
                <span className="font-display text-base font-extrabold tabular-nums">
                  1<span className="text-xs text-slate-400">/3</span>
                </span>
              </ProgressRing>
              <div>
                <p className="font-display text-xl font-extrabold text-slate-950">Hoy</p>
                <p className="text-sm font-medium text-slate-500">Te quedan 2 sesiones</p>
              </div>
            </div>
            <ul className="mt-4 grid grid-cols-1 gap-2">
              {today.map((session) => (
                <li
                  className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 p-2.5"
                  key={session.title}
                >
                  <span
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      session.done ? "bg-emerald-100 text-aprobado-edge" : session.tone,
                    ].join(" ")}
                  >
                    <Icon name={session.icon} size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={[
                        "truncate text-[15px] font-bold",
                        session.done ? "text-slate-400 line-through" : "text-slate-950",
                      ].join(" ")}
                    >
                      {session.title}
                    </p>
                    <p className="text-xs font-medium text-slate-500">{session.kind}</p>
                  </div>
                  <span
                    className={[
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2",
                      session.done
                        ? "border-aprobado-edge bg-aprobado text-white"
                        : "border-slate-200 text-slate-300",
                    ].join(" ")}
                  >
                    <Icon name="check" size={18} strokeWidth={3} />
                  </span>
                </li>
              ))}
            </ul>
          </article>

          <article className="edge p-5 sm:p-6">
            <div className="flex items-center gap-3.5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-subrayador text-slate-900 shadow-[inset_0_-4px_0_var(--color-subrayador-edge)]">
                <Icon name="flame" size={30} />
              </span>
              <div>
                <p className="font-display text-3xl leading-none font-extrabold text-slate-950 tabular-nums">
                  12
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-600">días de racha</p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <Ball number={3} size="lg" state="mastered" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-display font-extrabold text-slate-950">
                    Preparador dedicado
                  </p>
                  <p className="text-sm font-bold text-slate-500 tabular-nums">640 XP</p>
                </div>
                <ProgressBar className="mt-2" tone="aprobado" value={35} />
              </div>
            </div>
            <p className="mt-5 text-sm font-semibold text-slate-700">
              Cada tema vuelve solo:
            </p>
            <ul className="mt-2 grid grid-cols-4 gap-2 text-center">
              {reviews.map((review) => (
                <li className="rounded-xl bg-sky-50 px-1 py-2" key={review.day}>
                  <p className="font-display text-lg leading-none font-extrabold text-sky-700">
                    {review.day}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                    {review.label}
                  </p>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {/* What it does */}
      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-3">
          {facts.map((fact, index) => (
            <article key={fact.title}>
              <span
                className={[
                  "flex h-14 w-14 items-center justify-center rounded-2xl",
                  [
                    "bg-boli text-white shadow-[0_4px_0_var(--color-boli-edge)]",
                    "bg-azul text-white shadow-[0_4px_0_var(--color-azul-edge)]",
                    "bg-subrayador text-slate-900 shadow-[0_4px_0_var(--color-subrayador-edge)]",
                  ][index],
                ].join(" ")}
              >
                <Icon name={fact.icon} size={28} />
              </span>
              <h3 className="mt-4 text-xl font-extrabold text-slate-950">{fact.title}</h3>
              <p className="mt-1.5 text-base leading-7 text-slate-600">{fact.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Who goes first */}
      <section className="border-y-2 border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-5 py-14 md:grid-cols-[auto_1fr]">
          <Ball number={75} size="xl" state="mastered" />
          <div>
            <h2 className="text-2xl font-extrabold text-slate-950 sm:text-3xl">
              Empezamos por Biología y Geología, desde Castilla-La Mancha
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
              Los 75 temas ya están dentro. ¿Preparas otra especialidad o te
              examinas en otra comunidad? Apúntate y dínoslo: así sabremos cuál
              abrir después.
            </p>
          </div>
        </div>
      </section>

      {/* Closing call */}
      <section className="px-5 py-16 sm:py-20">
        <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] bg-boli px-6 py-14 text-center text-white shadow-[0_8px_0_var(--color-boli-edge)] sm:py-20">
          <span aria-hidden className="absolute -top-16 -left-10 h-52 w-52 rounded-full bg-white/10" />
          <span aria-hidden className="absolute -right-12 -bottom-20 h-64 w-64 rounded-full bg-aprobado/40" />
          <span aria-hidden className="absolute top-10 right-[22%] h-10 w-10 rounded-full bg-subrayador" />
          <h2 className="relative mx-auto max-w-2xl text-3xl font-extrabold sm:text-5xl">
            Tu oposición, organizada desde enero.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg leading-8 text-violet-50">
            Quien esté en la lista entra primero.
          </p>
          <div className="relative mt-8 flex justify-center">
            <Button href="#lista" size="lg" variant="light">
              Quiero estar en la lista
            </Button>
          </div>
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-slate-200 bg-white px-5 py-6 text-sm font-medium text-slate-500">
        <Logo height={30} />
        <p>Hecho por y para opositores.</p>
        <LegalLinks />
        <Link className="font-bold text-violet-700" href="/login">
          Ya tengo acceso
        </Link>
      </footer>
    </main>
  );
}
