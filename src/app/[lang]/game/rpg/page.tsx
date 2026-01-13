import { locales, Locale } from '@/locales';
import { generateLocalizedMetadata, SITE_URL } from '@/lib/seo';
import RpgGame from '@/components/games/RpgGame';
import Script from 'next/script';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: rawLang } = await params;
    const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;

    return generateLocalizedMetadata({
        title: '長崎の子供向けRPG | ガルちゃんの冒険',
        description: '長崎発の子供向けRPG！バズり魔王を倒す冒険に出かけよう。安心・安全に遊べる無料ブラウザゲーム。',
        lang,
        path: '/game/rpg',
        image: '/images/game_rpg.png',
    });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: rawLang } = await params;
    const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
    return (
        <>
            <Script
                id="rpg-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "VideoGame",
                        "name": "ガルちゃんの冒険",
                        "description": "バズり魔王を倒せ！SNSトレンドをテーマにしたファンタジーRPG。",
                        "url": `${SITE_URL}/${lang}/game/rpg`,
                        "image": `${SITE_URL}/images/game_rpg.png`,
                        "genre": ["RPG", "JRPG"],
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
            <RpgGame />
        </>
    );
}
