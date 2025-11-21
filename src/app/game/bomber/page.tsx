import BomberGame from '@/components/games/BomberGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'ガルちゃんボンバー | Garuchan Game',
    description: 'バクダンでドッカン！壁を壊して敵を倒すアクションパズル。',
    openGraph: {
        title: 'ガルちゃんボンバー | Garuchan Game',
        description: 'バクダンでドッカン！壁を壊して敵を倒すアクションパズル。',
        images: ['/images/garoop_battle.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="bomber-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "ガルちゃんボンバー",
                        "description": "バクダンでドッカン！壁を壊して敵を倒すアクションパズル。",
                        "url": "https://garoop.jp/game/bomber",
                        "image": "https://garoop.jp/images/garoop_battle.png",
                        "genre": "Action",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <BomberGame />
        </>
    );
}
