import PlatformerGame from '@/components/games/PlatformerGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'スーパーガルちゃん | Garuchan Game',
    description: 'ゴールを目指してジャンプ！敵を踏んづけて進む横スクロールアクション。',
    openGraph: {
        title: 'スーパーガルちゃん | Garuchan Game',
        description: 'ゴールを目指してジャンプ！敵を踏んづけて進む横スクロールアクション。',
        images: ['/images/garoop_battle.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="platformer-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "スーパーガルちゃん",
                        "description": "ゴールを目指してジャンプ！敵を踏んづけて進む横スクロールアクション。",
                        "url": "https://garoop.jp/game/platformer",
                        "image": "https://garoop.jp/images/garoop_battle.png",
                        "genre": "Action",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <PlatformerGame />
        </>
    );
}
