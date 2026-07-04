import { Card } from "@/components/ui/Card";

type StatCardTone = "violet" | "green" | "orange";

type StatCardProps = {
  label: string;
  value: string;
  tone?: StatCardTone;
};

const toneClasses: Record<StatCardTone, string> = {
  violet: "text-violet-700 bg-violet-50",
  green: "text-emerald-700 bg-emerald-50",
  orange: "text-orange-700 bg-orange-50",
};

export function StatCard({ label, value, tone = "violet" }: StatCardProps) {
  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p
        className={[
          "mt-4 inline-flex rounded-lg px-3 py-2 text-2xl font-bold",
          toneClasses[tone],
        ].join(" ")}
      >
        {value}
      </p>
    </Card>
  );
}
