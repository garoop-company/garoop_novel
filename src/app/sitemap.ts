import { MetadataRoute } from 'next'
import { locales, defaultLocale, isLocale } from '@/locales'
import { localizePath } from '@/lib/locale-path'
import { fetchJson, NOVELS_INDEX_PATH } from '@/lib/data-source'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = 'https://novel.garoop.jp'

    // Base pages
    const basePages = ['', '/novels', '/about', '/contact', '/privacy', '/terms']

    const entries: MetadataRoute.Sitemap = []

    // Add pages for each locale
    for (const lang of locales) {
        for (const page of basePages) {
            entries.push({
                url: `${siteUrl}${localizePath(page || '/', lang)}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: page === '' ? 1.0 : 0.8,
            })
        }
    }

    // Novels
    try {
        const novels = await fetchJson<{ id: string; lang?: string }[]>(NOVELS_INDEX_PATH);

        for (const novel of novels) {
            const lang = novel.lang && isLocale(novel.lang) ? novel.lang : defaultLocale;
            entries.push({
                url: `${siteUrl}${localizePath(`/novels/${novel.id}`, lang)}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.6,
            })
        }
    } catch (e) {
        console.error('Sitemap: Failed to read novels.json', e)
    }

    return entries
}
