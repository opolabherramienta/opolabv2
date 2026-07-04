import type { ComponentPropsWithoutRef } from "react";

type CardProps = ComponentPropsWithoutRef<"section">;

export function Card({ className = "", ...props }: CardProps) {
  return (
    <section
      className={[
        "rounded-lg border border-slate-200 bg-white p-6 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
