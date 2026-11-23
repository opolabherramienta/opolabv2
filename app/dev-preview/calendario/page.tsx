import { notFound } from "next/navigation";
import {
  CalendarClient,
  type CalendarSession,
} from "@/components/calendar/calendar-client";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

function dateKeyFromToday(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const samples: Array<
  [number, string, CalendarSession["taskType"], CalendarSession["status"], string]
> = [
  [-9, "Tema 3: La célula eucariota", "study_topic", "completed", ""],
  [-8, "Supuesto práctico de genética", "practical", "completed", "Problemas de ligamiento."],
  [-6, "Tema 7: Metabolismo celular", "study_topic", "completed", ""],
  [-5, "Descanso", "rest", "completed", ""],
  [-3, "Tema 12: Tectónica de placas", "study_topic", "cancelled", "Lo paso a la semana que viene."],
  [-2, "Repaso de los temas 3 y 7", "study_topic", "completed", ""],
  [-1, "Práctico de cortes geológicos", "practical", "pending", ""],
  [0, "Tema 15: El sistema inmunitario", "study_topic", "pending", "Apartados 1 a 4 y esquema."],
  [0, "Práctico de claves dicotómicas", "practical", "pending", ""],
  [0, "Cantar el tema 3", "study_topic", "completed", ""],
  [0, "Repaso rápido del tema 7", "study_topic", "pending", ""],
  [1, "Tema 16: Genética mendeliana", "study_topic", "pending", ""],
  [3, "Simulacro de tema escrito", "study_topic", "pending", "Dos horas, a mano."],
  [4, "Descanso", "rest", "pending", ""],
  [6, "Práctico de microscopía", "practical", "pending", ""],
];

// Development-only preview with made-up sessions; never reaches the network.
export default function CalendarPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const sessions: CalendarSession[] = samples.map(
    ([offset, title, taskType, status, description], index) => ({
      id: `preview-${index}`,
      title,
      description,
      taskDate: dateKeyFromToday(offset),
      taskType,
      status,
      completedAt: status === "completed" ? new Date().toISOString() : null,
      createdAt: null,
    }),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        description="Reparte tus sesiones por días y marca lo que vas cumpliendo."
        title="Calendario"
      />
      <CalendarClient initialSessions={sessions} userId="preview" />
    </div>
  );
}
