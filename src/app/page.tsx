import Link from 'next/link';
import Script from 'next/script';
import { promises as fs } from 'fs';
import path from 'path';

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

// 小説データの型定義
type Novel = {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string[];
  keywords: string;
  lang: string;
};

// 最新の小説を取得する関数
async function getLatestNovels(): Promise<Novel[]> {
  const jsonDirectory = path.join(process.cwd(), 'src', 'data');
  const fileContents = await fs.readFile(
    path.join(jsonDirectory, 'novels.json'),
    'utf8'
  );
  const novels: Novel[] = JSON.parse(fileContents);
  // 日本語の記事のみをフィルタリングし、最新3件を取得（ID降順と仮定）
  return novels.filter(n => n.lang === 'ja').slice(0, 3);
}

export default async function HomePage() {
  const latestNovels = await getLatestNovels();

  return (
    <main className="flex min-h-screen flex-col bg-gray-900 text-white">
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
      <section className="relative py-20 px-4 overflow-hidden flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="z-10 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-serif bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-orange-400">
            Garuchan News
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            AIと笑いで読む、時代のニュースメディア。<br />
            <span className="text-base text-gray-400 mt-2 block">地方創生 × エンタメ × テクノロジー</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/novels"
              className="px-8 py-4 bg-pink-600 text-white font-bold rounded-full hover:bg-pink-700 transition-all duration-300 text-lg shadow-lg shadow-pink-900/30 transform hover:scale-105"
            >
              最新ニュースを読む
            </Link>
            <Link
              href="/game"
              className="px-8 py-4 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 transition-all duration-300 text-lg shadow-lg shadow-orange-900/30 transform hover:scale-105"
            >
              ゲームランドへ GO! 🎮
            </Link>
          </div>
        </div>

        {/* 背景エフェクト */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/90 to-gray-900 z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-600/20 rounded-full blur-3xl z-[-1]" />
      </section>

      {/* ✅ 最新ニュースセクション */}
      <section className="py-16 px-4 bg-gray-800/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold border-l-4 border-pink-500 pl-4">Latest News</h2>
            <Link href="/novels" className="text-pink-400 hover:text-pink-300 transition-colors">
              もっと見る →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestNovels.map((novel) => (
              <Link
                href={`/novels/${novel.id}`}
                key={novel.id}
                className="group bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-pink-900/20 transition-all duration-300 border border-gray-700 hover:border-pink-500/50"
              >
                <div className="p-6 h-full flex flex-col">
                  <div className="mb-4">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-700 text-gray-300 group-hover:bg-pink-900/50 group-hover:text-pink-200 transition-colors">
                      {novel.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-pink-400 transition-colors line-clamp-2">
                    {novel.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-grow">
                    {novel.description}
                  </p>
                  <div className="text-pink-500 text-sm font-bold group-hover:translate-x-1 transition-transform">
                    Read Article &rarr;
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ おすすめゲームセクション */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold border-l-4 border-orange-500 pl-4">Featured Games</h2>
            <Link href="/game" className="text-orange-400 hover:text-orange-300 transition-colors">
              全ゲームを見る →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/game/rpg" className="group relative rounded-xl overflow-hidden aspect-video bg-gray-800 border border-gray-700 hover:border-orange-500 transition-all">
              <div className="absolute inset-0 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
                ⚔️
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                <h3 className="font-bold text-lg group-hover:text-orange-400 transition-colors">ガルちゃんの冒険</h3>
                <p className="text-xs text-gray-400">本格RPG</p>
              </div>
            </Link>
            <Link href="/game/puzzle" className="group relative rounded-xl overflow-hidden aspect-video bg-gray-800 border border-gray-700 hover:border-orange-500 transition-all">
              <div className="absolute inset-0 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
                🧩
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                <h3 className="font-bold text-lg group-hover:text-orange-400 transition-colors">パズル</h3>
                <p className="text-xs text-gray-400">頭の体操</p>
              </div>
            </Link>
            <Link href="/game/mystery" className="group relative rounded-xl overflow-hidden aspect-video bg-gray-800 border border-gray-700 hover:border-orange-500 transition-all">
              <div className="absolute inset-0 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
                🕵️‍♂️
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                <h3 className="font-bold text-lg group-hover:text-orange-400 transition-colors">名探偵ガルちゃん</h3>
                <p className="text-xs text-gray-400">謎解きアドベンチャー</p>
              </div>
            </Link>
            <Link href="/game/action" className="group relative rounded-xl overflow-hidden aspect-video bg-gray-800 border border-gray-700 hover:border-orange-500 transition-all">
              <div className="absolute inset-0 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
                🏃
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                <h3 className="font-bold text-lg group-hover:text-orange-400 transition-colors">スーパーガルちゃん</h3>
                <p className="text-xs text-gray-400">アクションゲーム</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}