import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PROTECTED_PATHS = ["/chat"]
const AUTH_PATHS = ["/auth/login", "/auth/signup"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if any cookie exists (e.g. token, jwt, session, auth, etc.)
  const allCookies = request.cookies.getAll()
  const hasAuthCookie = allCookies.some(
    (c) =>
      c.name.toLowerCase().includes("token") ||
      c.name.toLowerCase().includes("jwt") ||
      c.name.toLowerCase().includes("session") ||
      c.name.toLowerCase().includes("auth") ||
      c.value.length > 0,
  )

  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path),
  )
  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path))

  // If user has cookie and tries to access login or signup -> redirect to /chat
  if (hasAuthCookie && isAuthPath) {
    return NextResponse.redirect(new URL("/chat", request.url))
  }

  // If user has no cookies and tries to access /chat -> redirect to /auth/login
  if (!hasAuthCookie && isProtectedPath) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/chat/:path*", "/auth/login", "/auth/signup"],
}
