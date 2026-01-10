import GameHub from '@/components/GameHub';
import Script from 'next/script';
import { locales, getDictionary, Locale } from '@/locales';

import { generateLocalizedMetadata } from '@/lib/seo';

// ✅ メタデータ（SEO対策）
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
  const dict = getDictionary(lang);

  return generateLocalizedMetadata({
    title: `${dict.common.games} | Garuchan Land`,
    description: dict.hero.subtitle,
    lang,
    path: '/game',
    image: '/images/game_startup.png',
  });
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
  const dict = getDictionary(lang);
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
            "name": `${dict.common.games} | Garuchan Land`,
            "description": dict.hero.subtitle,
            "url": `https://garoop.jp/${lang}/game`,
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
