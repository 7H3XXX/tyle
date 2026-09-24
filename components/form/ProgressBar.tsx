type ProgressBarProps = {
  current: number;
  total: number;
  label: string;
};

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const progress = current / total;
  return (
    <div
      role="progressbar"
      aria-label="Progression"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-valuetext={`Thème ${current} sur ${total} : ${label}`}
      className="flex flex-1 items-center gap-3"
    >
      <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-border">
        <div
          className="h-full origin-left rounded-full bg-accent transition-transform duration-300 ease-out"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
      <span className="text-sm tabular-nums text-muted">
        {current} / {total}
      </span>
    </div>
  );
}
