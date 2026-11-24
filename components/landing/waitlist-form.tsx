"use client";

import { useActionState } from "react";
import { joinWaitlistAction, type WaitlistState } from "@/app/waitlist/actions";
import { Button } from "@/components/ui/Button";
import { ConfettiBurst } from "@/components/ui/Confetti";
import { Icon } from "@/components/ui/Icon";
import { fieldClasses } from "@/components/ui/Input";

const initialState: WaitlistState = { status: "idle", message: "" };

const specialties = [
  "Biología y Geología",
  "Física y Química",
  "Matemáticas",
  "Lengua Castellana y Literatura",
  "Geografía e Historia",
  "Inglés",
  "Educación Física",
  "Tecnología",
  "Orientación Educativa",
  "Otra especialidad",
];

const communities = [
  "Castilla-La Mancha",
  "Andalucía",
  "Aragón",
  "Asturias",
  "Baleares",
  "Canarias",
  "Cantabria",
  "Castilla y León",
  "Cataluña",
  "Ceuta",
  "Comunidad Valenciana",
  "Extremadura",
  "Galicia",
  "La Rioja",
  "Madrid",
  "Melilla",
  "Murcia",
  "Navarra",
  "País Vasco",
];

export function WaitlistForm() {
  const [state, formAction, pending] = useActionState(joinWaitlistAction, initialState);

  if (state.status === "ok") {
    return (
      <div
        className="relative rounded-[1.75rem] bg-white p-6 text-center text-slate-950 shadow-[0_8px_0_var(--color-boli-edge)] sm:p-8"
        role="status"
      >
        <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-aprobado text-white shadow-[inset_0_-4px_0_var(--color-aprobado-edge)]">
          <Icon name="check" size={34} strokeWidth={3} />
          <ConfettiBurst burst={1} />
        </span>
        <p className="mt-4 font-display text-2xl font-extrabold">Estás dentro</p>
        <p className="mx-auto mt-2 max-w-sm text-base leading-7 text-slate-600">
          Te escribiremos el día que abramos, antes que a nadie. Hasta entonces,
          a por el siguiente tema.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-[1.75rem] bg-white p-5 text-slate-950 shadow-[0_8px_0_var(--color-boli-edge)] sm:p-7"
    >
      <p className="font-display text-2xl font-extrabold">Entra antes que nadie</p>
      <p className="mt-1.5 text-[15px] leading-6 text-slate-600">
        Déjanos tu correo y te avisamos el día que abramos.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3.5">
        <label className="grid grid-cols-1 gap-1.5 text-sm font-semibold text-slate-700">
          Tu correo
          <input
            autoComplete="email"
            className={fieldClasses}
            inputMode="email"
            maxLength={254}
            name="email"
            placeholder="tu@email.com"
            required
            type="email"
          />
        </label>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <label className="grid min-w-0 grid-cols-1 gap-1.5 text-sm font-semibold text-slate-700">
            Especialidad
            <select className={`${fieldClasses} min-w-0`} defaultValue="" name="specialty">
              <option value="">Prefiero no decirlo</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </label>
          <label className="grid min-w-0 grid-cols-1 gap-1.5 text-sm font-semibold text-slate-700">
            Comunidad
            <select className={`${fieldClasses} min-w-0`} defaultValue="" name="community">
              <option value="">Prefiero no decirlo</option>
              {communities.map((community) => (
                <option key={community} value={community}>
                  {community}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Bots fill this in; people never see it. */}
        <input
          aria-hidden
          autoComplete="off"
          className="hidden"
          name="website"
          tabIndex={-1}
          type="text"
        />

        <label className="flex items-start gap-2.5 text-sm leading-5 text-slate-600">
          <input
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 accent-violet-600"
            name="consent"
            required
            type="checkbox"
          />
          <span>
            Quiero que OpoLab guarde mi correo solo para avisarme del
            lanzamiento. Puedo pedir que lo borren cuando quiera.
          </span>
        </label>
      </div>

      {state.status === "error" ? (
        <p
          className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <Button className="mt-5 w-full" disabled={pending} size="lg" type="submit">
        {pending ? "Apuntándote..." : "Avísame cuando abra"}
      </Button>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        Responsable: Daniel González López. Usamos tu correo solo para avisarte
        del lanzamiento, porque nos das tu permiso al marcar la casilla. No se
        lo damos a nadie. Para borrarlo, consultarlo o corregirlo, escribe a{" "}
        <a
          className="font-semibold text-violet-700 underline underline-offset-2"
          href="mailto:opolabherramienta@gmail.com"
        >
          opolabherramienta@gmail.com
        </a>
        .
      </p>
    </form>
  );
}
