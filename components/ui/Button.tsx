import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "warning";

type ButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  variant?: ButtonVariant;
} & ComponentPropsWithoutRef<"button">;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-violet-700 text-white hover:bg-violet-800",
  secondary:
    "border border-violet-200 bg-white text-violet-800 hover:bg-violet-50",
  ghost: "text-slate-700 hover:bg-slate-100",
  warning: "bg-orange-100 text-orange-800 hover:bg-orange-200",
};

export function Button({
  children,
  className = "",
  href,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  const classes = [
    "inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-semibold transition-colors",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link className={classes} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}
