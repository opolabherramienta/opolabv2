import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">
          {description}
        </p>
      </div>
      {action}
    </header>
  );
}
