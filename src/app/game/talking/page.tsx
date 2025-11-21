import TalkingGame from '@/components/games/TalkingGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'おしゃべりガルちゃん | Garuchan Game',
    description: 'さわるとしゃべるよ！ガルちゃんと楽しくお話ししよう。',
    openGraph: {
        title: 'おしゃべりガルちゃん | Garuchan Game',
        description: 'さわるとしゃべるよ！ガルちゃんと楽しくお話ししよう。',
        images: ['/images/garoop_happy.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="talking-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "おしゃべりガルちゃん",
                        "description": "さわるとしゃべるよ！ガルちゃんと楽しくお話ししよう。",
                        "url": "https://garoop.jp/game/talking",
                        "image": "https://garoop.jp/images/garoop_happy.png",
                        "genre": "Simulation",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <TalkingGame />
        </>
    );
}
