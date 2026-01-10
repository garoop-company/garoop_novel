import CardGame from '@/components/games/CardGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'カードバトル | Garuchan Game',
    description: 'ガルちゃんカードでバトルだ！戦略を駆使して勝利を目指せ！',
    openGraph: {
        title: 'カードバトル | Garuchan Game',
        description: 'ガルちゃんカードでバトルだ！戦略を駆使して勝利を目指せ！',
        images: ['/images/game_card.png'],
    },
    twitter: {
        card: 'summary_large_image',
        images: ['/images/game_card.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="card-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "カードバトル",
                        "description": "ガルちゃんカードでバトルだ！戦略を駆使して勝利を目指せ！",
                        "url": "https://garoop.jp/game/card",
                        "image": "https://garoop.jp/images/game_card.png",
                        "genre": "Card Game",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <CardGame />
        </>
    );
}
