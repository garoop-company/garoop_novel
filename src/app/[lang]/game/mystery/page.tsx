import MysteryGame from '@/components/games/MysteryGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '名探偵ガルちゃん | Garuchan Game',
    description: '事件を解決しよう！プリンを食べた犯人は誰だ！？',
    openGraph: {
        title: '名探偵ガルちゃん | Garuchan Game',
        description: '事件を解決しよう！プリンを食べた犯人は誰だ！？',
        images: ['/images/game_mystery.png'],
    },
    twitter: {
        card: 'summary_large_image',
        images: ['/images/game_mystery.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="mystery-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "名探偵ガルちゃん",
                        "description": "事件を解決しよう！プリンを食べた犯人は誰だ！？",
                        "url": "https://garoop.jp/game/mystery",
                        "image": "https://garoop.jp/images/game_mystery.png",
                        "genre": "Adventure",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <MysteryGame />
        </>
    );
}
