import { DashboardView } from "@/components/dashboard/dashboard-view";
import type { BallState } from "@/components/ui/Ball";

const states: BallState[] = Array.from({ length: 75 }, (_, index) => {
  const n = index + 1;

  if (n % 11 === 0 || n % 13 === 0) return "off";
  if (n <= 12) return "mastered";
  if (n <= 27 || n % 7 === 0) return "studied";
  if (n <= 40 || n % 5 === 0) return "started";
  return "selected";
});

export default function DevPreviewInicio() {
  return (
    <DashboardView
      balls={states.map((state, index) => ({
        id: String(index),
        number: index + 1,
        title: `Tema ${index + 1}`,
        state,
      }))}
      communityName="Andalucía"
      daysRemaining={207}
      firstName="Marta"
      game={{
        xpTotal: 640,
        xpThisWeek: 85,
        streak: 12,
        bestStreak: 12,
        studiedToday: true,
        level: { number: 3, name: "Preparador dedicado", minXp: 500, nextXp: 900 },
        levelPercent: 35,
        xpToNextLevel: 260,
      }}
      hasPlan
      loadError={null}
      oppositionDateLabel="19 de junio de 2027"
      practicals={{ total: 6, worked: 4, mastered: 2 }}
      specialtyName="Biología y Geología"
      topics={{ selected: 62, summarized: 38, studied: 27, reviews: 41, simulations: 5 }}
      upcomingTasks={[
        { id: "1", dateLabel: "hoy", isToday: true, title: "Tema 14: La célula eucariota", type: "study_topic", durationLabel: null },
        { id: "2", dateLabel: "mar, 24 nov", isToday: false, title: "Problemas de genética mendeliana", type: "practical", durationLabel: null },
        { id: "3", dateLabel: "mié, 25 nov", isToday: false, title: "Repaso temas 1 a 5", type: "study_topic", durationLabel: null },
        { id: "4", dateLabel: "dom, 29 nov", isToday: false, title: "Descanso", type: "rest", durationLabel: null },
      ]}
      week={{ completed: 3, pending: 2 }}
    />
  );
}
