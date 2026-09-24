import type { Submission } from "@/lib/form/types";

/**
 * A driver stores submissions as independent documents grouped by namespace
 * (a Blob path prefix or a local directory). Namespaces never overlap.
 */
export type SubmissionStore = {
  save(namespace: string, submission: Submission): Promise<void>;
  list(namespace: string): Promise<Submission[]>;
  get(namespace: string, id: string): Promise<Submission | null>;
};
