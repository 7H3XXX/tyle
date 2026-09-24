import { ArrowRightIcon, ChevronLeftIcon, CircleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { FormState } from "./formReducer";

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
    <div className="mt-auto flex flex-col gap-5 pt-8">
      {failed && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Impossible d&apos;enregistrer votre réponse pour le moment.</AlertTitle>
          <AlertDescription>Veuillez réessayer.</AlertDescription>
        </Alert>
      )}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="xl" onClick={onBack} disabled={submitting} className="-ml-3">
          <ChevronLeftIcon data-icon="inline-start" />
          Retour
        </Button>
        <Button
          size="xl"
          onClick={onNext}
          disabled={submitting}
          aria-busy={submitting || undefined}
          className="ml-auto min-w-40 flex-1 sm:flex-none"
        >
          {submitting && <Spinner data-icon="inline-start" aria-hidden="true" />}
          {nextLabel}
          {!submitting && !failed && <ArrowRightIcon data-icon="inline-end" />}
        </Button>
      </div>
    </div>
  );
}
