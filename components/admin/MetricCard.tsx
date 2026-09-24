type MetricCardProps = {
  label: string;
  value: string;
  suffix?: string;
};

/**
 * One overview figure inside the dashboard's <dl>. The top rule is a border rather than a
 * <Separator>: a <dl> group may only contain <dt>/<dd>.
 */
export function MetricCard({ label, value, suffix }: MetricCardProps) {
  return (
    <div className="flex flex-col gap-1 border-t pt-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-[1.75rem] font-semibold tabular-nums tracking-tight">
        {value}
        {suffix && <span className="ml-1 text-base font-normal text-muted-foreground">{suffix}</span>}
      </dd>
    </div>
  );
}
