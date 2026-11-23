import Image from "next/image";

type LogoProps = {
  /** "blanco" for violet backgrounds, "color" for light ones. */
  variant?: "blanco" | "color";
  height?: number;
  className?: string;
};

const sources = {
  blanco: { src: "/logo-opolab-blanco.png", ratio: 922 / 360 },
  color: { src: "/logo-opolab.png", ratio: 940 / 360 },
};

export function Logo({ className, height = 36, variant = "color" }: LogoProps) {
  const { ratio, src } = sources[variant];

  return (
    <Image
      alt="OpoLab"
      className={className}
      height={height}
      priority
      src={src}
      style={{ height, width: "auto" }}
      width={Math.round(height * ratio)}
    />
  );
}
