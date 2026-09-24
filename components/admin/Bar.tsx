/** Decorative horizontal bar; the numeric value is always rendered as text next to it. */
export function Bar({ percentage }: { percentage: number }) {
  return (
    <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-border">
      <div
        className="h-full rounded-full bg-accent"
        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
      />
    </div>
  );
}
