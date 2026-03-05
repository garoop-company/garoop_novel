import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, isLocale } from './locales';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const segments = pathname.split('/').filter(Boolean);
    const currentPrefix = segments[0];

    if (currentPrefix && isLocale(currentPrefix)) {
        if (currentPrefix === defaultLocale) {
            const redirectUrl = request.nextUrl.clone();
            const rest = segments.slice(1).join('/');
            redirectUrl.pathname = rest ? `/${rest}` : '/';
            return NextResponse.redirect(redirectUrl);
        }
        return NextResponse.next();
    }

    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = pathname === '/' ? `/${defaultLocale}` : `/${defaultLocale}${pathname}`;
    return NextResponse.rewrite(rewriteUrl);
}

export const config = {
    matcher: [
        // Skip all internal paths (_next)
        '/((?!_next|images|api|favicon.ico|icon.svg|icon.png|sitemap.xml|robots.txt).*)',
        // Optional: only run on root (/)
        '/'
    ],
};
