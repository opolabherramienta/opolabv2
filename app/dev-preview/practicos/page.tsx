import { notFound } from "next/navigation";
import {
  PracticalsClient,
  type PracticalItem,
} from "@/components/practicals/practicals-client";
import { PageHeader } from "@/components/ui/PageHeader";

// Design preview with fake data. Never available in production builds.
const practicals: PracticalItem[] = [
  {
    id: "preview-1",
    name: "Problema de genética: herencia ligada al sexo",
    description: "Daltonismo y hemofilia en la misma genealogía. Repasar la notación.",
    status: "mastered",
    timesWorked: 6,
    createdAt: "2026-09-12T09:00:00Z",
  },
  {
    id: "preview-2",
    name: "Corte geológico con falla inversa y discordancia angular",
    description: "Me lío al ordenar los eventos de la historia geológica.",
    status: "worked",
    timesWorked: 3,
    createdAt: "2026-09-20T09:00:00Z",
  },
  {
    id: "preview-3",
    name: "Clave dicotómica de invertebrados",
    description: "",
    status: "worked",
    timesWorked: 1,
    createdAt: "2026-10-02T09:00:00Z",
  },
  {
    id: "preview-4",
    name: "Problema de genética de poblaciones (Hardy-Weinberg)",
    description: "Convocatoria de Andalucía 2023.",
    status: "mastered",
    timesWorked: 4,
    createdAt: "2026-10-10T09:00:00Z",
  },
  {
    id: "preview-5",
    name: "Interpretación de un mapa topográfico y perfil",
    description: "",
    status: "not_started",
    timesWorked: 0,
    createdAt: "2026-10-21T09:00:00Z",
  },
  {
    id: "preview-6",
    name: "Reconocimiento de preparaciones histológicas",
    description: "Tejidos vegetales: diferenciar colénquima y esclerénquima.",
    status: "not_started",
    timesWorked: 0,
    createdAt: "2026-11-03T09:00:00Z",
  },
];

export default function PracticosPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        description="Apunta cada supuesto práctico, suma un intento cada vez que lo trabajes y marca los que ya dominas."
        title="Prácticos"
      />
      <PracticalsClient initialPracticals={practicals} userId="preview" />
    </div>
  );
}
