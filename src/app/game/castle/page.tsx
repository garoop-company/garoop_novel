import CastleGame from '@/components/games/CastleGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'お城探検 | Garuchan Game',
    description: '3Dで王様を探せ！お城の中を冒険して王様を見つけよう。',
    openGraph: {
        title: 'お城探検 | Garuchan Game',
        description: '3Dで王様を探せ！お城の中を冒険して王様を見つけよう。',
        images: ['/images/garoop_battle.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="castle-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "お城探検",
                        "description": "3Dで王様を探せ！お城の中を冒険して王様を見つけよう。",
                        "url": "https://garoop.jp/game/castle",
                        "image": "https://garoop.jp/images/garoop_battle.png",
                        "genre": "Adventure",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <CastleGame />
        </>
    );
}
