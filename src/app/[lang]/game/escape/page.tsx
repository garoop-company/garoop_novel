import EscapeGame from '@/components/games/EscapeGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '脱出ゲーム | Garuchan Game',
    description: '部屋から脱出せよ！謎を解いて鍵を見つけ出そう。',
    openGraph: {
        title: '脱出ゲーム | Garuchan Game',
        description: '部屋から脱出せよ！謎を解いて鍵を見つけ出そう。',
        images: ['/images/game_escape.png'],
    },
    twitter: {
        card: 'summary_large_image',
        images: ['/images/game_escape.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="escape-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "脱出ゲーム",
                        "description": "部屋から脱出せよ！謎を解いて鍵を見つけ出そう。",
                        "url": "https://garoop.jp/game/escape",
                        "image": "https://garoop.jp/images/game_escape.png",
                        "genre": "Puzzle",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <EscapeGame />
        </>
    );
}
