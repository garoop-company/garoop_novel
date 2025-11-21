import AnimeGame from '@/components/games/AnimeGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'ガルちゃんメーカー | Garuchan Game',
    description: '推しキャラを作ろう！パーツを選んで自分だけのガルちゃんを作ろう。',
    openGraph: {
        title: 'ガルちゃんメーカー | Garuchan Game',
        description: '推しキャラを作ろう！パーツを選んで自分だけのガルちゃんを作ろう。',
        images: ['/images/garoop_happy.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="anime-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "ガルちゃんメーカー",
                        "description": "推しキャラを作ろう！パーツを選んで自分だけのガルちゃんを作ろう。",
                        "url": "https://garoop.jp/game/anime",
                        "image": "https://garoop.jp/images/garoop_happy.png",
                        "genre": "Simulation",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <AnimeGame />
        </>
    );
}
