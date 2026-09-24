import { memo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";

type CheckboxOptionProps = {
  sectionId: string;
  choiceId: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: (sectionId: string, choiceId: string) => void;
};

/** shadcn "choice card": the whole card is the label, so the full surface toggles the checkbox. */
export const CheckboxOption = memo(function CheckboxOption({
  sectionId,
  choiceId,
  label,
  checked,
  disabled,
  onToggle,
}: CheckboxOptionProps) {
  const id = `choice-${choiceId}`;

  return (
    <FieldLabel
      htmlFor={id}
      className="rounded-xl *:data-[slot=field]:min-h-14 *:data-[slot=field]:px-4 *:data-[slot=field]:py-3.5"
    >
      <Field orientation="horizontal" data-disabled={disabled || undefined} className="items-center gap-4">
        <Checkbox
          id={id}
          checked={checked}
          disabled={disabled}
          onCheckedChange={() => onToggle(sectionId, choiceId)}
          className="size-5"
        />
        <FieldContent>
          <span className="text-[1.0625rem] font-normal leading-snug">{label}</span>
        </FieldContent>
      </Field>
    </FieldLabel>
  );
});
