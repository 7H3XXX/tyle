import type { Submission } from "@/lib/form/types";

export type SubmissionStore = {
  save(submission: Submission): Promise<void>;
  list(): Promise<Submission[]>;
  get(id: string): Promise<Submission | null>;
};
