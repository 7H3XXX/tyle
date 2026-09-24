import type { FormState } from "./formReducer";
import { Button, Spinner } from "./Button";

type StepNavigationProps = {
  isLast: boolean;
  status: FormState["status"];
  onBack: () => void;
  onNext: () => void;
};

export function StepNavigation({ isLast, status, onBack, onNext }: StepNavigationProps) {
  const submitting = status === "submitting";
  const failed = isLast && status === "error";

  let nextLabel = isLast ? "Voir mon résultat" : "Suivant";
  if (submitting) nextLabel = "Enregistrement…";
  if (failed) nextLabel = "Réessayer";

  return (
    <div className="mt-auto pt-8">
      {failed && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-danger/30 px-4 py-3 text-[0.9375rem] leading-relaxed"
        >
          Impossible d&apos;enregistrer votre réponse pour le moment.
          <br />
          Veuillez réessayer.
        </div>
      )}
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack} disabled={submitting} className="-ml-2 px-3">
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-4">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Retour
        </Button>
        <Button
          onClick={onNext}
          disabled={submitting}
          aria-busy={submitting || undefined}
          className="ml-auto min-w-40 flex-1 sm:flex-none"
        >
          {submitting && <Spinner />}
          {nextLabel}
          {!submitting && !failed && (
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-4">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </Button>
      </div>
    </div>
  );
}
