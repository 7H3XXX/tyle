import type { Answers, SubmissionResult } from "@/lib/form/types";

/** step: -1 = cover, 0..sectionCount-1 = sections, sectionCount = result. */
export type FormState = {
  step: number;
  sectionCount: number;
  direction: "forward" | "backward";
  answers: Answers;
  status: "idle" | "submitting" | "error";
  result: SubmissionResult | null;
  startedAt: number | null;
};

export type FormAction =
  | { type: "start"; now: number }
  | { type: "next" }
  | { type: "back" }
  | { type: "toggle"; sectionId: string; choiceId: string }
  | { type: "submit" }
  | { type: "submitted"; result: SubmissionResult }
  | { type: "failed" }
  | { type: "restart" };

export function initialFormState(sectionCount: number): FormState {
  return {
    step: -1,
    sectionCount,
    direction: "forward",
    answers: {},
    status: "idle",
    result: null,
    startedAt: null,
  };
}

export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "start":
      return { ...state, step: 0, direction: "forward", startedAt: action.now };
    case "next":
      if (state.step >= state.sectionCount - 1) return state;
      return { ...state, step: state.step + 1, direction: "forward", status: "idle" };
    case "back":
      if (state.step < 0 || state.status === "submitting") return state;
      return { ...state, step: state.step - 1, direction: "backward", status: "idle" };
    case "toggle": {
      const current = state.answers[action.sectionId] ?? [];
      const selected = current.includes(action.choiceId)
        ? current.filter((id) => id !== action.choiceId)
        : [...current, action.choiceId];
      return { ...state, answers: { ...state.answers, [action.sectionId]: selected } };
    }
    case "submit":
      return { ...state, status: "submitting" };
    case "submitted":
      return {
        ...state,
        status: "idle",
        result: action.result,
        step: state.sectionCount,
        direction: "forward",
      };
    case "failed":
      return { ...state, status: "error" };
    case "restart":
      return initialFormState(state.sectionCount);
  }
}
