import { describe, expect, it } from "vitest";
import { questionnaire } from "@/lib/form/questionnaire";
import { calculateScore } from "@/lib/form/scoring";
import type { Answers, Submission } from "@/lib/form/types";
import { checkSubmissionIntegrity } from "./integrity";

function persisted(answers: Answers): Submission {
  const score = calculateScore(answers, questionnaire);
  return {
    id: "00000000-0000-4000-8000-000000000000",
    questionnaireId: questionnaire.id,
    mode: "test",
    createdAt: "2026-09-24T10:00:00.000Z",
    answers,
    totalSelected: score.total,
    bandId: score.band.id,
    domainScores: score.domains,
  };
}

describe("checkSubmissionIntegrity", () => {
  it("accepts a record produced by the API pipeline", () => {
    const record = persisted({ energie: ["energie-1", "energie-2"], immunite: ["immunite-3"] });
    expect(checkSubmissionIntegrity(record, questionnaire)).toEqual([]);
  });

  it("flags stored totals, bands and domains that disagree with the answers", () => {
    const record = {
      ...persisted({ energie: ["energie-1"] }),
      totalSelected: 7,
      bandId: "probable",
    };
    record.domainScores = { ...record.domainScores, energie: { selected: 3, maximum: 5, percentage: 60 } };

    expect(checkSubmissionIntegrity(record, questionnaire).map((i) => i.field)).toEqual([
      "totalSelected",
      "bandId",
      "domainScores.energie.selected",
    ]);
  });

  it("flags records from another questionnaire", () => {
    const record = { ...persisted({}), questionnaireId: "other" };
    expect(checkSubmissionIntegrity(record, questionnaire)).toContainEqual({
      field: "questionnaireId",
      stored: "other",
      expected: questionnaire.id,
    });
  });
});
