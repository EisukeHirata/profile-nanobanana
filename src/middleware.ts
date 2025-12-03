import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALE_COOKIE_NAME = "NEXT_LOCALE";
const SUPPORTED_LOCALES = ["en", "ja"];
const DEFAULT_LOCALE = "en";

export function middleware(request: NextRequest) {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;

  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    return NextResponse.next();
  }

  const acceptLanguage = request.headers.get("accept-language");
  let detectedLocale = DEFAULT_LOCALE;

  if (acceptLanguage) {
    // Simple check for 'ja' in the accept-language header
    // A more robust solution would parse the q-values, but this suffices for en/ja
    if (acceptLanguage.toLowerCase().includes("ja")) {
      detectedLocale = "ja";
    }
  }

  const response = NextResponse.next();
  response.cookies.set(LOCALE_COOKIE_NAME, detectedLocale);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
