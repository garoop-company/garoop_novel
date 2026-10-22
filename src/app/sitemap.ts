import { MetadataRoute } from 'next'
import { locales, defaultLocale, isLocale } from '@/locales'
import { localizePath } from '@/lib/locale-path'
import { fetchJson, NOVELS_INDEX_PATH } from '@/lib/data-source'
import { PREFECTURES } from '@/lib/area/prefectures'
import { CITIES } from '@/lib/area/cities'
import { getAllDramas } from '@/lib/dramas'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = 'https://novel.garoop.jp'

    const entries: MetadataRoute.Sitemap = []

    // sitemap には「200 で返り、canonical が自分自身を指す URL」だけを載せる。
    // 本文が日本語しかないページは /en などでも開けるが、canonical は日本語版を向くので載せない
    // （載せると Search Console で「代替ページ（適切な canonical タグあり）」「重複しています」になる）。

    // 本文まで各言語に訳してあるページ（hreflang 付きで全言語を載せる）
    const translatedPages = ['/', '/faq']
    for (const page of translatedPages) {
        const languages: Record<string, string> = {}
        for (const l of locales) languages[l] = `${siteUrl}${localizePath(page, l)}`
        languages['x-default'] = `${siteUrl}${localizePath(page, defaultLocale)}`
        for (const lang of locales) {
            entries.push({
                url: `${siteUrl}${localizePath(page, lang)}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: page === '/' ? 1.0 : 0.7,
                alternates: { languages },
            })
        }
    }

    // 日本語だけのページ
    const jaOnlyPages = ['/novels', '/dramas', '/hatch-pets', '/about', '/contact', '/privacy', '/terms']
    for (const page of jaOnlyPages) {
        entries.push({
            url: `${siteUrl}${page}`,
            lastModified: new Date(),
            changeFrequency: page === '/novels' ? 'weekly' : 'monthly',
            priority: page === '/novels' ? 0.9 : 0.5,
        })
    }
    for (const drama of getAllDramas()) {
        entries.push({
            url: `${siteUrl}/dramas/${drama.id}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        })
    }

    // 地域別ページ（日本語のみ）
    entries.push({
        url: `${siteUrl}/area`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
    })
    for (const pref of PREFECTURES) {
        entries.push({
            url: `${siteUrl}/area/${pref.slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        })
    }
    for (const city of CITIES) {
        entries.push({
            url: `${siteUrl}/area/${city.pref}/${city.slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
        })
    }

    // Novels
    try {
        const novels = await fetchJson<{ id: string; lang?: string; createdAt?: string }[]>(NOVELS_INDEX_PATH);
        const seen = new Set<string>()

        for (const novel of novels) {
            const lang = novel.lang && isLocale(novel.lang) ? novel.lang : defaultLocale;
            const url = `${siteUrl}${localizePath(`/novels/${novel.id}`, lang)}`
            if (seen.has(url)) continue
            seen.add(url)
            const created = novel.createdAt ? new Date(novel.createdAt) : null
            entries.push({
                url,
                lastModified: created && !Number.isNaN(created.getTime()) ? created : new Date(),
                changeFrequency: 'monthly',
                priority: 0.6,
            })
        }
    } catch (e) {
        console.error('Sitemap: Failed to read novels.json', e)
    }

    return entries
}
