import type { CSSProperties, ReactNode } from "react";

type Tone = "boli" | "aprobado" | "subrayador" | "rojo";

const barTone: Record<Tone, string> = {
  boli: "bg-boli",
  aprobado: "bg-aprobado",
  subrayador: "bg-subrayador",
  rojo: "bg-rojo",
};

const ringTone: Record<Tone, string> = {
  boli: "stroke-boli",
  aprobado: "stroke-aprobado",
  subrayador: "stroke-subrayador",
  rojo: "stroke-rojo",
};

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

type ProgressBarProps = {
  value: number;
  label?: string;
  detail?: string;
  tone?: Tone;
  className?: string;
};

export function ProgressBar({
  className = "",
  detail,
  label,
  tone = "boli",
  value,
}: ProgressBarProps) {
  const percent = clampPercent(value);

  return (
    <div className={className}>
      {label || detail ? (
        <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
          <span className="font-semibold text-slate-800">{label}</span>
          <span className="font-medium text-slate-500 tabular-nums">{detail}</span>
        </div>
      ) : null}
      <div
        aria-label={label}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={Math.round(percent)}
        className="h-4 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        >
          <div className={["fill-grow relative h-full rounded-full", barTone[tone]].join(" ")}>
            <span className="absolute inset-x-2 top-1 h-1 rounded-full bg-white/30" />
          </div>
        </div>
      </div>
    </div>
  );
}

type ProgressRingProps = {
  value: number;
  size?: number;
  stroke?: number;
  tone?: Tone;
  children?: ReactNode;
  className?: string;
};

export function ProgressRing({
  children,
  className = "",
  size = 132,
  stroke = 14,
  tone = "boli",
  value,
}: ProgressRingProps) {
  const percent = clampPercent(value);
  const radius = (size - stroke) / 2;
  const length = 2 * Math.PI * radius;

  return (
    <div
      className={["relative inline-flex items-center justify-center", className].join(" ")}
      style={{ height: size, width: size }}
    >
      <svg
        aria-hidden
        className="-rotate-90"
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        width={size}
      >
        <circle
          className="stroke-slate-200"
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          strokeWidth={stroke}
        />
        <circle
          className={["ring-draw", ringTone[tone]].join(" ")}
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          strokeDasharray={length}
          strokeDashoffset={length * (1 - percent / 100)}
          strokeLinecap="round"
          strokeWidth={stroke}
          style={{ "--ring-length": `${length}` } as CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}

type ChipTone = "neutral" | "boli" | "aprobado" | "subrayador" | "rojo";

const chipTone: Record<ChipTone, string> = {
  neutral: "bg-slate-100 text-slate-700",
  boli: "bg-violet-100 text-violet-800",
  aprobado: "bg-emerald-100 text-emerald-800",
  subrayador: "bg-amber-100 text-amber-900",
  rojo: "bg-red-100 text-red-800",
};

export function Chip({
  children,
  className = "",
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: ChipTone;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
        chipTone[tone],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
