import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkSession } from "./lib/api/serverApi";

const protectedRoutes = ["/profile", "/notes"];
const authRoutes = ["/sign-in", "/sign-up"];

function getCookieValueFromHeader(
  setCookieHeaders: string[],
  cookieName: string,
): string | undefined {
  for (const header of setCookieHeaders) {
    const parts = header.split(";");
    for (const part of parts) {
      const [name, value] = part.trim().split("=");
      if (name === cookieName) {
        return value;
      }
    }
  }
  return undefined;
}
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  let sessionResponseCookies: string[] = [];

  if (!accessToken && refreshToken) {
    try {
      const sessionResponse = await checkSession();
      if (sessionResponse && sessionResponse.status === 200) {
        const setCookieHeaders = sessionResponse.headers["set-cookie"];
        if (setCookieHeaders) {
          sessionResponseCookies =
            Array.isArray(setCookieHeaders) ? setCookieHeaders : (
              [setCookieHeaders]
            );
          const newAccessToken = getCookieValueFromHeader(
            sessionResponseCookies,
            "accessToken",
          );
          if (newAccessToken) {
            accessToken = newAccessToken;
          }
        }
      }
    } catch (error) {
      console.error("Failed to refresh session in proxy:", error);
    }
  }
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !accessToken) {
    const loginUrl = new URL("/sign-in", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    const response = NextResponse.redirect(loginUrl);
    appendSetCookies(response, sessionResponseCookies);
    return response;
  }

  if (isAuthRoute && accessToken) {
    const response = NextResponse.redirect(new URL("/", request.url));
    appendSetCookies(response, sessionResponseCookies);
    return response;
  }

  const response = NextResponse.next();
  appendSetCookies(response, sessionResponseCookies);
  return response;
}
function appendSetCookies(response: NextResponse, cookies: string[]) {
  cookies.forEach((cookieString) => {
    response.headers.append("Set-Cookie", cookieString);
  });
}
export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
