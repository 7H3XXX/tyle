export type Choice = {
  id: string;
  label: string;
};

export type Section = {
  id: string;
  title: string;
  choices: Choice[];
};

export type ResultBand = {
  id: string;
  min: number;
  /** Inclusive upper bound. Omit for an open-ended band. */
  max?: number;
  title: string;
  description: string;
};

export type FormBranding = {
  logoUrl?: string;
  /** Text shown in the placeholder mark when no logo asset is provided. */
  logoText?: string;
  coverImageUrl?: string;
  accentColor?: string;
};

export type Questionnaire = {
  id: string;
  title: string;
  description?: string;
  disclaimer?: string;
  branding: FormBranding;
  sections: Section[];
  resultBands: ResultBand[];
};

/** Selected choice IDs, keyed by section ID. */
export type Answers = Record<string, string[]>;

export type DomainScore = {
  selected: number;
  maximum: number;
  percentage: number;
};

export type ScoreResult = {
  total: number;
  maximum: number;
  percentage: number;
  band: ResultBand;
  domains: Record<string, DomainScore>;
};

/**
 * `live` responses feed the real statistics. `test` responses come from the admin preview,
 * are stored separately and never mix into live analytics.
 */
export type SubmissionMode = "live" | "test";

/** Optional, anonymous timing data. Structured so section-level events can be added later. */
export type SubmissionTiming = {
  totalMs?: number;
};

export type Submission = {
  id: string;
  questionnaireId: string;
  mode: SubmissionMode;
  createdAt: string;
  answers: Answers;
  totalSelected: number;
  bandId: string;
  domainScores: Record<string, DomainScore>;
  timing?: SubmissionTiming;
};

/** Shape returned by POST /api/responses. */
export type SubmissionResult = {
  submissionId: string;
  total: number;
  maximum: number;
  band: string;
  domains: Record<string, DomainScore>;
};
