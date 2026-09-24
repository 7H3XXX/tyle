import { questionnaire } from "@/lib/form/questionnaire";
import { calculateScore } from "@/lib/form/scoring";
import type { Submission, SubmissionResult } from "@/lib/form/types";
import { parseSubmissionRequest } from "@/lib/form/validation";
import { saveSubmission } from "@/lib/storage/submissions";

const MAX_BODY_BYTES = 16 * 1024;
const NO_STORE = { "Cache-Control": "no-store" };

function error(status: number, code: string) {
  return Response.json({ error: code }, { status, headers: NO_STORE });
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return error(415, "unsupported_media_type");
  }

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) return error(413, "payload_too_large");

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return error(400, "invalid_json");
  }

  const parsed = parseSubmissionRequest(body, questionnaire);
  if (!parsed.ok) return error(400, "invalid_payload");

  // Scores are always recomputed here; any client-supplied totals are ignored.
  const score = calculateScore(parsed.value.answers, questionnaire);
  const submission: Submission = {
    id: crypto.randomUUID(),
    questionnaireId: questionnaire.id,
    mode: parsed.value.mode,
    createdAt: new Date().toISOString(),
    answers: parsed.value.answers,
    totalSelected: score.total,
    bandId: score.band.id,
    domainScores: score.domains,
    ...(parsed.value.timing && { timing: parsed.value.timing }),
  };

  try {
    await saveSubmission(submission);
  } catch (err) {
    console.error("[api/responses] failed to persist submission", {
      submissionId: submission.id,
      mode: submission.mode,
      error: err instanceof Error ? err.message : String(err),
    });
    return error(503, "storage_unavailable");
  }

  const result: SubmissionResult = {
    submissionId: submission.id,
    total: score.total,
    maximum: score.maximum,
    band: score.band.id,
    domains: score.domains,
  };
  return Response.json(result, { status: 201, headers: NO_STORE });
}
