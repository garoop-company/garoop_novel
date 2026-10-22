import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, isLocale } from './locales';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const segments = pathname.split('/').filter(Boolean);
    const currentPrefix = segments[0];

    if (currentPrefix && isLocale(currentPrefix)) {
        if (currentPrefix === defaultLocale) {
            const redirectUrl = request.nextUrl.clone();
            const rest = segments.slice(1).join('/');
            redirectUrl.pathname = rest ? `/${rest}` : '/';
            // 既定言語の接頭辞（/ja/...）は恒久的に外す。307（一時）だと検索エンジンが
            // /ja/... を別 URL として持ち続けるので 308（恒久）にする。
            return NextResponse.redirect(redirectUrl, 308);
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
        // アイコンをここに列挙し忘れると、/apple-icon.png が
        // /<locale>/apple-icon.png に書き換えられて 404 になる。
        // Next.js がファイル規約で配るものは、すべて除外しておくこと。
        '/((?!_next|images|api|.*\\..*).*)',
        // Optional: only run on root (/)
        '/'
    ],
};
