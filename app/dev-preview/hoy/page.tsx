import { notFound } from "next/navigation";
import { TodayClient } from "@/components/today/today-client";
import { addDays, toDateKey } from "@/lib/study/sessions";
import type { TodaySession } from "@/lib/study/today";

export const dynamic = "force-dynamic";

const samples: Array<[number, string, string, string, number | null, string]> = [
  [-6, "Tema 3: La célula eucariota", "study_topic", "completed", 90, ""],
  [-5, "Tema 7: Metabolismo celular", "study_topic", "completed", 90, ""],
  [-4, "Repaso: Tema 3: La célula eucariota", "study_topic", "pending", 30, ""],
  [-3, "Tema 12: Tectónica de placas", "study_topic", "completed", 90, ""],
  [-2, "Práctico: Problema de genética ligada al sexo", "practical", "pending", 60, ""],
  [-1, "Repaso: Tema 7: Metabolismo celular", "study_topic", "completed", 30, ""],
  [0, "Tema 15: El sistema inmunitario", "study_topic", "pending", 90, "Apartados 1 a 4 y esquema."],
  [0, "Repaso: Tema 12: Tectónica de placas", "study_topic", "pending", 30, ""],
  [0, "Práctico: Claves dicotómicas", "practical", "pending", 60, ""],
  [0, "Repaso: Tema 3: La célula eucariota", "study_topic", "completed", 30, ""],
  [1, "Tema 16: Genética mendeliana", "study_topic", "pending", 90, ""],
  [1, "Simulacro: Tema 3: La célula eucariota", "study_topic", "pending", 120, ""],
];

// Development-only preview with made-up sessions; never reaches the network.
export default function TodayPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const todayKey = toDateKey(new Date());
  const sessions: TodaySession[] = samples.map(
    ([offset, title, taskType, status, minutes, description], index) => {
      const taskDate = addDays(todayKey, offset);

      return {
        id: `preview-${index}`,
        title,
        description,
        taskDate,
        taskType,
        status,
        completedAt: status === "completed" ? `${taskDate}T10:00:00` : null,
        userTopicId: null,
        userPracticalId: null,
        estimatedMinutes: minutes,
      };
    },
  );

  return (
    <TodayClient
      hasPlan
      initialSessions={sessions}
      preview
      todayKey={todayKey}
      userId="preview"
    />
  );
}
