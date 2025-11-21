import PokerGame from '@/components/games/PokerGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'ポーカー | Garuchan Game',
    description: 'みんなでポーカーしよう！5人で対戦するテキサスホールデムポーカー。',
    openGraph: {
        title: 'ポーカー | Garuchan Game',
        description: 'みんなでポーカーしよう！5人で対戦するテキサスホールデムポーカー。',
        images: ['/images/garoop_thinking.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="poker-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "ポーカー",
                        "description": "みんなでポーカーしよう！5人で対戦するテキサスホールデムポーカー。",
                        "url": "https://garoop.jp/game/poker",
                        "image": "https://garoop.jp/images/garoop_thinking.png",
                        "genre": "Card Game",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <PokerGame />
        </>
    );
}
