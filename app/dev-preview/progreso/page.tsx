import { ProgressView } from "@/components/progress/progress-view";

export default function DevPreviewProgreso() {
  return (
    <ProgressView
      generalPercent={46}
      loadError={null}
      nextTaskLabel="24 nov 2026"
      practicals={{ total: 6, notStarted: 2, worked: 2, mastered: 2, attempts: 11 }}
      recommendations={[
        "Tienes 35 temas elegidos sin estudiar. Reserva dos sesiones esta semana para los de prioridad alta.",
        "Llevas dos prácticos sin empezar. Trabaja uno antes del domingo.",
      ]}
      tasks={{ total: 24, pending: 9, completed: 13, cancelled: 2, studyTopic: 15, practical: 6, rest: 3 }}
      topics={{ total: 75, selected: 62, summarized: 38, studied: 27, reviews: 41, simulations: 5, highPriority: 12, highMastery: 12 }}
    />
  );
}
