import { MetadataRoute } from 'next'
import { locales } from '@/locales'
import { promises as fs } from 'fs'
import path from 'path'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = 'https://www.ai-garoop-novel.com'

    // Base pages
    const basePages = ['', '/game', '/novels', '/about', '/contact', '/privacy', '/terms']

    const entries: MetadataRoute.Sitemap = []

    // Add pages for each locale
    for (const lang of locales) {
        for (const page of basePages) {
            entries.push({
                url: `${siteUrl}/${lang}${page}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: page === '' ? 1.0 : 0.8,
            })
        }
    }

    // Games
    const games = ['startup', 'poker', 'mystery', 'escape', 'rpg', 'card']
    for (const lang of locales) {
        for (const gameId of games) {
            entries.push({
                url: `${siteUrl}/${lang}/game/${gameId}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.7,
            })
        }
    }

    // Novels
    try {
        const jsonDirectory = path.join(process.cwd(), 'src', 'data');
        const fileContents = await fs.readFile(path.join(jsonDirectory, 'novels.json'), 'utf8');
        const novels = JSON.parse(fileContents);

        for (const novel of novels) {
            // novel.lang corresponds to the locale segment
            entries.push({
                url: `${siteUrl}/${novel.lang}/novels/${novel.id}`,
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
