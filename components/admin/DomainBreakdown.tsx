import type { DomainStat } from "@/lib/analytics/aggregate";
import { formatNumber, formatPercent } from "./format";
import { StatBar } from "./StatBar";

export function DomainBreakdown({ domains }: { domains: DomainStat[] }) {
  return (
    <ul className="flex flex-col gap-6">
      {domains.map((d) => (
        <li key={d.id} className="flex flex-col gap-2">
          <StatBar
            label={d.title}
            percentage={d.averagePercentage}
            valueText={`${formatNumber(d.averageSelected)} / ${d.maximum} · ${formatPercent(d.averagePercentage)}`}
            ariaValueText={`Moyenne ${formatNumber(d.averageSelected)} sur ${d.maximum}`}
          />
          <p className="text-sm text-muted-foreground">
            {formatPercent(d.atLeastOnePercentage)} ont coché au moins une case ·{" "}
            {formatPercent(d.atLeastHalfPercentage)} au moins la moitié · médiane{" "}
            {formatNumber(d.medianSelected)}
          </p>
        </li>
      ))}
    </ul>
  );
}
