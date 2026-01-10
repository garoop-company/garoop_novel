import { NextRequest, NextResponse } from 'next/server';

const locales = ['ja', 'en', 'zh'];
const defaultLocale = 'ja';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if there is any supported locale in the pathname
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) return;

    // Redirect if there is no locale
    const locale = defaultLocale; // Could be improved with accept-language detection
    request.nextUrl.pathname = `/${locale}${pathname}`;

    // e.g. incoming is /products
    // The new URL is now /en/products
    return NextResponse.redirect(request.nextUrl);
}

export const config = {
    matcher: [
        // Skip all internal paths (_next)
        '/((?!_next|images|api|favicon.ico|icon.svg|icon.png).*)',
        // Optional: only run on root (/)
        '/'
    ],
};
