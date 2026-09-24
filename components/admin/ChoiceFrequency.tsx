import type { ChoiceStat } from "@/lib/analytics/aggregate";
import { formatPercent } from "./format";
import { StatBar } from "./StatBar";

export function ChoiceFrequency({ choices }: { choices: ChoiceStat[] }) {
  return (
    <ol className="flex flex-col gap-4">
      {choices.map((c) => (
        <li key={c.id}>
          <StatBar
            label={
              <span className="font-normal">
                {c.label}
                <span className="ml-2 text-muted-foreground">{c.sectionTitle}</span>
              </span>
            }
            percentage={c.percentage}
            valueText={`${c.count} · ${formatPercent(c.percentage)}`}
          />
        </li>
      ))}
    </ol>
  );
}
