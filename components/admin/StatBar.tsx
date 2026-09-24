import type { ReactNode } from "react";
import { Progress, ProgressLabel } from "@/components/ui/progress";

type StatBarProps = {
  label: ReactNode;
  /** 0–100. */
  percentage: number;
  /** Visible value text, e.g. "12 · 40 %". */
  valueText: string;
  /** Screen-reader text for the bar; defaults to valueText. */
  ariaValueText?: string;
};

/** Labelled horizontal bar used across the dashboard. */
export function StatBar({ label, percentage, valueText, ariaValueText }: StatBarProps) {
  return (
    <Progress
      value={Math.min(100, Math.max(0, percentage))}
      aria-valuetext={ariaValueText ?? valueText}
      className="gap-2"
    >
      <ProgressLabel className="min-w-0 flex-1">{label}</ProgressLabel>
      <span aria-hidden="true" className="text-sm tabular-nums text-muted-foreground">
        {valueText}
      </span>
    </Progress>
  );
}
