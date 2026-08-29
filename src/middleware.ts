import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { LOCALE_COOKIE_NAME, LOCALE_REQUEST_HEADER, normalizeLocale } from '@/lib/i18n';

export default function middleware(request: NextRequest) {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  const locale = normalizeLocale(cookieLocale, '');

  const requestHeaders = new Headers(request.headers);
  if (locale) {
    requestHeaders.set(LOCALE_REQUEST_HEADER, locale);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
