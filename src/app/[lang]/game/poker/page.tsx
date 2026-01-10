import PokerGame from '@/components/games/PokerGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'ポーカー | Garuchan Game',
    description: '動物たちと対戦する1v1ポーカー！最強の役を作ってチップを奪い合おう。',
    openGraph: {
        title: 'ポーカー | Garuchan Game',
        description: 'みんなでポーカーしよう！動物たちと対戦するテキサスホールデムポーカー。',
        images: ['/images/game_poker.png'],
    },
    twitter: {
        card: 'summary_large_image',
        images: ['/images/game_poker.png'],
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
                        "description": "みんなでポーカーしよう！動物たちと対戦するテキサスホールデムポーカー。",
                        "url": "https://garoop.jp/game/poker",
                        "image": "https://garoop.jp/images/game_poker.png",
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
