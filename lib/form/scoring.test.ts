import { describe, expect, it } from "vitest";
import { aggregate, median } from "@/lib/analytics/aggregate";
import { questionnaire } from "./questionnaire";
import { calculateScore, findBand, maximumScore } from "./scoring";
import type { Answers, Submission } from "./types";
import { parseSubmissionRequest } from "./validation";

const allAnswers = (): Answers =>
  Object.fromEntries(questionnaire.sections.map((s) => [s.id, s.choices.map((c) => c.id)]));

describe("questionnaire", () => {
  it("has 7 sections and 30 choices", () => {
    expect(questionnaire.sections).toHaveLength(7);
    expect(maximumScore(questionnaire)).toBe(30);
  });

  it("uses unique choice IDs", () => {
    const ids = questionnaire.sections.flatMap((s) => s.choices.map((c) => c.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("bands cover every possible total without gaps or overlaps", () => {
    for (let total = 0; total <= 30; total++) {
      const matches = questionnaire.resultBands.filter(
        (b) => total >= b.min && (b.max === undefined || total <= b.max),
      );
      expect(matches).toHaveLength(1);
    }
  });
});

describe("calculateScore", () => {
  it("scores zero selections as 0", () => {
    const r = calculateScore({}, questionnaire);
    expect(r).toMatchObject({ total: 0, maximum: 30, percentage: 0 });
    expect(r.band.id).toBe("normal");
  });

  it("scores one selection as 1", () => {
    const r = calculateScore({ energie: ["energie-1"] }, questionnaire);
    expect(r.total).toBe(1);
    expect(r.domains.energie).toEqual({ selected: 1, maximum: 5, percentage: 20 });
  });

  it("scores all selections as 30", () => {
    const r = calculateScore(allAnswers(), questionnaire);
    expect(r).toMatchObject({ total: 30, maximum: 30, percentage: 100 });
    expect(r.band.id).toBe("strong");
  });

  it("scores mixed combinations and band edges", () => {
    const five = calculateScore(
      { energie: ["energie-1", "energie-2", "energie-3"], immunite: ["immunite-1", "immunite-3"] },
      questionnaire,
    );
    expect(five.total).toBe(5);
    expect(five.band.id).toBe("normal");

    const six = calculateScore(
      { ...{ energie: ["energie-1", "energie-2", "energie-3"] }, muscles: ["muscles-1", "muscles-2", "muscles-4"] },
      questionnaire,
    );
    expect(six.total).toBe(6);
    expect(six.band.id).toBe("probable");

    const answers = allAnswers();
    const thirteen = calculateScore(
      { energie: answers.energie, "cerveau-humeur": answers["cerveau-humeur"], immunite: ["immunite-1", "immunite-2"] },
      questionnaire,
    );
    expect(thirteen.total).toBe(13);
    expect(thirteen.band.id).toBe("strong");
    expect(findBand(12, questionnaire.resultBands).id).toBe("probable");
  });

  it("ignores unknown, misplaced and duplicated IDs", () => {
    const r = calculateScore(
      { energie: ["energie-1", "energie-1", "nope", "muscles-1"], inconnu: ["x"] },
      questionnaire,
    );
    expect(r.total).toBe(1);
  });
});

describe("parseSubmissionRequest", () => {
  it("rejects malformed payloads", () => {
    expect(parseSubmissionRequest(null, questionnaire).ok).toBe(false);
    expect(parseSubmissionRequest({}, questionnaire).ok).toBe(false);
    expect(parseSubmissionRequest({ answers: [] }, questionnaire).ok).toBe(false);
    expect(parseSubmissionRequest({ answers: { energie: "energie-1" } }, questionnaire).ok).toBe(false);
    expect(parseSubmissionRequest({ answers: { energie: [1] } }, questionnaire).ok).toBe(false);
  });

  it("drops unknown IDs, fills missing sections and ignores client totals", () => {
    const r = parseSubmissionRequest(
      { answers: { energie: ["energie-2", "hack", "energie-1"], evil: ["x"] }, total: 30 },
      questionnaire,
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.answers.energie).toEqual(["energie-1", "energie-2"]);
    expect(Object.keys(r.value.answers)).toEqual(questionnaire.sections.map((s) => s.id));
    expect(r.value.answers).not.toHaveProperty("evil");
    expect(calculateScore(r.value.answers, questionnaire).total).toBe(2);
  });

  it("treats only an explicit \"test\" mode as test", () => {
    const mode = (value: unknown) => {
      const r = parseSubmissionRequest({ answers: {}, mode: value }, questionnaire);
      return r.ok ? r.value.mode : null;
    };
    expect(mode("test")).toBe("test");
    expect(mode(undefined)).toBe("live");
    expect(mode("live")).toBe("live");
    expect(mode("TEST")).toBe("live");
    expect(mode(true)).toBe("live");
  });

  it("keeps only sane timing", () => {
    const ok = parseSubmissionRequest({ answers: {}, timing: { totalMs: 1234.4 } }, questionnaire);
    expect(ok.ok && ok.value.timing).toEqual({ totalMs: 1234 });
    const bad = parseSubmissionRequest({ answers: {}, timing: { totalMs: -1 } }, questionnaire);
    expect(bad.ok && bad.value.timing).toBeUndefined();
  });
});

describe("aggregate", () => {
  const submission = (answers: Answers): Submission => ({
    id: crypto.randomUUID(),
    questionnaireId: questionnaire.id,
    mode: "live",
    createdAt: new Date().toISOString(),
    answers,
    totalSelected: -1, // stored totals are not trusted by the dashboard
    bandId: "",
    domainScores: {},
  });

  it("handles no submissions", () => {
    const a = aggregate([], questionnaire);
    expect(a.respondents).toBe(0);
    expect(a.averageScore).toBe(0);
    expect(a.scoreDistribution).toHaveLength(31);
  });

  it("computes descriptive statistics", () => {
    const a = aggregate(
      [submission({}), submission({ energie: ["energie-1", "energie-2", "energie-3"] }), submission(allAnswers())],
      questionnaire,
    );
    expect(a.respondents).toBe(3);
    expect(a.averageScore).toBe(11);
    expect(a.medianScore).toBe(3);
    expect(a.minScore).toBe(0);
    expect(a.maxScore).toBe(30);
    expect(a.bands.map((b) => b.count)).toEqual([2, 0, 1]);
    const energie = a.domains.find((d) => d.id === "energie")!;
    expect(energie.averageSelected).toBeCloseTo(2.67);
    expect(energie.atLeastOnePercentage).toBeCloseTo(66.67);
    expect(energie.atLeastHalfPercentage).toBeCloseTo(66.67);
    expect(a.choices[0].count).toBe(2);
  });

  it("computes medians", () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 2, 3])).toBe(2.5);
  });
});
