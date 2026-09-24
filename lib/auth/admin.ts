import { timingSafeEqual } from "node:crypto";

export type AdminAccess = "granted" | "denied" | "unconfigured";

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function checkAdminAccess(authorization: string | null): AdminAccess {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return process.env.NODE_ENV === "production" ? "unconfigured" : "granted";
  }
  if (!authorization?.startsWith("Basic ")) return "denied";

  let decoded: string;
  try {
    decoded = atob(authorization.slice(6));
  } catch {
    return "denied";
  }
  const separator = decoded.indexOf(":");
  if (separator === -1) return "denied";

  const user = decoded.slice(0, separator);
  const pass = decoded.slice(separator + 1);
  const expectedUser = process.env.ADMIN_USER ?? "admin";
  // Evaluate both comparisons so timing does not reveal which one failed.
  const userOk = safeEqual(user, expectedUser);
  const passOk = safeEqual(pass, password);
  return userOk && passOk ? "granted" : "denied";
}
