import Link from 'next/link';
import Script from 'next/script';
import { promises as fs } from 'fs';
import path from 'path';
import Image from 'next/image';


// ✅ メタデータ（SEO対策）
export const metadata = {
  title: 'Garuchan Land（ガルちゃんランド） | AIと笑いで遊ぶテーマパークメディア',
  description:
    'Garuchan Land（ガルちゃんランド）は、AIとユーモアで楽しむ新感覚エンタメテーマパーク。生成AI、ゲーム、アニメ、小説など、ワクワクするコンテンツを独自視点で発信。',
  keywords:
    'ガルちゃんランド, Garuchan Land, Garoop, ゲーム, AI, 生成AI, 地方創生, エンタメ, 教育, 山下大貴',
  alternates: {
    canonical: 'https://garoop.jp',
  },
  openGraph: {
    title: 'Garuchan Land（ガルちゃんランド）',
    description:
      'AIと笑いで遊ぶテーマパークメディア｜Garoop公式',
    url: 'https://garoop.jp',
    siteName: 'Garuchan Land',
    images: [
      {
        url: 'https://d3ez7mat4qd439.cloudfront.net/garoo_kawaii.webp',
        width: 1200,
        height: 630,
        alt: 'Garuchan Land',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garuchan Land（ガルちゃんランド）',
    description:
      'AIと笑いで遊ぶテーマパークメディア｜Garoop公式',
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
    <main className="flex min-h-screen flex-col overflow-x-hidden font-sans">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-[-1] bg-sky-200">
        <div className="absolute top-0 w-full h-full bg-gradient-to-b from-sky-300 via-sky-200 to-green-100"></div>
        {/* Clouds */}
        <div className="absolute top-10 left-10 w-32 h-16 bg-white/40 blur-xl rounded-full animate-float opacity-70"></div>
        <div className="absolute top-20 right-20 w-48 h-24 bg-white/40 blur-xl rounded-full animate-float opacity-60" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* ✅ 構造化データ（Googleニュース・AI検索最適化） */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsMediaOrganization",
            "name": "Garuchan Land",
            "url": "https://garoop.jp",
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

      {/* ✅ ヒーローセクション (Entrance) */}
      <section className="relative py-24 px-4 flex flex-col items-center justify-center text-center">
        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Decorative Elements */}
          <div className="absolute -top-12 -right-4 lg:-right-24 w-40 h-40 lg:w-56 lg:h-56 animate-float hidden md:block" style={{ animationDelay: '1s' }}>
            <Image
              src="/images/garuchan_detective.png"
              alt="Detective Garuchan"
              fill
              className="object-contain drop-shadow-2xl transform rotate-12"
            />
          </div>

          <div className="inline-block mb-4 px-6 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-pink-500 font-bold border border-pink-200 animate-bounce">
            🎡 Welcome to the Theme Park of Dreams!
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tight text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)]"
            style={{ textShadow: '4px 4px 0px #ec4899, 8px 8px 0px #f97316' }}>
            Garuchan Land
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed font-bold bg-white/60 p-6 rounded-3xl shadow-lg backdrop-blur-sm">
            AIと笑いで遊ぶ、夢のテーマパークへようこそ！<br />
            <span className="text-base text-gray-500 mt-2 block font-normal">地方創生 × エンタメ × テクノロジー</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/novels"
              className="px-10 py-5 bg-white text-pink-600 font-black rounded-full hover:bg-pink-50 transition-all duration-300 text-xl shadow-[0_10px_20px_rgba(236,72,153,0.3)] transform hover:-translate-y-1 border-4 border-pink-100"
            >
              📰 ニュースを読む
            </Link>
            <Link
              href="/game"
              className="px-10 py-5 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-black rounded-full hover:shadow-[0_10px_20px_rgba(249,115,22,0.4)] transition-all duration-300 text-xl shadow-lg transform hover:-translate-y-1 border-4 border-white/30"
            >
              🎮 ゲームランドへ GO!
            </Link>
          </div>
        </div>
      </section>

      {/* ✅ 最新ニュースセクション (News Attractions) */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-12 w-12 bg-pink-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg text-white">📰</div>
            <div>
              <h2 className="text-3xl font-black text-gray-800">Latest News</h2>
              <p className="text-gray-500 font-bold">最新のアトラクション（記事）をチェック！</p>
            </div>
            <Link href="/novels" className="ml-auto text-pink-500 font-bold hover:text-pink-400 transition-colors bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md">
              もっと見る →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestNovels.map((novel) => (
              <Link
                href={`/novels/${novel.id}`}
                key={novel.id}
                className="group block h-full"
              >
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-4 border-white hover:border-pink-200 transform hover:-translate-y-2 h-full flex flex-col">
                  <div className="h-3 bg-pink-400 border-b-2 border-dashed border-white"></div>
                  <div className="p-8 flex flex-col h-full">
                    <div className="mb-4">
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-pink-100 text-pink-600 uppercase tracking-wide">
                        {novel.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-black mb-3 text-gray-800 group-hover:text-pink-500 transition-colors line-clamp-2">
                      {novel.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-grow font-medium leading-relaxed">
                      {novel.description}
                    </p>
                    <div className="flex items-center text-pink-500 font-bold group-hover:translate-x-2 transition-transform">
                      READ MORE <span className="ml-2">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ おすすめゲームセクション (Featured Games) */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex items-center gap-4 mb-10 justify-end md:justify-start flex-row-reverse md:flex-row">
            <Link href="/game" className="mr-auto md:mr-0 md:ml-auto text-orange-500 font-bold hover:text-orange-400 transition-colors bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md">
              全ゲームを見る →
            </Link>
            <div className="text-right md:text-left">
              <h2 className="text-3xl font-black text-gray-800">Featured Games</h2>
              <p className="text-gray-500 font-bold">人気のゲームで遊ぼう！</p>
            </div>
            <div className="h-12 w-12 bg-orange-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg text-white">🎮</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/game/rpg" className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-white border-4 border-white shadow-xl hover:shadow-2xl hover:border-orange-300 transition-all transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-pink-100 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
                ⚔️
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-4 border-t border-gray-100">
                <h3 className="font-black text-lg text-gray-800 group-hover:text-orange-500 transition-colors">ガルちゃんの冒険</h3>
                <p className="text-xs text-gray-500 font-bold">本格RPG</p>
              </div>
            </Link>
            <Link href="/game/puzzle" className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-white border-4 border-white shadow-xl hover:shadow-2xl hover:border-blue-300 transition-all transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-blue-100 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
                🧩
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-4 border-t border-gray-100">
                <h3 className="font-black text-lg text-gray-800 group-hover:text-blue-500 transition-colors">パズル</h3>
                <p className="text-xs text-gray-500 font-bold">頭の体操</p>
              </div>
            </Link>
            <Link href="/game/mystery" className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-white border-4 border-white shadow-xl hover:shadow-2xl hover:border-gray-500 transition-all transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
                🕵️‍♂️
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-4 border-t border-gray-100">
                <h3 className="font-black text-lg text-gray-800 group-hover:text-gray-600 transition-colors">名探偵ガルちゃん</h3>
                <p className="text-xs text-gray-500 font-bold">謎解きアドベンチャー</p>
              </div>
            </Link>
            <Link href="/game/action" className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-white border-4 border-white shadow-xl hover:shadow-2xl hover:border-red-300 transition-all transform hover:-translate-y-2">
              <div className="absolute inset-0 bg-red-100 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
                🏃
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-4 border-t border-gray-100">
                <h3 className="font-black text-lg text-gray-800 group-hover:text-red-500 transition-colors">スーパーガルちゃん</h3>
                <p className="text-xs text-gray-500 font-bold">アクションゲーム</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}