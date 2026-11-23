import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

type AuthShellProps = {
  title: string;
  description: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

// Shared frame for login, register and password screens.
export function AuthShell({ children, description, footer, title }: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-boli px-4 py-10">
      <span aria-hidden className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-white/10" />
      <span aria-hidden className="absolute -right-16 bottom-10 h-56 w-56 rounded-full bg-aprobado/40" />
      <span aria-hidden className="absolute top-24 right-10 h-16 w-16 rounded-full bg-subrayador/80" />
      <Link aria-label="OpoLab" className="relative mb-7 inline-flex" href="/">
        <Logo height={56} variant="blanco" />
      </Link>
      <section className="animate-rise relative w-full max-w-md rounded-[1.75rem] bg-white p-6 shadow-[0_6px_0_var(--color-boli-edge)] sm:p-8">
        <h1 className="text-3xl font-extrabold text-slate-950">{title}</h1>
        <p className="mt-2 text-[15px] leading-6 text-slate-600">{description}</p>
        {children}
        {footer ? (
          <div className="mt-6 flex flex-wrap justify-between gap-x-4 gap-y-2 text-sm font-bold">
            {footer}
          </div>
        ) : null}
      </section>
    </main>
  );
}
