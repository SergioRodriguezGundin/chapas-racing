import { type NextRequest, NextResponse } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/** Rutas que requieren sesión. `/` (hot-seat) queda fuera del matcher. */
const PROTECTED_PREFIXES = ["/online", "/editor", "/profile"];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  supabaseResponse.headers.set("x-pathname", pathname);
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/online/:path*",
    "/editor/:path*",
    "/profile/:path*",
    "/login",
    "/auth/:path*",
  ],
};
