import { Fragment } from "react";
import { FieldDescription, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import type { Section } from "@/lib/form/types";
import { CheckboxOption } from "./CheckboxOption";

/** Allows long titles such as "Hormones/température" to wrap after the slash on narrow screens. */
function breakableTitle(title: string) {
  return title.split("/").map((part, i) => (
    <Fragment key={i}>
      {i > 0 && (
        <>
          /<wbr />
        </>
      )}
      {part}
    </Fragment>
  ));
}

type SectionStepProps = {
  section: Section;
  selected: string[];
  disabled?: boolean;
  onToggle: (sectionId: string, choiceId: string) => void;
};

export function SectionStep({ section, selected, disabled, onToggle }: SectionStepProps) {
  const count = selected.length;
  const hintId = `${section.id}-hint`;

  return (
    <FieldSet aria-describedby={hintId} className="min-w-0">
      <FieldLegend className="w-full">
        <h1
          tabIndex={-1}
          className="text-[2rem] font-semibold leading-[1.15] tracking-tight outline-none sm:text-[2.5rem]"
        >
          {breakableTitle(section.title)}
        </h1>
      </FieldLegend>
      <FieldDescription id={hintId}>Cochez ce qui vous correspond, ou rien, puis continuez.</FieldDescription>

      <FieldGroup data-slot="checkbox-group" className="mt-4 gap-2.5">
        {section.choices.map((choice) => (
          <CheckboxOption
            key={choice.id}
            sectionId={section.id}
            choiceId={choice.id}
            label={choice.label}
            checked={selected.includes(choice.id)}
            disabled={disabled}
            onToggle={onToggle}
          />
        ))}
      </FieldGroup>

      <p aria-live="polite" className="h-5 text-sm tabular-nums text-muted-foreground">
        {count > 0 && `${count} sur ${section.choices.length} sélectionnée${count > 1 ? "s" : ""}`}
      </p>
    </FieldSet>
  );
}
