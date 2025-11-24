import GameHub from '@/components/GameHub';
import Script from 'next/script';
import type { Metadata } from 'next';

// ✅ メタデータ（SEO対策）
export const metadata: Metadata = {
  title: 'ガルちゃんゲーム | 子供向け無料ゲームサイト',
  description:
    '長崎から発信する子供向け無料ゲームサイト「Garuchan Game」。RPG、パズル、アクションなど、安心・安全に遊べる20種類のミニゲームが勢揃い！',
  keywords:
    '長崎, ゲーム, 子供, RPG, 無料ゲーム, ミニゲーム, ガルちゃん, Garoop, 教育, 地方創生',
  openGraph: {
    title: '長崎発！子供向け無料ゲームサイト | Garuchan Game',
    description:
      '長崎から発信する子供向け無料ゲームサイト。RPGやパズルなど、親子で楽しめる20種類のゲームが遊び放題！',
    url: 'https://garoop.jp/game',
    siteName: 'Garuchan Game',
    images: [
      {
        url: 'https://d3ez7mat4qd439.cloudfront.net/garoo_kawaii.webp',
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
    images: ['https://d3ez7mat4qd439.cloudfront.net/garoo_kawaii.webp'],
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
            "description": "20種類の無料ミニゲームが遊べるゲームハブ",
            "url": "https://garoop.jp/game",
            "image": "https://d3ez7mat4qd439.cloudfront.net/garoo_kawaii.webp",
            "publisher": {
              "@type": "Organization",
              "name": "Garoop",
              "logo": {
                "@type": "ImageObject",
                "url": "https://d3ez7mat4qd439.cloudfront.net/garoo_kawaii.webp"
              }
            },
            "hasPart": [
              { "@type": "Game", "name": "パズル", "url": "https://garoop.jp/game/puzzle" },
              { "@type": "Game", "name": "ポーカー", "url": "https://garoop.jp/game/poker" },
              { "@type": "Game", "name": "カードバトル", "url": "https://garoop.jp/game/card" },
              { "@type": "Game", "name": "シューティング", "url": "https://garoop.jp/game/shooter" },
              { "@type": "Game", "name": "名探偵ガルちゃん", "url": "https://garoop.jp/game/mystery" },
              { "@type": "Game", "name": "脱出ゲーム", "url": "https://garoop.jp/game/escape" },
              { "@type": "Game", "name": "ガルちゃんの冒険", "url": "https://garoop.jp/game/rpg" },
              { "@type": "Game", "name": "おしゃべりガルちゃん", "url": "https://garoop.jp/game/talking" },
              { "@type": "Game", "name": "流しそうめん", "url": "https://garoop.jp/game/somen" },
              { "@type": "Game", "name": "お城探検", "url": "https://garoop.jp/game/castle" },
              { "@type": "Game", "name": "サイバースロット", "url": "https://garoop.jp/game/slot" },
              { "@type": "Game", "name": "ツッコミの達人", "url": "https://garoop.jp/game/manzai" },
              { "@type": "Game", "name": "ガルちゃんスタジオ", "url": "https://garoop.jp/game/movie" },
              { "@type": "Game", "name": "ガルちゃんメーカー", "url": "https://garoop.jp/game/anime" },
              { "@type": "Game", "name": "スーパーガルちゃん", "url": "https://garoop.jp/game/platformer" },
              { "@type": "Game", "name": "レジェンド・クエスト", "url": "https://garoop.jp/game/legend" },
              { "@type": "Game", "name": "ガルちゃんボンバー", "url": "https://garoop.jp/game/bomber" },
              { "@type": "Game", "name": "クリスタル・ファンタジー", "url": "https://garoop.jp/game/crystal" },
              { "@type": "Game", "name": "ジャングル・ジャンプ", "url": "https://garoop.jp/game/jungle" },
              { "@type": "Game", "name": "スカイ・ライダー", "url": "https://garoop.jp/game/sky" }
            ]
          }),
        }}
      />
      <GameHub />
    </>
  );
}
