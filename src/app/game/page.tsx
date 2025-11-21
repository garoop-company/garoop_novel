import GameHub from '@/components/GameHub';
import Script from 'next/script';
import type { Metadata } from 'next';

// ✅ メタデータ（SEO対策）
export const metadata: Metadata = {
  title: 'Garuchan Game（ガルちゃんゲーム） | 無料で遊べる20種類のミニゲーム',
  description:
    'Garuchan Game（ガルちゃんゲーム）は、パズル、アクション、RPGなど20種類の無料ミニゲームが遊べるゲームハブです。ガルちゃんと一緒に遊ぼう！',
  keywords:
    '無料ゲーム, ミニゲーム, ガルちゃん, Garoop, パズル, アクション, RPG, 子供向けゲーム, ブラウザゲーム',
  openGraph: {
    title: 'Garuchan Game（ガルちゃんゲーム） | 無料で遊べる20種類のミニゲーム',
    description:
      'パズル、アクション、RPGなど20種類の無料ミニゲームが遊べる！ガルちゃんと一緒に遊ぼう！',
    url: 'https://garoop.jp/game',
    siteName: 'Garuchan Game',
    images: [
      {
        url: 'https://d3ez7mat4qd439.cloudfront.net/garoo_kawaii.webp',
        width: 1200,
        height: 630,
        alt: 'Garuchan Game',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garuchan Game（ガルちゃんゲーム）',
    description:
      'パズル、アクション、RPGなど20種類の無料ミニゲームが遊べる！',
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
              { "@type": "Game", "name": "ドラゴンガルーク", "url": "https://garoop.jp/game/dq" },
              { "@type": "Game", "name": "ガルちゃんボンバー", "url": "https://garoop.jp/game/bomber" },
              { "@type": "Game", "name": "ファイナルガルーク", "url": "https://garoop.jp/game/ff" },
              { "@type": "Game", "name": "ドンキーガルーク", "url": "https://garoop.jp/game/donkey" },
              { "@type": "Game", "name": "ガルちゃんエアライド", "url": "https://garoop.jp/game/airride" }
            ]
          }),
        }}
      />
      <GameHub />
    </>
  );
}
