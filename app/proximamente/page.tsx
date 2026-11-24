import type { Metadata } from "next";
import { Teaser } from "@/components/landing/teaser";

export const metadata: Metadata = {
  title: "OpoLab · Abrimos en enero de 2027",
  description:
    "El planificador para opositores a profesorado de Secundaria: tu temario en bolas, un plan que se hace solo y repasos que llegan cuando toca. Apúntate y entra antes que nadie.",
};

export default function ProximamentePage() {
  return <Teaser />;
}
