/**
 * Reads a page's OGP (the title / image / site name that X, LINE and note show when a URL is pasted),
 * so a cited source can be shown as an image card. Returns null when the page cannot be read;
 * callers then fall back to a text-only card.
 */
export type Ogp = { title?: string; description?: string; image?: string; siteName?: string };

const ONE_WEEK = 60 * 60 * 24 * 7;

const decode = (s: string) =>
    s
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&#x27;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
        .trim();

/** content of <meta property|name="key" content="..."> (attribute order does not matter) */
function meta(html: string, key: string): string | undefined {
    for (const tag of html.match(/<meta\s[^>]*>/gi) ?? []) {
        const name = tag.match(/(?:property|name)\s*=\s*["']([^"']+)["']/i)?.[1];
        if (name?.toLowerCase() !== key) continue;
        const content = tag.match(/content\s*=\s*"([^"]*)"/i)?.[1] ?? tag.match(/content\s*=\s*'([^']*)'/i)?.[1];
        if (content) return decode(content);
    }
    return undefined;
}

// Files that are not web pages (PDF, images, Office documents) have no OGP; skip downloading them.
const NOT_HTML = /\.(pdf|jpe?g|png|gif|webp|zip|docx?|xlsx?|pptx?)$/i;

async function readOgp(url: string): Promise<Ogp | null> {
    try {
        if (NOT_HTML.test(new URL(url).pathname)) return null;
        const res = await fetch(url, {
            headers: {
                // Many sites only return OGP to link-preview crawlers.
                'User-Agent': 'Mozilla/5.0 (compatible; GaroopLinkCard/1.0; +https://garoop.jp)',
                Accept: 'text/html,application/xhtml+xml',
                'Accept-Language': 'ja,en;q=0.8',
            },
            signal: AbortSignal.timeout(10000),
            next: { revalidate: ONE_WEEK },
        });
        if (!res.ok || !(res.headers.get('content-type') ?? '').includes('html')) return null;
        // OGP lives in <head>; reading only the start keeps big pages cheap.
        const html = (await res.text()).slice(0, 300_000);
        const head = html.split(/<\/head>/i)[0];
        const rawImage = meta(head, 'og:image') ?? meta(head, 'og:image:url') ?? meta(head, 'twitter:image');
        let image: string | undefined;
        if (rawImage) {
            try {
                const abs = new URL(rawImage, res.url || url);
                if (abs.protocol === 'https:' || abs.protocol === 'http:') image = abs.toString().replace(/^http:/, 'https:');
            } catch {
                image = undefined;
            }
        }
        const title = meta(head, 'og:title') ?? meta(head, 'twitter:title') ?? head.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim();
        return {
            title: title ? decode(title) : undefined,
            description: meta(head, 'og:description') ?? meta(head, 'description'),
            image,
            siteName: meta(head, 'og:site_name'),
        };
    } catch {
        return null;
    }
}

/** OGP of url, retried once (builds read many pages at the same time and a site may answer slowly). */
export async function getOgp(url: string): Promise<Ogp | null> {
    return (await readOgp(url)) ?? (await readOgp(url));
}
