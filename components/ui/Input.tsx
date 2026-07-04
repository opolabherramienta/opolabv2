import type { ComponentPropsWithoutRef } from "react";

type InputProps = {
  label?: string;
} & ComponentPropsWithoutRef<"input">;

export function Input({ className = "", id, label, ...props }: InputProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700" htmlFor={id}>
      {label}
      <input
        className={[
          "h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950",
          "outline-none transition-colors placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        id={id}
        {...props}
      />
    </label>
  );
}
