import { Metadata } from 'next';
import { locales, Locale, defaultLocale, localeMeta } from '@/locales';
import { localizePath } from './locale-path';

export const SITE_URL = 'https://novel.garoop.jp';

interface SEOOptions {
    title: string;
    description: string;
    lang: Locale;
    path: string;
    image?: string;
    type?: 'website' | 'article';
    novelId?: string;
    page?: number;
    /**
     * このページの中身が実際に用意されている言語。省略時は全言語（翻訳済み）。
     * 日本語の本文しかないページを /en などでも配っているので、
     * そのままだと各言語の URL が「同じ中身の重複ページ」になり、Search Console で
     * 「重複しています。ユーザーにより正規ページとして選択されていません」になる。
     * ここに含まれない言語で開かれたときは、canonical を中身のある言語の URL に向け、
     * hreflang も中身のある言語だけに絞る。
     */
    availableLocales?: readonly Locale[];
}

/** 日本語の本文しかないページ用 */
export const JA_ONLY: readonly Locale[] = [defaultLocale];

export function generateLocalizedMetadata({
    title,
    description,
    lang,
    path,
    image = 'https://data.garoop.jp/garoop-asset/resized/1200x630/garoop-novel-1200x630.png',
    type = 'website',
    novelId,
    page,
    availableLocales = locales,
}: SEOOptions): Metadata {
    const query = page && page > 1 ? `?page=${page}` : '';
    const available = availableLocales.length > 0 ? availableLocales : locales;
    const canonicalLang: Locale = available.includes(lang)
        ? lang
        : available.includes(defaultLocale)
            ? defaultLocale
            : available[0];
    const absoluteUrl = `${SITE_URL}${localizePath(path, canonicalLang)}${query}`;

    // hreflang は中身のある言語が 2 つ以上あるときだけ出す（1 言語だけなら canonical で足りる）
    let languages: Record<string, string> | undefined;
    if (available.length > 1) {
        languages = {};
        for (const l of available) {
            languages[l] = `${SITE_URL}${localizePath(path, l)}${query}`;
        }
        const xDefaultLang = available.includes(defaultLocale) ? defaultLocale : available[0];
        languages['x-default'] = `${SITE_URL}${localizePath(path, xDefaultLang)}${query}`;
    }

    return {
        title,
        description,
        metadataBase: new URL(SITE_URL),
        alternates: {
            canonical: absoluteUrl,
            ...(languages ? { languages } : {}),
        },
        openGraph: {
            title,
            description,
            url: absoluteUrl,
            siteName: 'Garoop Novel',
            images: [
                {
                    url: image.startsWith('http') ? image : `${SITE_URL}${image}`,
                    alt: title,
                },
            ],
            locale: localeMeta[canonicalLang].ogLocale,
            type,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image.startsWith('http') ? image : `${SITE_URL}${image}`],
        },
    };
}
