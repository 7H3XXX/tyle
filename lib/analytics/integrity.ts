import { calculateScore } from "@/lib/form/scoring";
import type { Questionnaire, Submission } from "@/lib/form/types";

export type IntegrityIssue = {
  field: string;
  stored: unknown;
  expected: unknown;
};

/**
 * Compares what was persisted with what scoring.ts computes from the stored answers.
 * An empty list means the record is internally consistent (the pipeline is wired correctly).
 */
export function checkSubmissionIntegrity(
  submission: Submission,
  questionnaire: Questionnaire,
): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];
  const expected = calculateScore(submission.answers, questionnaire);

  if (submission.questionnaireId !== questionnaire.id) {
    issues.push({ field: "questionnaireId", stored: submission.questionnaireId, expected: questionnaire.id });
  }
  if (submission.totalSelected !== expected.total) {
    issues.push({ field: "totalSelected", stored: submission.totalSelected, expected: expected.total });
  }
  if (submission.bandId !== expected.band.id) {
    issues.push({ field: "bandId", stored: submission.bandId, expected: expected.band.id });
  }
  for (const [sectionId, domain] of Object.entries(expected.domains)) {
    const stored = submission.domainScores?.[sectionId]?.selected;
    if (stored !== domain.selected) {
      issues.push({ field: `domainScores.${sectionId}.selected`, stored, expected: domain.selected });
    }
  }
  return issues;
}
