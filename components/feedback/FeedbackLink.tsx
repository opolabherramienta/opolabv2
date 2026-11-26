"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// A quiet line at the end of every private screen. It remembers the screen
// it was clicked from, so the message arrives with its context.
export function FeedbackLink() {
  const pathname = usePathname();

  if (pathname.startsWith("/sugerencias")) {
    return null;
  }

  return (
    <p className="mt-10 text-center text-sm font-medium text-slate-500">
      ¿Algo falla o echas algo de menos?{" "}
      <Link
        className="font-bold text-violet-700 underline underline-offset-2"
        href={`/sugerencias?desde=${encodeURIComponent(pathname)}`}
      >
        Cuéntanos qué falla
      </Link>
    </p>
  );
}
