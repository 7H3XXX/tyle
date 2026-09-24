import { Fragment } from "react";
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
  const hintId = `${section.id}-hint`;
  const count = selected.length;

  return (
    <fieldset aria-describedby={hintId} className="min-w-0">
      <legend className="w-full">
        <h1
          tabIndex={-1}
          className="text-[2rem] font-semibold leading-[1.15] tracking-tight outline-none sm:text-[2.5rem]"
        >
          {breakableTitle(section.title)}
        </h1>
      </legend>
      <p id={hintId} className="mt-3 text-base leading-relaxed text-muted">
        Cochez ce qui vous correspond, ou rien, puis continuez.
      </p>

      <div className="mt-8 flex flex-col gap-2.5">
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
      </div>

      <p aria-live="polite" className="mt-4 h-5 text-sm tabular-nums text-muted">
        {count > 0 && `${count} sur ${section.choices.length} sélectionnée${count > 1 ? "s" : ""}`}
      </p>
    </fieldset>
  );
}
