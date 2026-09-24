import type { Answers, Questionnaire, SubmissionTiming } from "./types";

export type ParsedSubmissionRequest = {
  answers: Answers;
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
 * Validates an untrusted `{ answers, timing? }` payload.
 * Malformed shapes are rejected; unknown section or choice IDs are dropped.
 * Returned answers contain every section, in questionnaire order.
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

  return { ok: true, value: { answers, timing } };
}
