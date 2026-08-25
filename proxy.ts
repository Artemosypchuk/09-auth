import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/profile", "/notes"];

const authRoutes = ["/sign-in", "/sign-up"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("refreshToken")?.value;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/sign-in", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
