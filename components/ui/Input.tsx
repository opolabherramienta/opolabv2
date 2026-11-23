import type { ComponentPropsWithoutRef } from "react";

type InputProps = {
  label?: string;
} & ComponentPropsWithoutRef<"input">;

export const fieldClasses =
  "h-12 rounded-xl border-2 border-slate-200 bg-white px-3.5 text-base text-slate-950 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-100";

export function Input({ className = "", id, label, ...props }: InputProps) {
  return (
    <label className="grid grid-cols-1 gap-2 text-sm font-semibold text-slate-700" htmlFor={id}>
      {label}
      <input
        className={[fieldClasses, className].filter(Boolean).join(" ")}
        id={id}
        {...props}
      />
    </label>
  );
}
