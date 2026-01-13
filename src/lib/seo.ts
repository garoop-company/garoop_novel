import { Metadata } from 'next';
import { locales, Locale } from '@/locales';

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
    const absoluteUrl = `${SITE_URL}/${lang}${path === '/' ? '' : path}${page && page > 1 ? `?page=${page}` : ''}`;

    const languages: Record<string, string> = {};
    locales.forEach((l) => {
        languages[l] = `${SITE_URL}/${l}${path === '/' ? '' : path}${page && page > 1 ? `?page=${page}` : ''}`;
    });
    languages['x-default'] = `${SITE_URL}/ja${path === '/' ? '' : path}${page && page > 1 ? `?page=${page}` : ''}`;

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
            locale: lang === 'ja' ? 'ja_JP' : lang === 'zh' ? 'zh_CN' : 'en_US',
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
