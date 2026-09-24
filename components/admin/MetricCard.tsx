type MetricCardProps = {
  label: string;
  value: string;
  suffix?: string;
};

export function MetricCard({ label, value, suffix }: MetricCardProps) {
  return (
    <div className="flex flex-col gap-1 border-t border-border pt-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-[1.75rem] font-semibold tabular-nums tracking-tight">
        {value}
        {suffix && <span className="ml-1 text-base font-normal text-muted">{suffix}</span>}
      </dd>
    </div>
  );
}
