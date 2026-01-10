import { locales, Locale } from '@/locales';
import { generateLocalizedMetadata, SITE_URL } from '@/lib/seo';
import CardGame from '@/components/games/CardGame';
import Script from 'next/script';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: rawLang } = await params;
    const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;

    return generateLocalizedMetadata({
        title: 'カードバトル | Garuchan Land',
        description: 'ガルちゃんカードでバトルだ！戦略を駆使して勝利を目指せ！',
        lang,
        path: '/game/card',
        image: '/images/game_card.png',
    });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: rawLang } = await params;
    const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
    return (
        <>
            <Script
                id="card-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "カードバトル",
                        "description": "ガルちゃんカードでバトルだ！戦略を駆使して勝利を目指せ！",
                        "url": `${SITE_URL}/${lang}/game/card`,
                        "image": `${SITE_URL}/images/game_card.png`,
                        "genre": "Card Game",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <CardGame />
        </>
    );
}
