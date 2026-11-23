import type { SVGProps } from "react";

export type IconName =
  | "home"
  | "balls"
  | "flask"
  | "calendar"
  | "chart"
  | "settings"
  | "flame"
  | "check"
  | "plus"
  | "clock"
  | "logout"
  | "target"
  | "repeat"
  | "pencil"
  | "trash"
  | "chevron-left"
  | "chevron-right"
  | "chevron-down"
  | "star"
  | "moon"
  | "note"
  | "shield";

const paths: Record<IconName, string> = {
  home: "M3 11.5 12 4l9 7.5M5.5 10v9.5h4.5v-5.5h4v5.5h4.5V10",
  balls:
    "M8 14.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM16.5 19a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM17 8.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  flask:
    "M9.5 3.5h5M10.5 3.5v5.2L5.2 17.6A2 2 0 0 0 6.9 20.5h10.2a2 2 0 0 0 1.7-2.9L13.5 8.7V3.5M7.6 14.5h8.8",
  calendar:
    "M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 3.5v4M15.5 3.5v4",
  chart: "M5 19.5v-6M10 19.5v-11M15 19.5v-8M20 19.5V5",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12a7 7 0 0 0-.1-1.3l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.3-1.3L14 3h-4l-.3 2.4a7 7 0 0 0-2.3 1.3l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .9.1 1.3l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2.3 1.3L10 21h4l.3-2.4a7 7 0 0 0 2.3-1.3l2.3.9 2-3.4-2-1.5c.1-.4.1-.9.1-1.3Z",
  flame:
    "M12 21c3.6 0 6.5-2.7 6.5-6.4 0-3-1.900-4.800-3.200-6.600-.9-1.300-1.300-2.700-1.300-4.500-2.900 1.500-5 4.300-5 7.300-1-.6-1.600-1.500-1.900-2.700C6 9.600 5.500 11.500 5.500 14.600 5.500 18.300 8.400 21 12 21Z",
  check: "m5 12.5 4.5 4.5L19 7.5",
  plus: "M12 5v14M5 12h14",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7.500V12l3 2",
  logout: "M14 4.500h4.500v15H14M10 8l-4 4 4 4M6 12h9.500",
  target:
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16.500a4.500 4.500 0 1 0 0-9 4.500 4.500 0 0 0 0 9ZM12 12.500a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z",
  repeat: "M4.500 11a7 7 0 0 1 12-4.500L19 9M19 4.500V9h-4.500M19.500 13a7 7 0 0 1-12 4.500L5 15M5 19.500V15h4.500",
  pencil: "M4.500 19.500 5.500 15 16 4.500l3.500 3.500L9 18.500l-4.500 1ZM14 6.500l3.500 3.500",
  trash: "M5 7h14M9.500 7V4.500h5V7M7 7l1 12.500h8L17 7M10.500 10.500v5.500M13.500 10.500v5.500",
  "chevron-left": "m14.500 6-6 6 6 6",
  "chevron-right": "m9.500 6 6 6-6 6",
  "chevron-down": "m6 9.500 6 6 6-6",
  star: "m12 3.500 2.600 5.400 5.900.800-4.300 4.100 1 5.900L12 16.900 6.800 19.700l1-5.900L3.500 9.700l5.900-.8L12 3.500Z",
  moon: "M19.500 14.500A8 8 0 0 1 9.500 4.500a8 8 0 1 0 10 10Z",
  note: "M6 3.500h9l3.500 3.500v13.500H6zM14.500 3.500V7.500h4M9 12h6.500M9 15.500h6.500",
  shield: "M12 3.500 5 6v5.500c0 4.300 2.900 7.700 7 9 4.100-1.300 7-4.700 7-9V6l-7-2.500ZM9 12l2.200 2.200L15 10.400",
};

type IconProps = {
  name: IconName;
  size?: number;
} & Omit<SVGProps<SVGSVGElement>, "name">;

export function Icon({ name, size = 22, ...props }: IconProps) {
  return (
    <svg
      aria-hidden
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.2}
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
