import StartupGameContainer from '@/components/games/startup/StartupGameContainer';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'ガループスタートアップ | Garuchan Game',
    description: '生成AI企業を経営せよ！動物エンジニアたちと一緒に世界一のユニコーンを目指すシミュレーションゲーム。',
    openGraph: {
        title: 'ガループスタートアップ | Garuchan Game',
        description: '生成AI企業を経営せよ！動物エンジニアたちと一緒に世界一のユニコーンを目指すシミュレーションゲーム。',
        images: ['/images/game_startup.png'],
    },
    twitter: {
        card: 'summary_large_image',
        images: ['/images/game_startup.png'],
    },
};

export default function Page() {
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
                        "url": "https://garoop.jp/game/startup",
                        "image": "https://garoop.jp/images/game_startup.png",
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
