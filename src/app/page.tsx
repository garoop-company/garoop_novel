import Link from 'next/link';
import Script from 'next/script';

// ✅ メタデータ（SEO対策）
export const metadata = {
  title: 'Garuchan News（ガルちゃんニュース） | AIと笑いで読む面白ニュースメディア',
  description:
    'Garuchan News（ガルちゃんニュース）は、AIとユーモアで時代を読み解く新感覚ニュースメディア。生成AI、地方創生、エンタメ、教育、政治、社会トレンドを独自視点で発信。',
  keywords:
    'ガルちゃんニュース, Garuchan News, Garoop, 面白ニュース, AIニュース, 生成AI, 地方創生, エンタメ, 教育, 政治, 社会, 山下大貴',
  alternates: {
    canonical: 'https://garoop.jp/news',
  },
  openGraph: {
    title: 'Garuchan News（ガルちゃんニュース）',
    description:
      'AIと笑いで読む面白ニュースメディア｜Garoop公式',
    url: 'https://garoop.jp/news',
    siteName: 'Garuchan News',
    images: [
      {
        url: 'https://d3ez7mat4qd439.cloudfront.net/garoo_kawaii.webp',
        width: 1200,
        height: 630,
        alt: 'Garuchan News',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garuchan News（ガルちゃんニュース）',
    description:
      'AIと笑いで読む面白ニュースメディア｜Garoop公式',
    images: ['https://d3ez7mat4qd439.cloudfront.net/garoo_kawaii.webp'],
  },
};

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-8 relative overflow-hidden">
      {/* ✅ 構造化データ（Googleニュース・AI検索最適化） */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsMediaOrganization",
            "name": "Garuchan News",
            "url": "https://garoop.jp/news",
            "logo": "https://d3ez7mat4qd439.cloudfront.net/garoo_kawaii.webp",
            "founder": {
              "@type": "Person",
              "name": "山下大貴",
              "affiliation": "Garoop株式会社",
            },
            "sameAs": [
              "https://x.com/garoop_company",
              "https://www.instagram.com/garoop_official/",
              "https://www.youtube.com/@garooptv"
            ],
            "about": {
              "@type": "Thing",
              "name": "AIニュースと地方創生メディア",
              "description":
                "AIとユーモアで時代を読み解く面白ニュースメディア。生成AI・教育・地方創生・エンタメ・社会をテーマに記事を発信。",
            },
          }),
        }}
      />

      {/* ✅ ヒーローセクション */}
      <div className="text-center z-10">
        <h1 className="text-5xl font-bold mb-4 font-serif">
          Garuchan News（ガルちゃんニュース）
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          AIと笑いで読む、時代のニュースメディア。
        </p>
      </div>

      {/* ✅ メインビジュアル */}
      <div className="mb-8 z-10">
        <img
          src="https://d3ez7mat4qd439.cloudfront.net/garoo_kawaii.webp"
          alt="ガルちゃんニュース メインビジュアル"
          width={400}
          height={600}
          className="rounded-lg shadow-2xl shadow-pink-700/40 hover:scale-105 transition-transform duration-500"
          style={{ height: 'auto' }}
        />
      </div>

      {/* ✅ CTAボタン */}
      <Link
        href="/novels"
        className="px-8 py-4 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-all duration-300 text-xl z-10 shadow-lg shadow-pink-900/30"
      >
        最新ニュースを読む
      </Link>

      {/* ✅ 背景エフェクト（軽い光彩） */}
      <div className="absolute inset-0 bg-gradient-to-t from-pink-950/40 via-transparent to-gray-900/90 blur-3xl" />
    </main>
  );
}