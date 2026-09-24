import "server-only";

import { get, list, put } from "@vercel/blob";
import type { Submission } from "@/lib/form/types";
import type { SubmissionStore } from "./types";

const PREFIX = "submissions/";
const READ_CONCURRENCY = 16;

async function readJson(pathname: string): Promise<unknown> {
  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200) return null;
  return new Response(result.stream).json();
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/** One private, immutable JSON object per submission: submissions/{id}.json */
export const blobStore: SubmissionStore = {
  async save(submission) {
    await put(`${PREFIX}${submission.id}.json`, JSON.stringify(submission), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: false,
    });
  },

  async list() {
    const pathnames: string[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: PREFIX, cursor, limit: 1000 });
      pathnames.push(...page.blobs.map((b) => b.pathname));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);

    const docs = await mapWithConcurrency(pathnames, READ_CONCURRENCY, async (p) => {
      try {
        return (await readJson(p)) as Submission | null;
      } catch (error) {
        console.error("[storage:blob] failed to read", p, error);
        return null;
      }
    });
    return docs.filter((d): d is Submission => d !== null);
  },

  async get(id) {
    return (await readJson(`${PREFIX}${id}.json`)) as Submission | null;
  },
};
