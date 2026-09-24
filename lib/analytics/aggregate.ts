import { calculateScore, maximumScore, percentageOf, round2 } from "@/lib/form/scoring";
import type { Questionnaire, ResultBand, Submission } from "@/lib/form/types";

export type BandStat = {
  band: ResultBand;
  count: number;
  percentage: number;
};

export type DomainStat = {
  id: string;
  title: string;
  maximum: number;
  respondents: number;
  averageSelected: number;
  averagePercentage: number;
  medianSelected: number;
  atLeastOnePercentage: number;
  atLeastHalfPercentage: number;
};

export type ChoiceStat = {
  id: string;
  label: string;
  sectionTitle: string;
  count: number;
  percentage: number;
};

export type ResponseRow = {
  id: string;
  createdAt: string;
  total: number;
  domains: Record<string, number>;
};

export type Aggregate = {
  respondents: number;
  maximum: number;
  averageScore: number;
  medianScore: number;
  minScore: number;
  maxScore: number;
  averagePercentage: number;
  /** Respondent count for each possible total, index = total (0..maximum). */
  scoreDistribution: number[];
  bands: BandStat[];
  domains: DomainStat[];
  choices: ChoiceStat[];
  rows: ResponseRow[];
};

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : round2((sorted[mid - 1] + sorted[mid]) / 2);
}

function average(values: number[]): number {
  return values.length === 0 ? 0 : round2(values.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Descriptive statistics over stored submissions.
 * Scores are recomputed from stored answers so the dashboard always agrees with scoring.ts.
 */
export function aggregate(submissions: Submission[], questionnaire: Questionnaire): Aggregate {
  const maximum = maximumScore(questionnaire);
  const scored = submissions.map((s) => ({
    submission: s,
    score: calculateScore(s.answers, questionnaire),
  }));
  const n = scored.length;
  const totals = scored.map((s) => s.score.total);

  const scoreDistribution = new Array<number>(maximum + 1).fill(0);
  for (const total of totals) scoreDistribution[total]++;

  const bands = questionnaire.resultBands.map((band) => {
    const count = scored.filter((s) => s.score.band.id === band.id).length;
    return { band, count, percentage: percentageOf(count, n) };
  });

  const domains = questionnaire.sections.map((section) => {
    const selected = scored.map((s) => s.score.domains[section.id].selected);
    const max = section.choices.length;
    return {
      id: section.id,
      title: section.title,
      maximum: max,
      respondents: n,
      averageSelected: average(selected),
      averagePercentage: percentageOf(average(selected), max),
      medianSelected: median(selected),
      atLeastOnePercentage: percentageOf(selected.filter((v) => v >= 1).length, n),
      atLeastHalfPercentage: percentageOf(selected.filter((v) => v >= max / 2).length, n),
    };
  });

  const choices = questionnaire.sections
    .flatMap((section) =>
      section.choices.map((choice) => {
        const count = scored.filter((s) =>
          (s.submission.answers[section.id] ?? []).includes(choice.id),
        ).length;
        return {
          id: choice.id,
          label: choice.label,
          sectionTitle: section.title,
          count,
          percentage: percentageOf(count, n),
        };
      }),
    )
    .sort((a, b) => b.count - a.count);

  const rows = scored.map(({ submission, score }) => ({
    id: submission.id,
    createdAt: submission.createdAt,
    total: score.total,
    domains: Object.fromEntries(
      Object.entries(score.domains).map(([id, d]) => [id, d.selected]),
    ),
  }));

  return {
    respondents: n,
    maximum,
    averageScore: average(totals),
    medianScore: median(totals),
    minScore: n ? Math.min(...totals) : 0,
    maxScore: n ? Math.max(...totals) : 0,
    averagePercentage: percentageOf(average(totals), maximum),
    scoreDistribution,
    bands,
    domains,
    choices,
    rows,
  };
}
