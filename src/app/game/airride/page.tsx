import dynamic from 'next/dynamic';

const AirRideGame = dynamic(() => import('@/components/games/AirRideGame'), { ssr: false });
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'ガルちゃんエアライド | Garuchan Game',
    description: '大空を駆け抜けろ！3D空間を滑空するレースゲーム。',
    openGraph: {
        title: 'ガルちゃんエアライド | Garuchan Game',
        description: '大空を駆け抜けろ！3D空間を滑空するレースゲーム。',
        images: ['/images/garoop_battle.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="airride-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "ガルちゃんエアライド",
                        "description": "大空を駆け抜けろ！3D空間を滑空するレースゲーム。",
                        "url": "https://garoop.jp/game/airride",
                        "image": "https://garoop.jp/images/garoop_battle.png",
                        "genre": "Racing",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <AirRideGame />
        </>
    );
}
