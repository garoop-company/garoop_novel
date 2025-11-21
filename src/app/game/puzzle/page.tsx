import PuzzleGame from '@/components/games/PuzzleGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'パズルゲーム | Garuchan Game',
    description: 'いろんな絵合わせパズルだよ！造船所やサッカースタジアムのパズルで遊ぼう！',
    openGraph: {
        title: 'パズルゲーム | Garuchan Game',
        description: 'いろんな絵合わせパズルだよ！造船所やサッカースタジアムのパズルで遊ぼう！',
        images: ['/images/games/puzzle/shipbuilding.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="puzzle-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "パズルゲーム",
                        "description": "いろんな絵合わせパズルだよ！造船所やサッカースタジアムのパズルで遊ぼう！",
                        "url": "https://garoop.jp/game/puzzle",
                        "image": "https://garoop.jp/images/games/puzzle/shipbuilding.png",
                        "genre": "Puzzle",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <PuzzleGame />
        </>
    );
}
