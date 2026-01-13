import { locales, Locale } from '@/locales';
import { generateLocalizedMetadata, SITE_URL } from '@/lib/seo';
import EscapeGame from '@/components/games/EscapeGame';
import Script from 'next/script';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: rawLang } = await params;
    const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;

    return generateLocalizedMetadata({
        title: '脱出ゲーム | Garuchan Land',
        description: '部屋から脱出せよ！謎を解いて鍵を見つけ出そう。',
        lang,
        path: '/game/escape',
        image: '/images/game_escape.png',
    });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: rawLang } = await params;
    const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
    return (
        <>
            <Script
                id="escape-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "VideoGame",
                        "name": "脱出ゲーム",
                        "description": "密室から脱出せよ！パズルを解いて鍵を見つけ出すブラウザ脱出ゲーム。",
                        "url": `${SITE_URL}/${lang}/game/escape`,
                        "image": `${SITE_URL}/images/game_escape.png`,
                        "genre": ["Puzzle", "Escape Room"],
                        "gamePlatform": "Web Browser",
                        "applicationCategory": "Game",
                        "operatingSystem": "Any",
                        "author": {
                            "@type": "Organization",
                            "name": "株式会社Garoop",
                            "url": "https://garoop.jp"
                        },
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "JPY"
                        },
                        "contentRating": "Everyone"
                    }),
                }}
            />
            <EscapeGame />
        </>
    );
}
