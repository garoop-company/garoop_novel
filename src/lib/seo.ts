import { Metadata } from 'next';
import { locales, Locale, defaultLocale, localeMeta } from '@/locales';
import { localizePath } from './locale-path';

export const SITE_URL = 'https://www.ai-garoop-novel.com';

interface SEOOptions {
    title: string;
    description: string;
    lang: Locale;
    path: string;
    image?: string;
    type?: 'website' | 'article';
    novelId?: string;
    page?: number;
}

export function generateLocalizedMetadata({
    title,
    description,
    lang,
    path,
    image = '/images/garo_kawaii.webp',
    type = 'website',
    novelId,
    page,
}: SEOOptions): Metadata {
    const query = page && page > 1 ? `?page=${page}` : '';
    const absoluteUrl = `${SITE_URL}${localizePath(path, lang)}${query}`;

    const languages: Record<string, string> = {};
    locales.forEach((l) => {
        languages[l] = `${SITE_URL}${localizePath(path, l)}${query}`;
    });
    languages['x-default'] = `${SITE_URL}${localizePath(path, defaultLocale)}${query}`;

    return {
        title,
        description,
        metadataBase: new URL(SITE_URL),
        alternates: {
            canonical: absoluteUrl,
            languages,
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
            locale: localeMeta[lang].ogLocale,
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
