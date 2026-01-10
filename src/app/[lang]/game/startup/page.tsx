import { locales, Locale } from '@/locales';
import { generateLocalizedMetadata, SITE_URL } from '@/lib/seo';
import StartupGameContainer from '@/components/games/startup/StartupGameContainer';
import Script from 'next/script';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: rawLang } = await params;
    const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;

    return generateLocalizedMetadata({
        title: 'ガループスタートアップ | Garuchan Land',
        description: '生成AI企業を経営せよ！動物エンジニアたちと一緒に世界一のユニコーンを目指すシミュレーションゲーム。',
        lang,
        path: '/game/startup',
        image: '/images/game_startup.png',
    });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
    const { lang: rawLang } = await params;
    const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
    return (
        <>
            <Script
                id="startup-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "ガループスタートアップ",
                        "description": "生成AI企業を経営せよ！動物エンジニアたちと一緒に世界一のユニコーンを目指すシミュレーションゲーム。",
                        "url": `${SITE_URL}/${lang}/game/startup`,
                        "image": `${SITE_URL}/images/game_startup.png`,
                        "genre": "Simulation",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <StartupGameContainer />
        </>
    );
}
