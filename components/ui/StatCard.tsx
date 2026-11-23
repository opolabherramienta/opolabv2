import type { ReactNode } from "react";

type StatCardTone = "violet" | "green" | "orange";

type StatCardProps = {
  label: string;
  value: string;
  tone?: StatCardTone;
  icon?: ReactNode;
};

const toneClasses: Record<StatCardTone, string> = {
  violet: "text-violet-700",
  green: "text-aprobado-edge",
  orange: "text-orange-600",
};

const iconToneClasses: Record<StatCardTone, string> = {
  violet: "bg-violet-100 text-violet-700",
  green: "bg-emerald-100 text-aprobado-edge",
  orange: "bg-orange-100 text-orange-600",
};

export function StatCard({ icon, label, value, tone = "violet" }: StatCardProps) {
  return (
    <section className="edge flex items-center gap-3 p-4">
      {icon ? (
        <span
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            iconToneClasses[tone],
          ].join(" ")}
        >
          {icon}
        </span>
      ) : null}
      <div className="min-w-0">
        <p
          className={[
            "font-display text-2xl leading-tight font-extrabold tabular-nums",
            toneClasses[tone],
          ].join(" ")}
        >
          {value}
        </p>
        <p className="text-sm leading-5 font-medium text-slate-500">{label}</p>
      </div>
    </section>
  );
}
