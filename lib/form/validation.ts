import type { Answers, Questionnaire, SubmissionMode, SubmissionTiming } from "./types";

export type ParsedSubmissionRequest = {
  answers: Answers;
  mode: SubmissionMode;
  timing?: SubmissionTiming;
};

export type ParseResult =
  | { ok: true; value: ParsedSubmissionRequest }
  | { ok: false; error: string };

const MAX_TOTAL_MS = 1000 * 60 * 60 * 24;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validates an untrusted `{ answers, mode?, timing? }` payload.
 * Malformed shapes are rejected; unknown section or choice IDs are dropped.
 * Returned answers contain every section, in questionnaire order.
 * The mode defaults to "live"; only an explicit "test" routes to test storage.
 */
export function parseSubmissionRequest(
  body: unknown,
  questionnaire: Questionnaire,
): ParseResult {
  if (!isPlainObject(body) || !isPlainObject(body.answers)) {
    return { ok: false, error: "answers must be an object" };
  }
  const raw = body.answers;

  const answers: Answers = {};
  for (const section of questionnaire.sections) {
    const value = raw[section.id];
    if (value === undefined) {
      answers[section.id] = [];
      continue;
    }
    if (!Array.isArray(value) || value.some((v) => typeof v !== "string")) {
      return { ok: false, error: `answers.${section.id} must be a string array` };
    }
    const picked = new Set(value as string[]);
    answers[section.id] = section.choices
      .filter((c) => picked.has(c.id))
      .map((c) => c.id);
  }

  let timing: SubmissionTiming | undefined;
  if (isPlainObject(body.timing)) {
    const totalMs = body.timing.totalMs;
    if (
      typeof totalMs === "number" &&
      Number.isFinite(totalMs) &&
      totalMs >= 0 &&
      totalMs <= MAX_TOTAL_MS
    ) {
      timing = { totalMs: Math.round(totalMs) };
    }
  }

  // Anything other than an explicit "test" is a live response.
  const mode: SubmissionMode = body.mode === "test" ? "test" : "live";

  return { ok: true, value: { answers, mode, timing } };
}
