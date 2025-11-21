import PuzzleGame from '@/components/games/PuzzleGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '長崎ご当地パズル | Garuchan Game',
    description: '長崎の造船所やスタジアムがパズルになった！子供から大人まで楽しめる無料の絵合わせゲーム。',
    openGraph: {
        title: '長崎ご当地パズル | Garuchan Game',
        description: '長崎の造船所やスタジアムがパズルになった！子供から大人まで楽しめる無料の絵合わせゲーム。',
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
