import MovieGame from '@/components/games/MovieGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'ガルちゃんスタジオ | Garuchan Game',
    description: '大ヒット映画を作ろう！ジャンルとテーマを選んで映画監督になろう。',
    openGraph: {
        title: 'ガルちゃんスタジオ | Garuchan Game',
        description: '大ヒット映画を作ろう！ジャンルとテーマを選んで映画監督になろう。',
        images: ['/images/garoop_battle.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="movie-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "ガルちゃんスタジオ",
                        "description": "大ヒット映画を作ろう！ジャンルとテーマを選んで映画監督になろう。",
                        "url": "https://garoop.jp/game/movie",
                        "image": "https://garoop.jp/images/garoop_battle.png",
                        "genre": "Simulation",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <MovieGame />
        </>
    );
}
