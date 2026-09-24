import "server-only";

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Submission } from "@/lib/form/types";
import type { SubmissionStore } from "./types";

/** Development-only store: one JSON file per submission in .data/{namespace}. */
const ROOT = path.join(process.cwd(), ".data");

const dir = (namespace: string) => path.join(ROOT, namespace);

export const localStore: SubmissionStore = {
  async save(namespace, submission) {
    await mkdir(dir(namespace), { recursive: true });
    await writeFile(path.join(dir(namespace), `${submission.id}.json`), JSON.stringify(submission), {
      flag: "wx",
    });
  },

  async list(namespace) {
    let files: string[];
    try {
      files = await readdir(dir(namespace));
    } catch {
      return [];
    }
    const docs = await Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .map(async (f) => {
          try {
            return JSON.parse(await readFile(path.join(dir(namespace), f), "utf8")) as Submission;
          } catch (error) {
            console.error("[storage:local] failed to read", f, error);
            return null;
          }
        }),
    );
    return docs.filter((d): d is Submission => d !== null);
  },

  async get(namespace, id) {
    try {
      return JSON.parse(await readFile(path.join(dir(namespace), `${id}.json`), "utf8")) as Submission;
    } catch {
      return null;
    }
  },
};
