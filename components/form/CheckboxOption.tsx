import { memo } from "react";
import { cn } from "@/lib/cn";

type CheckboxOptionProps = {
  sectionId: string;
  choiceId: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: (sectionId: string, choiceId: string) => void;
};

export const CheckboxOption = memo(function CheckboxOption({
  sectionId,
  choiceId,
  label,
  checked,
  disabled,
  onToggle,
}: CheckboxOptionProps) {
  return (
    <label
      className={cn(
        "relative flex min-h-14 cursor-pointer select-none items-center gap-4 rounded-xl border px-4 py-3.5",
        "transition-[background-color,border-color,transform] duration-200 ease-out active:scale-[0.992]",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
        checked
          ? "border-accent bg-accent-soft"
          : "border-border hover:border-muted/40 hover:bg-subtle",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={() => onToggle(sectionId, choiceId)}
      />
      <span
        aria-hidden="true"
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-md border-[1.5px] transition-colors duration-200",
          checked ? "border-accent bg-accent text-accent-foreground" : "border-muted/50 bg-background",
        )}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className={cn(
            "size-4 transition-[opacity,transform] duration-200 ease-out",
            checked ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
        >
          <path
            d="M3.5 8.5l3 3 6-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-[1.0625rem] leading-snug">{label}</span>
    </label>
  );
});
