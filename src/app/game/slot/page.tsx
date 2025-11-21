import SlotGame from '@/components/games/SlotGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'サイバースロット | Garuchan Game',
    description: '未来の神話で大当たり！サイバーなスロットで運試し。',
    openGraph: {
        title: 'サイバースロット | Garuchan Game',
        description: '未来の神話で大当たり！サイバーなスロットで運試し。',
        images: ['/images/garoop_thinking.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="slot-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "サイバースロット",
                        "description": "未来の神話で大当たり！サイバーなスロットで運試し。",
                        "url": "https://garoop.jp/game/slot",
                        "image": "https://garoop.jp/images/garoop_thinking.png",
                        "genre": "Casino",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <SlotGame />
        </>
    );
}
