import ShooterGame from '@/components/games/ShooterGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'シューティング | Garuchan Game',
    description: 'バンバン撃って敵を倒せ！迫りくるゾンビやモンスターを撃退しよう！',
    openGraph: {
        title: 'シューティング | Garuchan Game',
        description: 'バンバン撃って敵を倒せ！迫りくるゾンビやモンスターを撃退しよう！',
        images: ['/images/games/shooter/garoop_shooter.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="shooter-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "シューティング",
                        "description": "バンバン撃って敵を倒せ！迫りくるゾンビやモンスターを撃退しよう！",
                        "url": "https://garoop.jp/game/shooter",
                        "image": "https://garoop.jp/images/games/shooter/garoop_shooter.png",
                        "genre": "Shooter",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <ShooterGame />
        </>
    );
}
