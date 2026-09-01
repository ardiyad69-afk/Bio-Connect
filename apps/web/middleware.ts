import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@repo/shared";

// Cheap redirect based on cookie presence only. This is not the real auth
// check — Elysia re-validates the session on every dashboard data request —
// it just avoids flashing the dashboard shell before bouncing to /login.
export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname === "/login" || pathname === "/signup") && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
