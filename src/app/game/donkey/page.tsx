import DonkeyGame from '@/components/games/DonkeyGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'ドンキーガルーク | Garuchan Game',
    description: 'タルをよけて登れ！頂上を目指すクライミングアクション。',
    openGraph: {
        title: 'ドンキーガルーク | Garuchan Game',
        description: 'タルをよけて登れ！頂上を目指すクライミングアクション。',
        images: ['/images/garoop_battle.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="donkey-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "ドンキーガルーク",
                        "description": "タルをよけて登れ！頂上を目指すクライミングアクション。",
                        "url": "https://garoop.jp/game/donkey",
                        "image": "https://garoop.jp/images/garoop_battle.png",
                        "genre": "Action",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <DonkeyGame />
        </>
    );
}
