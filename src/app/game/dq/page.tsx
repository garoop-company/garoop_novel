import DqGame from '@/components/games/DqGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'ドラゴンガルーク | Garuchan Game',
    description: '勇者よ目覚めよ！コマンド選択式の王道RPG。',
    openGraph: {
        title: 'ドラゴンガルーク | Garuchan Game',
        description: '勇者よ目覚めよ！コマンド選択式の王道RPG。',
        images: ['/images/garoop_battle.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="dq-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "ドラゴンガルーク",
                        "description": "勇者よ目覚めよ！コマンド選択式の王道RPG。",
                        "url": "https://garoop.jp/game/dq",
                        "image": "https://garoop.jp/images/garoop_battle.png",
                        "genre": "RPG",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <DqGame />
        </>
    );
}
