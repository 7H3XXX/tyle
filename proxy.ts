import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { checkAdminAccess } from "@/lib/auth/admin";

export function proxy(request: NextRequest) {
  const access = checkAdminAccess(request.headers.get("authorization"));
  if (access === "granted") return NextResponse.next();

  if (access === "unconfigured") {
    return new NextResponse("Tableau de bord non configuré (ADMIN_PASSWORD manquant).", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return new NextResponse("Authentification requise.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Tableau de bord", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
