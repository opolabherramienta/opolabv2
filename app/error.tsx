"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Ball } from "@/components/ui/Ball";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-5 py-16 text-center">
      <Ball number="!" size="lg" state="started" />
      <h1 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">
        Algo ha fallado
      </h1>
      <p className="max-w-md text-base leading-7 text-slate-600">
        No hemos podido cargar esta pantalla. Tus datos están a salvo. Prueba
        otra vez y, si sigue igual, cuéntanoslo.
      </p>
      {error.digest ? (
        <p className="text-xs font-medium text-slate-400">Referencia: {error.digest}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button onClick={() => unstable_retry()} type="button">
          Probar otra vez
        </Button>
        <Button href="/sugerencias" variant="secondary">
          Cuéntanos qué falla
        </Button>
      </div>
    </main>
  );
}
