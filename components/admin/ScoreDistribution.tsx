import type { BandStat } from "@/lib/analytics/aggregate";
import { Bar } from "./Bar";
import { formatPercent } from "./format";

type ScoreDistributionProps = {
  bands: BandStat[];
  distribution: number[];
};

export function ScoreDistribution({ bands, distribution }: ScoreDistributionProps) {
  const peak = Math.max(1, ...distribution);

  return (
    <div className="flex flex-col gap-10">
      <ul className="flex flex-col gap-5">
        {bands.map(({ band, count, percentage }) => (
          <li key={band.id} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-medium">{band.title}</span>
              <span className="text-sm tabular-nums text-muted">
                {count} · {formatPercent(percentage)}
              </span>
            </div>
            <Bar percentage={percentage} />
          </li>
        ))}
      </ul>

      <figure>
        <figcaption className="text-sm text-muted">Répondants par nombre de cases cochées</figcaption>
        <ol className="mt-3 flex h-28 items-end gap-[3px]">
          {distribution.map((count, score) => (
            <li key={score} className="flex h-full flex-1 flex-col justify-end" title={`${score} : ${count}`}>
              <span className="sr-only">
                {score} cases cochées : {count} répondant{count > 1 ? "s" : ""}
              </span>
              <span
                aria-hidden="true"
                className={count ? "rounded-t-sm bg-accent" : "rounded-t-sm bg-border"}
                style={{ height: count ? `${(count / peak) * 100}%` : "2px" }}
              />
            </li>
          ))}
        </ol>
        <div aria-hidden="true" className="mt-1.5 flex justify-between text-xs tabular-nums text-muted">
          <span>0</span>
          <span>{distribution.length - 1}</span>
        </div>
      </figure>
    </div>
  );
}
