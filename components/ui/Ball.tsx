import type { CSSProperties } from "react";

// A numbered exam ball ("bola"). Its colour tells how ready the topic is.
export type BallState = "off" | "selected" | "started" | "studied" | "mastered";

type BallProps = {
  number: number | string;
  state?: BallState;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  style?: CSSProperties;
  title?: string;
};

const stateClasses: Record<BallState, string> = {
  off: "bg-slate-100 text-slate-400 shadow-[inset_0_-3px_0_var(--color-slate-200)]",
  selected:
    "bg-white text-violet-700 ring-2 ring-inset ring-violet-300 shadow-[inset_0_-3px_0_var(--color-violet-100)]",
  started:
    "bg-subrayador text-slate-900 shadow-[inset_0_-4px_0_var(--color-subrayador-edge)]",
  studied:
    "bg-boli text-white shadow-[inset_0_-4px_0_var(--color-boli-edge)]",
  mastered:
    "bg-aprobado text-white shadow-[inset_0_-4px_0_var(--color-aprobado-edge)]",
};

const sizeClasses: Record<NonNullable<BallProps["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-3xl",
};

export const ballStateLabels: Record<BallState, string> = {
  off: "Sin elegir",
  selected: "Elegido",
  started: "En marcha",
  studied: "Estudiado",
  mastered: "Dominado",
};

export function Ball({
  className = "",
  number,
  size = "md",
  state = "off",
  style,
  title,
}: BallProps) {
  return (
    <span
      className={[
        "relative inline-flex shrink-0 items-center justify-center rounded-full font-display font-extrabold tabular-nums select-none",
        sizeClasses[size],
        stateClasses[state],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      title={title}
    >
      {size !== "sm" && state !== "off" && state !== "selected" ? (
        <span
          aria-hidden
          className="absolute top-[14%] left-[20%] h-[22%] w-[30%] rounded-full bg-white/45 blur-[1px]"
        />
      ) : null}
      {number}
    </span>
  );
}

// Shared rule so every screen colours a topic the same way.
export function getTopicBallState(topic: {
  isSelected: boolean;
  summaryDone: boolean;
  studiedDone: boolean;
  reviewCount: number;
  masteryLevel: string;
}): BallState {
  if (!topic.isSelected) return "off";
  if (topic.masteryLevel === "high") return "mastered";
  if (topic.studiedDone) return "studied";
  if (topic.summaryDone || topic.reviewCount > 0) return "started";
  return "selected";
}
