import { MetadataRoute } from 'next'
import { locales, defaultLocale, isLocale } from '@/locales'
import { promises as fs } from 'fs'
import path from 'path'
import { localizePath } from '@/lib/locale-path'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = 'https://www.ai-garoop-novel.com'

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
        const jsonDirectory = path.join(process.cwd(), 'src', 'data');
        const fileContents = await fs.readFile(path.join(jsonDirectory, 'novels.json'), 'utf8');
        const novels = JSON.parse(fileContents);

        for (const novel of novels) {
            const lang = isLocale(novel.lang) ? novel.lang : defaultLocale;
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
