import { locales, Locale } from '@/locales';
import { generateLocalizedMetadata, SITE_URL } from '@/lib/seo';
import MysteryGame from '@/components/games/MysteryGame';
import Script from 'next/script';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: rawLang } = await params;
    const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;

    return generateLocalizedMetadata({
        title: '名探偵ガルちゃん | Garuchan Land',
        description: '事件を解決しよう！プリンを食べた犯人は誰だ！？',
        lang,
        path: '/game/mystery',
        image: '/images/game_mystery.png',
    });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: rawLang } = await params;
    const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
    return (
        <>
            <Script
                id="mystery-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "VideoGame",
                        "name": "名探偵ガルちゃん",
                        "description": "事件を解決しよう！動物の世界で起こる奇妙な事件を解決する謎解きアドベンチャーゲーム。",
                        "url": `${SITE_URL}/${lang}/game/mystery`,
                        "image": `${SITE_URL}/images/game_mystery.png`,
                        "genre": ["Adventure", "Mystery"],
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
            <MysteryGame />
        </>
    );
}
