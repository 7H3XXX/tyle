import { Progress } from "@/components/ui/progress";

type ProgressBarProps = {
  current: number;
  total: number;
  label: string;
};

/** Section progress: (index + 1) / total, announced as "Thème 3 sur 7 : …". */
export function ProgressBar({ current, total, label }: ProgressBarProps) {
  return (
    <Progress
      value={current}
      max={total}
      aria-label="Progression"
      aria-valuetext={`Thème ${current} sur ${total} : ${label}`}
      className="flex-1 flex-nowrap items-center"
    >
      <span aria-hidden="true" className="order-last shrink-0 whitespace-nowrap text-sm tabular-nums text-muted-foreground">
        {current} / {total}
      </span>
    </Progress>
  );
}
