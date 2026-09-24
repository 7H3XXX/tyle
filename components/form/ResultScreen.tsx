import { RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import type { Questionnaire, SubmissionResult } from "@/lib/form/types";

type ResultScreenProps = {
  questionnaire: Questionnaire;
  result: SubmissionResult;
  onRestart: () => void;
};

export function ResultScreen({ questionnaire, result, onRestart }: ResultScreenProps) {
  const band = questionnaire.resultBands.find((b) => b.id === result.band);
  const plural = result.total > 1 ? "s" : "";

  return (
    <div className="flex flex-1 flex-col pt-12 sm:pt-20">
      <p className="text-sm font-medium text-muted-foreground">Votre résultat</p>
      <h1
        tabIndex={-1}
        className="mt-3 text-[2.25rem] font-semibold leading-[1.1] tracking-tight outline-none sm:text-[3rem]"
      >
        <span className="tabular-nums">{result.total}</span> case{plural} cochée{plural} sur{" "}
        <span className="tabular-nums">{result.maximum}</span>.
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">Consultez votre résultat.</p>

      {band && (
        <div className="mt-8 border-l-2 border-primary py-1 pl-5">
          <p className="text-lg leading-relaxed">
            <strong className="font-semibold">{band.title}</strong> : {band.description}
          </p>
        </div>
      )}

      <section aria-labelledby="domains-heading" className="mt-14">
        <h2 id="domains-heading" className="text-sm font-medium text-muted-foreground">
          Détail par thème
        </h2>
        <ul className="mt-4 flex flex-col gap-5">
          {questionnaire.sections.map((section) => {
            const domain = result.domains[section.id];
            if (!domain) return null;
            return (
              <li key={section.id}>
                <Progress
                  value={domain.selected}
                  max={domain.maximum}
                  aria-valuetext={`${domain.selected} sur ${domain.maximum}`}
                >
                  <ProgressLabel>{section.title}</ProgressLabel>
                  <span aria-hidden="true" className="ml-auto text-sm tabular-nums text-muted-foreground">
                    {domain.selected} / {domain.maximum}
                  </span>
                </Progress>
              </li>
            );
          })}
        </ul>
      </section>

      {questionnaire.disclaimer && (
        <p className="mt-10 text-[0.8125rem] leading-relaxed text-muted-foreground">
          {questionnaire.disclaimer}
        </p>
      )}

      <div className="mt-10 pb-4">
        <Button variant="ghost" size="xl" onClick={onRestart} className="-ml-3">
          <RotateCcwIcon data-icon="inline-start" />
          Recommencer le questionnaire
        </Button>
      </div>
    </div>
  );
}
