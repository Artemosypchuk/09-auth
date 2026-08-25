import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { parseSetCookie } from "cookie";
import { checkSession } from "./lib/api/serverApi";

const protectedRoutes = ["/profile", "/notes"];
const authRoutes = ["/sign-in", "/sign-up"];

function getCookieValueFromHeaders(
  setCookieHeaders: string[],
  cookieName: string,
): string | undefined {
  for (const header of setCookieHeaders) {
    const parsed = parseSetCookie(header);
    if (parsed && parsed.name === cookieName) {
      return parsed.value;
    }
  }
  return undefined;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const cookieStore = await cookies();
  let accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

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

          const newAccessToken = getCookieValueFromHeaders(
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
    const fullCallbackUrl = pathname + search;

    loginUrl.searchParams.set("callbackUrl", fullCallbackUrl);

    const response = NextResponse.redirect(loginUrl);
    setCookiesIfPresent(response, sessionResponseCookies);
    return response;
  }

  if (isAuthRoute && accessToken) {
    const response = NextResponse.redirect(new URL("/", request.url));
    setCookiesIfPresent(response, sessionResponseCookies);
    return response;
  }

  const response = NextResponse.next();
  setCookiesIfPresent(response, sessionResponseCookies);
  return response;
}

function setCookiesIfPresent(response: NextResponse, cookiesList: string[]) {
  if (cookiesList && cookiesList.length > 0) {
    cookiesList.forEach((cookieString) => {
      const parsed = parseSetCookie(cookieString);

      if (parsed && parsed.name && typeof parsed.value === "string") {
        let sameSite: "strict" | "lax" | "none" | undefined = undefined;

        if (typeof parsed.sameSite === "string") {
          const lower = parsed.sameSite.toLowerCase();
          if (lower === "strict" || lower === "lax" || lower === "none") {
            sameSite = lower;
          }
        }

        response.cookies.set({
          name: parsed.name,
          value: parsed.value,
          path: parsed.path || "/",
          domain: parsed.domain || undefined,
          expires: parsed.expires ? new Date(parsed.expires) : undefined,
          httpOnly: parsed.httpOnly ?? undefined,
          secure: parsed.secure ?? undefined,
          sameSite,
        });
      }
    });
  }
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
