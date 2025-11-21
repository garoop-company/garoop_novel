import DqGame from '@/components/games/DqGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '子供向けコマンドRPG | ドラゴンガルーク',
    description: '長崎発！子供でも遊べるシンプル操作の王道RPG。勇者になって冒険しよう！',
    openGraph: {
        title: '子供向けコマンドRPG | ドラゴンガルーク',
        description: '長崎発！子供でも遊べるシンプル操作の王道RPG。勇者になって冒険しよう！',
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
