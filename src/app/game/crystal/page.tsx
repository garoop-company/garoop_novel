import CrystalGame from '@/components/games/CrystalGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '子供向けバトルRPG | クリスタル・ファンタジー',
    description: '長崎発！ハラハラドキドキのバトルRPG。クリスタルの輝きを取り戻す冒険に出かけよう！',
    openGraph: {
        title: '子供向けバトルRPG | クリスタル・ファンタジー',
        description: '長崎発！ハラハラドキドキのバトルRPG。クリスタルの輝きを取り戻す冒険に出かけよう！',
        images: ['/images/garoop_battle.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="crystal-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "クリスタル・ファンタジー",
                        "description": "クリスタルを守れ！アクティブタイムバトルで戦うRPG。",
                        "url": "https://garoop.jp/game/crystal",
                        "image": "https://garoop.jp/images/garoop_battle.png",
                        "genre": "RPG",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <CrystalGame />
        </>
    );
}
