import type { ChoiceStat } from "@/lib/analytics/aggregate";
import { Bar } from "./Bar";
import { formatPercent } from "./format";

export function ChoiceFrequency({ choices }: { choices: ChoiceStat[] }) {
  return (
    <ol className="flex flex-col">
      {choices.map((c) => (
        <li key={c.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 py-2.5">
          <span className="min-w-0">
            {c.label}
            <span className="ml-2 text-sm text-muted">{c.sectionTitle}</span>
          </span>
          <span className="text-sm tabular-nums text-muted">
            {c.count} · {formatPercent(c.percentage)}
          </span>
          <div className="col-span-2">
            <Bar percentage={c.percentage} />
          </div>
        </li>
      ))}
    </ol>
  );
}
