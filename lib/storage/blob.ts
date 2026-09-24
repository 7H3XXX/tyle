import "server-only";

import { get, list, put } from "@vercel/blob";
import type { Submission } from "@/lib/form/types";
import type { SubmissionStore } from "./types";

const READ_CONCURRENCY = 16;

const pathname = (namespace: string, id: string) => `${namespace}/${id}.json`;

async function readJson(path: string): Promise<unknown> {
  const result = await get(path, { access: "private" });
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

/** One private, immutable JSON object per submission: {namespace}/{id}.json */
export const blobStore: SubmissionStore = {
  async save(namespace, submission) {
    await put(pathname(namespace, submission.id), JSON.stringify(submission), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: false,
    });
  },

  async list(namespace) {
    const paths: string[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: `${namespace}/`, cursor, limit: 1000 });
      paths.push(...page.blobs.map((b) => b.pathname));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);

    const docs = await mapWithConcurrency(paths, READ_CONCURRENCY, async (path) => {
      try {
        return (await readJson(path)) as Submission | null;
      } catch (error) {
        console.error("[storage:blob] failed to read", path, error);
        return null;
      }
    });
    return docs.filter((d): d is Submission => d !== null);
  },

  async get(namespace, id) {
    return (await readJson(pathname(namespace, id))) as Submission | null;
  },
};
