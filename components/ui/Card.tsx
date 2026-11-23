import type { ComponentPropsWithoutRef } from "react";

type CardProps = ComponentPropsWithoutRef<"section">;

export function Card({ className = "", ...props }: CardProps) {
  return (
    <section
      className={["edge p-5 sm:p-6", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
