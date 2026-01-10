import GameHub from '@/components/GameHub';
import Script from 'next/script';
import type { Metadata } from 'next';

// ✅ メタデータ（SEO対策）
export const metadata: Metadata = {
  metadataBase: new URL('https://garoop.jp'),
  title: 'ガルちゃんゲーム | 子供向け無料ゲームサイト',
  description:
    '長崎から発信する子供向け無料ゲームサイト「Garuchan Game」。RPG、パズル、アクションなど、安心・安全に遊べる20種類のミニゲームが勢揃い！',
  keywords:
    '長崎, ゲーム, 子供, RPG, 無料ゲーム, ミニゲーム, ガルちゃん, Garoop, 教育, 地方創生',
  openGraph: {
    title: '長崎発！子供向け無料ゲームサイト | Garuchan Game',
    description:
      '長崎から発信する子供向け無料ゲームサイト。RPGやパズルなど、親子で楽しめるゲームが遊び放題！',
    url: 'https://garoop.jp/game',
    siteName: 'Garuchan Game',
    images: [
      {
        url: '/images/game_startup.png',
        width: 1200,
        height: 630,
        alt: 'Garuchan Game - 長崎の子供向けゲーム',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '長崎発！子供向け無料ゲームサイト | Garuchan Game',
    description:
      '長崎から発信する子供向け無料ゲームサイト。RPGやパズルなど、親子で楽しめるゲームがいっぱい！',
    images: ['/images/game_startup.png'], // Using startup as main OG for now or maybe another one
  },
};

export default function Page() {
  return (
    <>
      {/* ✅ 構造化データ（JSON-LD） */}
      <Script
        id="game-hub-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Garuchan Game（ガルちゃんゲーム）",
            "description": "無料ミニゲームが遊べるゲームハブ",
            "url": "https://garoop.jp/game",
            "image": "https://garoop.jp/images/game_startup.png",
            "publisher": {
              "@type": "Organization",
              "name": "Garoop",
              "logo": {
                "@type": "ImageObject",
                "url": "https://d3ez7mat4qd439.cloudfront.net/garoo_kawaii.webp"
              }
            },
            "hasPart": [
              { "@type": "Game", "name": "ポーカー", "url": "https://garoop.jp/game/poker", "image": "https://garoop.jp/images/game_poker.png" },
              { "@type": "Game", "name": "カードバトル", "url": "https://garoop.jp/game/card", "image": "https://garoop.jp/images/game_card.png" },
              { "@type": "Game", "name": "ガループスタートアップ", "url": "https://garoop.jp/game/startup", "image": "https://garoop.jp/images/game_startup.png" },
              { "@type": "Game", "name": "名探偵ガルちゃん", "url": "https://garoop.jp/game/mystery", "image": "https://garoop.jp/images/game_mystery.png" },
              { "@type": "Game", "name": "脱出ゲーム", "url": "https://garoop.jp/game/escape", "image": "https://garoop.jp/images/game_escape.png" },
              { "@type": "Game", "name": "ガルちゃんの冒険", "url": "https://garoop.jp/game/rpg", "image": "https://garoop.jp/images/game_rpg.png" },
            ]
          }),
        }}
      />
      <GameHub />
    </>
  );
}
