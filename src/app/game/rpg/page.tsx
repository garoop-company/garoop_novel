import RpgGame from '@/components/games/RpgGame';
import Script from 'next/script';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: '長崎の子供向けRPG | ガルちゃんの冒険',
    description: '長崎発の子供向けRPG！バズり魔王を倒す冒険に出かけよう。安心・安全に遊べる無料ブラウザゲーム。',
    openGraph: {
        title: '長崎の子供向けRPG | ガルちゃんの冒険',
        description: '長崎発の子供向けRPG！バズり魔王を倒す冒険に出かけよう。安心・安全に遊べる無料ブラウザゲーム。',
        images: ['/images/garoop_battle.png'],
    },
};

export default function Page() {
    return (
        <>
            <Script
                id="rpg-game-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Game",
                        "name": "ガルちゃんの冒険",
                        "description": "バズり魔王を倒せ！SNSトレンドをテーマにしたRPG。",
                        "url": "https://garoop.jp/game/rpg",
                        "image": "https://garoop.jp/images/garoop_battle.png",
                        "genre": "RPG",
                        "author": {
                            "@type": "Organization",
                            "name": "Garoop"
                        }
                    }),
                }}
            />
            <RpgGame />
        </>
    );
}
