import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { legalOwner } from "@/lib/legal";

export const metadata: Metadata = { title: "Aviso legal · OpoLab" };

export default function AvisoLegalPage() {
  return (
    <LegalPage title="Aviso legal">
      <h2>Quién está detrás de OpoLab</h2>
      <p>
        OpoLab es un servicio de {legalOwner.name}, con NIF {legalOwner.taxId} y
        domicilio en {legalOwner.address}. Puedes escribirnos a{" "}
        <a href={`mailto:${legalOwner.email}`}>{legalOwner.email}</a>.
      </p>

      <h2>Qué es OpoLab</h2>
      <p>
        OpoLab es un planificador de estudio para personas que preparan
        oposiciones a profesorado. Ayuda a organizar el temario, los supuestos
        prácticos y el calendario de estudio. No es una academia, no imparte
        formación y no tiene relación con ninguna Administración ni tribunal.
      </p>

      <h2>Condiciones de uso</h2>
      <ul>
        <li>
          La cuenta es personal. Eres responsable de guardar tu contraseña y de
          lo que se haga con tu cuenta.
        </li>
        <li>
          Usa el servicio para tu propio estudio. No está permitido intentar
          acceder a datos de otras personas, sobrecargar el servicio ni usarlo
          para fines ilícitos.
        </li>
        <li>
          Podemos suspender una cuenta que incumpla estas condiciones o ponga
          en riesgo el servicio.
        </li>
        <li>
          Puedes borrar tu cuenta cuando quieras desde Ajustes. Al hacerlo se
          eliminan tus datos de estudio.
        </li>
      </ul>

      <h2>Qué puedes esperar y qué no</h2>
      <p>
        El plan de estudio, los repasos y los avisos que propone OpoLab son una
        ayuda para organizarte. No garantizan aprobar ni sustituyen tu criterio
        ni el de tu preparador. Los títulos de los temas proceden de los
        temarios oficiales publicados en el BOE; comprueba siempre la
        convocatoria de tu comunidad, que es la que manda.
      </p>
      <p>
        Trabajamos para que el servicio esté disponible y los datos seguros,
        pero puede haber interrupciones o errores. No respondemos de los daños
        que deriven de un uso distinto del previsto o de causas ajenas a
        nuestro control.
      </p>

      <h2>Propiedad intelectual</h2>
      <p>
        El diseño, la marca, los textos y el programa de OpoLab pertenecen a{" "}
        {legalOwner.name}. Lo que tú escribes en tu cuenta (notas, prácticos,
        sesiones) es tuyo.
      </p>

      <h2>Datos personales y cookies</h2>
      <p>
        Cómo tratamos tus datos está explicado en la{" "}
        <Link href="/privacidad">política de privacidad</Link>, y qué cookies
        usamos, en la <Link href="/cookies">política de cookies</Link>.
      </p>

      <h2>Ley aplicable</h2>
      <p>
        Estas condiciones se rigen por la ley española. Si eres consumidor,
        serán competentes los juzgados de tu domicilio.
      </p>
    </LegalPage>
  );
}
