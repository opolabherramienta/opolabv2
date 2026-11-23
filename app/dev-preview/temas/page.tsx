import { notFound } from "next/navigation";
import { TopicsClient, type TopicItem } from "@/components/topics/topics-client";
import { PageHeader } from "@/components/ui/PageHeader";

// Development-only preview with made-up data. Never reaches production.
const sampleTitles = [
  "La Tierra en el universo. Geología de los planetas",
  "Estructura y composición de la Tierra. Métodos de estudio",
  "La materia mineral y la materia cristalina",
  "Magmatismo. Las rocas ígneas",
  "Metamorfismo. Las rocas metamórficas",
  "Meteorización, erosión, transporte y sedimentación",
  "La tectónica de placas y sus consecuencias",
  "La atmósfera: estructura, composición y dinámica",
  "La hidrosfera. El ciclo del agua",
  "El modelado del relieve. Sistemas morfoclimáticos",
  "El origen de la vida y su interpretación histórica",
  "La base química de la vida: bioelementos y biomoléculas",
  "Glúcidos y lípidos. Funciones biológicas",
  "Proteínas y enzimas",
  "Ácidos nucleicos. Replicación y transcripción",
  "La célula: unidad de estructura y función",
  "La membrana plasmática y la pared celular",
  "El metabolismo celular. Respiración y fermentación",
  "La fotosíntesis y la quimiosíntesis",
  "El ciclo celular. Mitosis y meiosis",
  "Genética mendeliana y teoría cromosómica de la herencia",
  "Genética molecular. Ingeniería genética",
  "La evolución: mecanismos y pruebas",
  "Los virus y los microorganismos",
  "El sistema inmunitario",
];

function buildTopic(index: number): TopicItem {
  const number = index + 1;
  const kind = (number * 7) % 10;
  const isSelected = kind < 7;
  const studiedDone = isSelected && kind < 4;
  const mastered = isSelected && kind < 2;
  const summaryDone = isSelected && kind < 5;
  const round = Math.floor(index / sampleTitles.length);

  return {
    id: null,
    baseTopicId: `preview-${number}`,
    topicNumber: number,
    title:
      sampleTitles[index % sampleTitles.length] +
      (round > 0 ? ` (parte ${round + 1})` : ""),
    description:
      number % 3 === 0
        ? "Contenido oficial del tema según el temario de la especialidad."
        : null,
    isSelected,
    summaryDone,
    studiedDone,
    reviewCount: studiedDone ? (number % 4) + 1 : summaryDone ? number % 2 : 0,
    simulationCount: mastered ? (number % 3) + 1 : 0,
    priorityLevel: number % 9 === 0 ? "high" : number % 4 === 0 ? "medium" : "low",
    masteryLevel: mastered ? "high" : studiedDone ? "medium" : "low",
    personalNotes: number === 1 ? "Repasar la parte de planetología comparada." : "",
  };
}

export default function TemasPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const topics = Array.from({ length: 75 }, (_, index) => buildTopic(index));

  return (
    <div className="space-y-8">
      <PageHeader
        description="Vista previa con datos de ejemplo. Los cambios no se guardan."
        title="Mis temas"
      />
      <TopicsClient initialTopics={topics} userId="preview" />
    </div>
  );
}
