import type {
  Answers,
  DomainScore,
  Questionnaire,
  ResultBand,
  ScoreResult,
} from "./types";

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function percentageOf(part: number, whole: number): number {
  return whole === 0 ? 0 : round2((part / whole) * 100);
}

export function maximumScore(questionnaire: Questionnaire): number {
  return questionnaire.sections.reduce((sum, s) => sum + s.choices.length, 0);
}

export function findBand(total: number, bands: ResultBand[]): ResultBand {
  const band = bands.find(
    (b) => total >= b.min && (b.max === undefined || total <= b.max),
  );
  if (!band) {
    throw new Error(`No result band configured for a total of ${total}`);
  }
  return band;
}

/**
 * Pure scoring: one point per selected choice that exists in the questionnaire.
 * Unknown or duplicated IDs never count.
 */
export function calculateScore(
  answers: Answers,
  questionnaire: Questionnaire,
): ScoreResult {
  const domains: Record<string, DomainScore> = {};
  let total = 0;

  for (const section of questionnaire.sections) {
    const picked = new Set(answers[section.id] ?? []);
    const selected = section.choices.filter((c) => picked.has(c.id)).length;
    const maximum = section.choices.length;
    domains[section.id] = {
      selected,
      maximum,
      percentage: percentageOf(selected, maximum),
    };
    total += selected;
  }

  const maximum = maximumScore(questionnaire);
  return {
    total,
    maximum,
    percentage: percentageOf(total, maximum),
    band: findBand(total, questionnaire.resultBands),
    domains,
  };
}
