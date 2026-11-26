import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { legalUpdatedOn } from "@/lib/legal";

const pages = [
  { href: "/aviso-legal", label: "Aviso legal" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/cookies", label: "Cookies" },
];

/** Links to the three legal pages, for footers. */
export function LegalLinks({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="Textos legales" className={["flex flex-wrap gap-x-4 gap-y-1", className].join(" ")}>
      {pages.map((page) => (
        <Link className="underline underline-offset-2 hover:text-violet-700" href={page.href} key={page.href}>
          {page.label}
        </Link>
      ))}
    </nav>
  );
}

// Shared frame for the legal texts: plain, readable and printable.
export function LegalPage({ children, title }: { children: ReactNode; title: string }) {
  return (
    <main className="min-h-screen bg-white">
      <header className="border-b-2 border-slate-200 px-5 py-4">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4">
          <Link aria-label="OpoLab" className="inline-flex" href="/">
            <Logo height={34} />
          </Link>
          <Link className="text-sm font-bold text-violet-700" href="/">
            Volver al inicio
          </Link>
        </div>
      </header>
      <article className="legal mx-auto w-full max-w-3xl px-5 py-10">
        <h1 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Última actualización: {legalUpdatedOn}
        </p>
        <div className="mt-8 space-y-4 text-base leading-7 text-slate-700 [&_a]:font-semibold [&_a]:text-violet-700 [&_a]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-extrabold [&_h2]:text-slate-950 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">
          {children}
        </div>
      </article>
      <footer className="border-t-2 border-slate-200 px-5 py-6 text-sm font-medium text-slate-500">
        <div className="mx-auto w-full max-w-3xl">
          <LegalLinks />
        </div>
      </footer>
    </main>
  );
}
