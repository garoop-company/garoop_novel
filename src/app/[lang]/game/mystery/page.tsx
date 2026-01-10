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
                        "@type": "Game",
                        "name": "名探偵ガルちゃん",
                        "description": "事件を解決しよう！プリンを食べた犯人は誰だ！？",
                        "url": `${SITE_URL}/${lang}/game/mystery`,
                        "image": `${SITE_URL}/images/game_mystery.png`,
                        "genre": "Adventure",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <MysteryGame />
        </>
    );
}
