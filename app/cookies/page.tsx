import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { legalOwner } from "@/lib/legal";

export const metadata: Metadata = { title: "Cookies · OpoLab" };

export default function CookiesPage() {
  return (
    <LegalPage title="Política de cookies">
      <p>
        OpoLab solo usa cookies técnicas, las imprescindibles para que la web
        funcione. Por eso no verás un aviso para aceptarlas: la ley no lo exige
        para este tipo de cookies.
      </p>

      <h2>Qué cookies usamos</h2>
      <ul>
        <li>
          <strong>Sesión de tu cuenta.</strong> Cuando entras, se guardan en tu
          navegador unas cookies del sistema de cuentas (su nombre empieza por
          «sb-») que te mantienen con la sesión iniciada. Se renuevan mientras
          usas la web y desaparecen al cerrar sesión.
        </li>
      </ul>

      <h2>Qué no usamos</h2>
      <ul>
        <li>No hay cookies de publicidad ni de redes sociales.</li>
        <li>No hay herramientas de analítica que te sigan entre páginas.</li>
        <li>
          Las tipografías y el vídeo de presentación se sirven desde nuestro
          propio dominio, sin llamadas a terceros.
        </li>
      </ul>
      <p>
        Si algún día añadimos una herramienta que use cookies no
        imprescindibles, te pediremos permiso antes y actualizaremos esta
        página.
      </p>

      <h2>Cómo borrarlas</h2>
      <p>
        Puedes borrar o bloquear las cookies desde los ajustes de tu navegador.
        Si bloqueas las de sesión, no podrás entrar en tu cuenta.
      </p>

      <h2>Contacto</h2>
      <p>
        Para cualquier duda: <a href={`mailto:${legalOwner.email}`}>{legalOwner.email}</a>.
        Más información en la <Link href="/privacidad">política de privacidad</Link>.
      </p>
    </LegalPage>
  );
}
