import JungleGame from '@/components/games/JungleGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'ジャングル・ジャンプ | Garuchan Game',
    description: 'ジャングルを駆け抜けろ！頂上を目指すクライミングアクション。',
    openGraph: {
        title: 'ジャングル・ジャンプ | Garuchan Game',
        description: 'ジャングルを駆け抜けろ！頂上を目指すクライミングアクション。',
        images: ['/images/garoop_battle.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="jungle-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "ジャングル・ジャンプ",
                        "description": "ジャングルを駆け抜けろ！頂上を目指すクライミングアクション。",
                        "url": "https://garoop.jp/game/jungle",
                        "image": "https://garoop.jp/images/garoop_battle.png",
                        "genre": "Action",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <JungleGame />
        </>
    );
}
