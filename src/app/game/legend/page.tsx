import LegendGame from '@/components/games/LegendGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '子供向けコマンドRPG | レジェンド・クエスト',
    description: '長崎発！子供でも遊べるシンプル操作の王道RPG。伝説の勇者となって冒険しよう！',
    openGraph: {
        title: '子供向けコマンドRPG | レジェンド・クエスト',
        description: '長崎発！子供でも遊べるシンプル操作の王道RPG。伝説の勇者となって冒険しよう！',
        images: ['/images/garoop_battle.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="legend-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "レジェンド・クエスト",
                        "description": "伝説の勇者となれ！コマンド選択式の王道RPG。",
                        "url": "https://garoop.jp/game/legend",
                        "image": "https://garoop.jp/images/garoop_battle.png",
                        "genre": "RPG",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <LegendGame />
        </>
    );
}
