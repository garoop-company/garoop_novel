import dynamic from 'next/dynamic';

const SkyGame = dynamic(() => import('@/components/games/SkyGame'), { ssr: false });
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'スカイ・ライダー | Garuchan Game',
    description: '大空を自由に飛び回れ！3D空間を滑空するレースゲーム。',
    openGraph: {
        title: 'スカイ・ライダー | Garuchan Game',
        description: '大空を自由に飛び回れ！3D空間を滑空するレースゲーム。',
        images: ['/images/garoop_battle.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="sky-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "スカイ・ライダー",
                        "description": "大空を自由に飛び回れ！3D空間を滑空するレースゲーム。",
                        "url": "https://garoop.jp/game/sky",
                        "image": "https://garoop.jp/images/garoop_battle.png",
                        "genre": "Racing",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <SkyGame />
        </>
    );
}
