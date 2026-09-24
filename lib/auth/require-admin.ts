import "server-only";

import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { checkAdminAccess } from "./admin";

/**
 * Defense in depth for admin pages: proxy.ts already gates /admin, but each page
 * re-checks so a matcher change can never expose admin data.
 */
export async function requireAdmin(): Promise<void> {
  const access = checkAdminAccess((await headers()).get("authorization"));
  if (access !== "granted") notFound();
}
