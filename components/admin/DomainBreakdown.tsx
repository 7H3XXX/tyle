import type { DomainStat } from "@/lib/analytics/aggregate";
import { Bar } from "./Bar";
import { formatNumber, formatPercent } from "./format";

export function DomainBreakdown({ domains }: { domains: DomainStat[] }) {
  return (
    <ul className="flex flex-col">
      {domains.map((d) => (
        <li key={d.id} className="flex flex-col gap-2 border-b border-border py-4 last:border-b-0">
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-medium">{d.title}</span>
            <span className="tabular-nums">
              {formatNumber(d.averageSelected)} / {d.maximum}
              <span className="ml-3 text-sm text-muted">{formatPercent(d.averagePercentage)}</span>
            </span>
          </div>
          <Bar percentage={d.averagePercentage} />
          <p className="text-sm text-muted">
            {formatPercent(d.atLeastOnePercentage)} ont coché au moins une case ·{" "}
            {formatPercent(d.atLeastHalfPercentage)} au moins la moitié · médiane{" "}
            {formatNumber(d.medianSelected)}
          </p>
        </li>
      ))}
    </ul>
  );
}
