import ManzaiGame from '@/components/games/ManzaiGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'ツッコミの達人 | Garuchan Game',
    description: 'なんでやねん！ボケに合わせてタイミングよくツッコミを入れよう。',
    openGraph: {
        title: 'ツッコミの達人 | Garuchan Game',
        description: 'なんでやねん！ボケに合わせてタイミングよくツッコミを入れよう。',
        images: ['/images/garoop_happy.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="manzai-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "ツッコミの達人",
                        "description": "なんでやねん！ボケに合わせてタイミングよくツッコミを入れよう。",
                        "url": "https://garoop.jp/game/manzai",
                        "image": "https://garoop.jp/images/garoop_happy.png",
                        "genre": "Rhythm",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <ManzaiGame />
        </>
    );
}
