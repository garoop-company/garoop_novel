import { locales, Locale } from '@/locales';
import { generateLocalizedMetadata, SITE_URL } from '@/lib/seo';
import PokerGame from '@/components/games/PokerGame';
import Script from 'next/script';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: rawLang } = await params;
    const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;

    return generateLocalizedMetadata({
        title: 'ポーカー | Garuchan Land',
        description: '動物たちと対戦する1v1ポーカー！最強の役を作ってチップを奪い合おう。',
        lang,
        path: '/game/poker',
        image: '/images/game_poker.png',
    });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: rawLang } = await params;
    const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
    return (
        <>
            <Script
                id="poker-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "VideoGame",
                        "name": "ポーカー | Garuchan Poker",
                        "description": "動物たちと対戦する1v1のテキサスホールデムポーカー。AIプレイヤー相手に心理戦を楽しもう。",
                        "url": `${SITE_URL}/${lang}/game/poker`,
                        "image": `${SITE_URL}/images/game_poker.png`,
                        "genre": ["Card Game", "Simulation"],
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
            <PokerGame />
        </>
    );
}
