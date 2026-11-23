"use client";

import { useCallback, useState, type CSSProperties } from "react";

const colors = [
  "var(--color-boli)",
  "var(--color-subrayador)",
  "var(--color-aprobado)",
  "var(--color-rojo)",
];

type Piece = {
  id: number;
  style: CSSProperties;
};

function buildPieces(seed: number): Piece[] {
  return Array.from({ length: 14 }, (_, index) => {
    const angle = (index / 14) * Math.PI * 2 + (seed % 7) * 0.3;
    const distance = 46 + ((index * 37 + seed * 13) % 34);

    return {
      id: seed * 100 + index,
      style: {
        "--dx": `${Math.cos(angle) * distance}px`,
        "--dy": `${Math.sin(angle) * distance - 18}px`,
        "--rot": `${(index % 2 === 0 ? 1 : -1) * (180 + index * 24)}deg`,
        background: colors[index % colors.length],
      } as CSSProperties,
    };
  });
}

// Small celebration for a finished task. Render <ConfettiBurst burst={burst} />
// inside a `relative` element and call fire() when something gets completed.
export function useConfetti() {
  const [burst, setBurst] = useState(0);
  const fire = useCallback(() => setBurst((current) => current + 1), []);

  return { burst, fire };
}

export function ConfettiBurst({ burst }: { burst: number }) {
  if (burst === 0) {
    return null;
  }

  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 z-10" key={burst}>
      {buildPieces(burst).map((piece) => (
        <span className="confetti-piece" key={piece.id} style={piece.style} />
      ))}
    </span>
  );
}
