import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const auth     = request.cookies.get("app_auth");
  const { pathname } = request.nextUrl;

  /* paths that don't need auth */
  const isPublic =
    pathname === "/login" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon");

  if (!auth && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  /* already logged in → skip login page */
  if (auth && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
