import type { Questionnaire, SubmissionResult } from "@/lib/form/types";
import { Button } from "./Button";

type ResultScreenProps = {
  questionnaire: Questionnaire;
  result: SubmissionResult;
  onRestart: () => void;
};

export function ResultScreen({ questionnaire, result, onRestart }: ResultScreenProps) {
  const band = questionnaire.resultBands.find((b) => b.id === result.band);

  return (
    <div className="flex flex-1 flex-col pt-12 sm:pt-20">
      <p className="text-sm font-medium text-muted">Votre résultat</p>
      <h1
        tabIndex={-1}
        className="mt-3 text-[2.25rem] font-semibold leading-[1.1] tracking-tight outline-none sm:text-[3rem]"
      >
        <span className="tabular-nums">{result.total}</span> case{result.total > 1 ? "s" : ""} cochée
        {result.total > 1 ? "s" : ""} sur <span className="tabular-nums">{result.maximum}</span>.
      </h1>
      <p className="mt-4 text-lg text-muted">Consultez votre résultat.</p>

      {band && (
        <div className="mt-8 border-l-2 border-accent py-1 pl-5">
          <p className="text-lg leading-relaxed">
            <strong className="font-semibold">{band.title}</strong> : {band.description}
          </p>
        </div>
      )}

      <section aria-labelledby="domains-heading" className="mt-14">
        <h2 id="domains-heading" className="text-sm font-medium text-muted">
          Détail par thème
        </h2>
        <ul className="mt-4 flex flex-col">
          {questionnaire.sections.map((section) => {
            const domain = result.domains[section.id];
            if (!domain) return null;
            return (
              <li key={section.id} className="border-b border-border py-3.5 last:border-b-0">
                <div className="flex items-baseline justify-between gap-4">
                  <span>{section.title}</span>
                  <span className="text-sm tabular-nums text-muted">
                    {domain.selected} / {domain.maximum}
                  </span>
                </div>
                <div aria-hidden="true" className="mt-2 h-1 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${domain.percentage}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {questionnaire.disclaimer && (
        <p className="mt-10 text-[0.8125rem] leading-relaxed text-muted">{questionnaire.disclaimer}</p>
      )}

      <div className="mt-10 pb-4">
        <Button variant="ghost" onClick={onRestart} className="-ml-2 px-3">
          Recommencer le questionnaire
        </Button>
      </div>
    </div>
  );
}
