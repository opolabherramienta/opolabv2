import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { legalOwner } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacidad · OpoLab" };

export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de privacidad">
      <p>
        Aquí explicamos, sin letra pequeña, qué datos guarda OpoLab, para qué y
        qué puedes hacer con ellos.
      </p>

      <h2>Responsable</h2>
      <p>
        {legalOwner.name}, NIF {legalOwner.taxId}, {legalOwner.address}.
        Contacto para todo lo relacionado con tus datos:{" "}
        <a href={`mailto:${legalOwner.email}`}>{legalOwner.email}</a>.
      </p>

      <h2>Qué datos guardamos</h2>
      <ul>
        <li>
          <strong>Lista de espera:</strong> tu correo y, si los indicas, tu
          especialidad y tu comunidad autónoma.
        </li>
        <li>
          <strong>Cuenta:</strong> tu nombre, tu correo y tu contraseña, que se
          guarda cifrada y que nosotros no podemos leer.
        </li>
        <li>
          <strong>Tu preparación:</strong> especialidad, comunidad, fecha de
          examen, horas y días de estudio, los temas y prácticos que llevas,
          tus sesiones del calendario, tu progreso y tus notas.
        </li>
        <li>
          <strong>Mensajes que nos envías</strong> desde «Cuéntanos qué falla»:
          el texto y la pantalla desde la que escribes.
        </li>
        <li>
          <strong>Datos técnicos:</strong> para limitar los envíos abusivos del
          formulario de la lista de espera guardamos durante un día un resumen
          cifrado de la dirección IP, del que no se puede recuperar la
          dirección. Nuestros proveedores registran además los accesos al
          servidor por seguridad.
        </li>
      </ul>
      <p>
        No pedimos ni queremos datos sensibles. No los escribas en tus notas.
      </p>

      <h2>Para qué los usamos y con qué base</h2>
      <ul>
        <li>
          <strong>Avisarte del lanzamiento</strong> si te apuntaste a la lista
          de espera: con tu consentimiento, que puedes retirar cuando quieras.
        </li>
        <li>
          <strong>Darte el servicio</strong> (tu cuenta, tu plan, tu
          calendario): porque es necesario para cumplir lo que pides al
          registrarte.
        </li>
        <li>
          <strong>Mantener el servicio seguro y arreglar fallos:</strong> por
          nuestro interés legítimo en que funcione bien.
        </li>
      </ul>
      <p>
        No usamos tus datos para publicidad, no hacemos perfiles comerciales y
        no vendemos ni cedemos tus datos a nadie.
      </p>

      <h2>Quién más interviene</h2>
      <p>
        Para funcionar usamos proveedores que tratan datos por nuestra cuenta y
        solo siguiendo nuestras instrucciones:
      </p>
      <ul>
        <li>Supabase: base de datos y sistema de cuentas.</li>
        <li>Vercel: alojamiento de la web.</li>
        <li>Resend: envío de correos.</li>
      </ul>
      <p>
        Algunos de estos proveedores tienen su sede en Estados Unidos. Cuando
        los datos salen del Espacio Económico Europeo lo hacen con las
        garantías que exige el Reglamento General de Protección de Datos, como
        las cláusulas contractuales tipo de la Comisión Europea.
      </p>

      <h2>Cuánto tiempo los guardamos</h2>
      <ul>
        <li>
          Lista de espera: hasta que te avisemos de la apertura y, como máximo,
          doce meses, o hasta que pidas que lo borremos.
        </li>
        <li>
          Cuenta y datos de estudio: mientras tengas la cuenta. Si la borras
          desde Ajustes, se eliminan en ese momento; las copias de seguridad se
          renuevan en un plazo máximo de treinta días.
        </li>
      </ul>

      <h2>Tus derechos</h2>
      <p>
        Puedes acceder a tus datos, corregirlos, borrarlos, oponerte a su uso,
        pedir que se limite y pedir una copia para llevártelos. Escríbenos a{" "}
        <a href={`mailto:${legalOwner.email}`}>{legalOwner.email}</a> desde el
        correo de tu cuenta y te respondemos en un mes como máximo. La cuenta
        puedes borrarla tú directamente en Ajustes.
      </p>
      <p>
        Si crees que no hemos atendido bien tu petición, puedes reclamar ante
        la Agencia Española de Protección de Datos (
        <a href="https://www.aepd.es" rel="noopener noreferrer" target="_blank">
          www.aepd.es
        </a>
        ).
      </p>

      <h2>Menores</h2>
      <p>
        OpoLab está pensado para personas adultas que preparan una oposición.
        No está dirigido a menores de 14 años.
      </p>

      <h2>Cookies</h2>
      <p>
        Solo usamos las cookies necesarias para mantener tu sesión. Lo contamos
        en la <Link href="/cookies">política de cookies</Link>.
      </p>

      <h2>Cambios</h2>
      <p>
        Si cambiamos algo importante de esta política, lo avisaremos en la web
        o por correo antes de que se aplique.
      </p>
    </LegalPage>
  );
}
