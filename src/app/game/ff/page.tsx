import FfGame from '@/components/games/FfGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'ファイナルガルーク | Garuchan Game',
    description: 'クリスタルを守れ！アクティブタイムバトルで戦うRPG。',
    openGraph: {
        title: 'ファイナルガルーク | Garuchan Game',
        description: 'クリスタルを守れ！アクティブタイムバトルで戦うRPG。',
        images: ['/images/garoop_battle.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="ff-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "ファイナルガルーク",
                        "description": "クリスタルを守れ！アクティブタイムバトルで戦うRPG。",
                        "url": "https://garoop.jp/game/ff",
                        "image": "https://garoop.jp/images/garoop_battle.png",
                        "genre": "RPG",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <FfGame />
        </>
    );
}
