import "server-only";

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Submission } from "@/lib/form/types";
import type { SubmissionStore } from "./types";

/** Development-only store: one JSON file per submission in .data/submissions. */
const DIR = path.join(process.cwd(), ".data", "submissions");

export const localStore: SubmissionStore = {
  async save(submission) {
    await mkdir(DIR, { recursive: true });
    await writeFile(path.join(DIR, `${submission.id}.json`), JSON.stringify(submission), {
      flag: "wx",
    });
  },

  async list() {
    let files: string[];
    try {
      files = await readdir(DIR);
    } catch {
      return [];
    }
    const docs = await Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .map(async (f) => {
          try {
            return JSON.parse(await readFile(path.join(DIR, f), "utf8")) as Submission;
          } catch (error) {
            console.error("[storage:local] failed to read", f, error);
            return null;
          }
        }),
    );
    return docs.filter((d): d is Submission => d !== null);
  },

  async get(id) {
    try {
      return JSON.parse(await readFile(path.join(DIR, `${id}.json`), "utf8")) as Submission;
    } catch {
      return null;
    }
  },
};
