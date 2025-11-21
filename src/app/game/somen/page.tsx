import SomenGame from '@/components/games/SomenGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '流しそうめん | Garuchan Game',
    description: 'そうめんをキャッチ！流れてくるそうめんをうまくつかもう。',
    openGraph: {
        title: '流しそうめん | Garuchan Game',
        description: 'そうめんをキャッチ！流れてくるそうめんをうまくつかもう。',
        images: ['/images/garoop_thinking.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="somen-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "流しそうめん",
                        "description": "そうめんをキャッチ！流れてくるそうめんをうまくつかもう。",
                        "url": "https://garoop.jp/game/somen",
                        "image": "https://garoop.jp/images/garoop_thinking.png",
                        "genre": "Action",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <SomenGame />
        </>
    );
}
