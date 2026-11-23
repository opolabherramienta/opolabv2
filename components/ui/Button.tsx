import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "warning" | "success";
type ButtonSize = "md" | "lg" | "sm";

type ButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
} & ComponentPropsWithoutRef<"button">;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "press bg-boli text-white [--press-edge:var(--color-boli-edge)] hover:bg-violet-500",
  secondary:
    "press border-2 border-slate-200 bg-white text-violet-700 [--press-edge:var(--color-slate-200)] hover:bg-violet-50",
  ghost: "text-slate-700 hover:bg-slate-100",
  warning:
    "press bg-subrayador text-slate-900 [--press-edge:var(--color-subrayador-edge)]",
  success:
    "press bg-aprobado text-white [--press-edge:var(--color-aprobado-edge)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

export function Button({
  children,
  className = "",
  href,
  size = "md",
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center gap-2 rounded-xl font-bold select-none",
    sizeClasses[size],
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
