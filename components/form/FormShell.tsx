"use client";

import { useCallback, useEffect, useReducer, useRef, type CSSProperties, type ReactNode } from "react";
import type { Questionnaire, SubmissionMode, SubmissionResult } from "@/lib/form/types";
import { BrandMark } from "./BrandMark";
import { CoverScreen } from "./CoverScreen";
import { formReducer, initialFormState } from "./formReducer";
import { ProgressBar } from "./ProgressBar";
import { ResultScreen } from "./ResultScreen";
import { SectionStep } from "./SectionStep";
import { StepNavigation } from "./StepNavigation";

const SUBMIT_TIMEOUT_MS = 15_000;

type FormShellProps = {
  questionnaire: Questionnaire;
  /** "test" submissions are stored apart from live data (admin preview). */
  mode?: SubmissionMode;
  /** Optional banner rendered above the form, e.g. the preview notice. */
  notice?: ReactNode;
};

export function FormShell({ questionnaire, mode = "live", notice }: FormShellProps) {
  const { sections, branding } = questionnaire;
  const [state, dispatch] = useReducer(formReducer, sections.length, initialFormState);
  const inFlight = useRef(false);
  const mainRef = useRef<HTMLElement>(null);
  const renderedStep = useRef(-1);

  const { step, answers, status, result } = state;
  const section = step >= 0 && step < sections.length ? sections[step] : null;
  const isLast = step === sections.length - 1;

  // Move focus to the new step's heading so keyboard and screen-reader users follow along.
  useEffect(() => {
    if (renderedStep.current === step) return;
    renderedStep.current = step;
    window.scrollTo({ top: 0 });
    mainRef.current?.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
  }, [step]);

  const toggle = useCallback(
    (sectionId: string, choiceId: string) => dispatch({ type: "toggle", sectionId, choiceId }),
    [],
  );

  async function submit() {
    if (inFlight.current) return;
    inFlight.current = true;
    dispatch({ type: "submit" });
    try {
      // Absolute URL from origin: a page opened as https://user:pass@host/… can't fetch relative URLs.
      const response = await fetch(new URL("/api/responses", window.location.origin), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          mode,
          timing: state.startedAt ? { totalMs: Date.now() - state.startedAt } : undefined,
        }),
        signal: AbortSignal.timeout(SUBMIT_TIMEOUT_MS),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = (await response.json()) as SubmissionResult;
      dispatch({ type: "submitted", result: data });
    } catch (error) {
      console.warn("Submission failed", error);
      dispatch({ type: "failed" });
    } finally {
      inFlight.current = false;
    }
  }

  // A per-form brand colour drives shadcn's primary and focus-ring tokens.
  const brandStyle = branding.accentColor
    ? ({ "--primary": branding.accentColor, "--ring": branding.accentColor } as CSSProperties)
    : undefined;
  const animation =
    step === -1
      ? "step-fade"
      : state.direction === "forward"
        ? "step-forward"
        : "step-backward";

  return (
    <div style={brandStyle} className="flex min-h-svh flex-col overflow-x-clip">
      {notice}
      <header className="mx-auto flex w-full max-w-180 items-center gap-5 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8 sm:pt-8">
        <BrandMark branding={branding} />
        {section && (
          <ProgressBar current={step + 1} total={sections.length} label={section.title} />
        )}
      </header>

      <main
        ref={mainRef}
        className="mx-auto flex w-full max-w-180 flex-1 flex-col px-5 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-8"
      >
        <div key={step} className={`flex flex-1 flex-col ${animation}`}>
          {step === -1 && (
            <CoverScreen
              questionnaire={questionnaire}
              onStart={() => dispatch({ type: "start", now: Date.now() })}
            />
          )}

          {section && (
            <div className="flex flex-1 flex-col pt-10 sm:pt-16">
              <SectionStep
                section={section}
                selected={answers[section.id] ?? []}
                onToggle={toggle}
                disabled={status === "submitting"}
              />
              <StepNavigation
                isLast={isLast}
                status={status}
                onBack={() => dispatch({ type: "back" })}
                onNext={isLast ? submit : () => dispatch({ type: "next" })}
              />
            </div>
          )}

          {step === sections.length && result && (
            <ResultScreen
              questionnaire={questionnaire}
              result={result}
              onRestart={() => dispatch({ type: "restart" })}
            />
          )}
        </div>
      </main>
    </div>
  );
}
