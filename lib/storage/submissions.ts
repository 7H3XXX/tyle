import "server-only";

import type { Submission, SubmissionMode } from "@/lib/form/types";
import { blobStore } from "./blob";
import { localStore } from "./local";
import type { SubmissionStore } from "./types";

const ID_PATTERN = /^[0-9a-f-]{36}$/;

/** Live and test data live under disjoint prefixes, so a listing can never mix them. */
const NAMESPACES: Record<SubmissionMode, string> = {
  live: "submissions",
  test: "test-submissions",
};

/**
 * Vercel Blob when configured; a local file store in development.
 * Production without Blob credentials fails loudly rather than losing data.
 */
function store(): SubmissionStore {
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) return blobStore;
  if (process.env.NODE_ENV !== "production" || process.env.STORAGE_DRIVER === "local") {
    return localStore;
  }
  throw new Error("Submission storage is not configured (missing BLOB_READ_WRITE_TOKEN)");
}

export function saveSubmission(submission: Submission): Promise<void> {
  return store().save(NAMESPACES[submission.mode], submission);
}

/** Newest first. */
export async function listSubmissions(mode: SubmissionMode): Promise<Submission[]> {
  const submissions = await store().list(NAMESPACES[mode]);
  return submissions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getSubmission(id: string, mode: SubmissionMode): Promise<Submission | null> {
  if (!ID_PATTERN.test(id)) return null;
  return store().get(NAMESPACES[mode], id);
}
