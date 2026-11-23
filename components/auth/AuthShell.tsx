import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  description: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

// Shared frame for login, register and password screens.
export function AuthShell({ children, description, footer, title }: AuthShellProps) {
  return (
    <main className="cuadricula flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link className="mb-6 flex items-center gap-2.5" href="/">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-boli font-display text-xl font-extrabold text-white shadow-[inset_0_-3px_0_var(--color-boli-edge)]">
          O
        </span>
        <span className="font-display text-2xl font-extrabold text-slate-950">
          Opolab
        </span>
      </Link>
      <section className="edge animate-rise w-full max-w-md p-6 sm:p-8">
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
