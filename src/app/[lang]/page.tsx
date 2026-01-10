import Link from 'next/link';
import Script from 'next/script';
import { promises as fs } from 'fs';
import path from 'path';
import Image from 'next/image';
import GaLink from '@/components/GaLink';
import { locales, getDictionary, Locale } from '@/locales';


// ✅ メタデータ（SEO対策）
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
  const siteUrl = 'https://www.ai-garoop-novel.com';

  return {
    metadataBase: new URL(siteUrl),
    title: 'カンガルーの遊園地 | 生成AIと赤ちゃんランド',
    description:
      'カンガルーの遊園地（ガルちゃんランド）は、生成AIと赤ちゃんが大暴れする新感覚エンタメテーマパーク。AI、ゲーム、アニメ、小説など、ワクワクするコンテンツを発信中。',
    keywords:
      'カンガルーの遊園地, 赤ちゃんランド, ガルちゃんランド, Garuchan Land, Garoop, ゲーム, AI, 生成AI, 教育, 山下大貴',
    icons: {
      icon: '/icon.svg',
      shortcut: '/icon.svg',
      apple: '/icon.png',
    },
    alternates: {
      canonical: `${siteUrl}/${lang}`,
      languages: {
        ja: `${siteUrl}/ja`,
        en: `${siteUrl}/en`,
        zh: `${siteUrl}/zh`,
        'x-default': `${siteUrl}/ja`,
      },
    },
    openGraph: {
      title: 'Garuchan Land（ガルちゃんランド）',
      description: 'AIと笑いで遊ぶテーマパークメディア｜Garoop公式',
      url: `${siteUrl}/${lang}`,
      siteName: 'Garuchan Land',
      images: [
        {
          url: `${siteUrl}/images/garuchan_island_map.png`,
          width: 1200,
          height: 630,
          alt: 'Garuchan Land',
        },
      ],
      locale: lang === 'ja' ? 'ja_JP' : lang === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Garuchan Land（ガルちゃんランド）',
      description: 'AIと笑いで遊ぶテーマパークメディア｜Garoop公式',
      images: [`${siteUrl}/images/garuchan_island_map.png`],
    },
  };
}

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
async function getLatestNovels(lang: string): Promise<Novel[]> {
  const jsonDirectory = path.join(process.cwd(), 'src', 'data');
  const fileContents = await fs.readFile(
    path.join(jsonDirectory, 'novels.json'),
    'utf8'
  );
  const novels: Novel[] = JSON.parse(fileContents);
  // 指定された言語の記事のみをフィルタリングし、最新3件を取得
  const filtered = novels.filter(n => n.lang === lang);
  return (filtered.length > 0 ? filtered : novels.filter(n => n.lang === 'ja')).slice(0, 3);
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: rawLang } = await params;
  const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
  const dict = getDictionary(lang);
  const latestNovels = await getLatestNovels(lang);

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden font-sans">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-[-1] bg-sky-100 overflow-hidden">
        <div className="absolute top-0 w-full h-full bg-gradient-to-b from-sky-300 via-sky-100 to-green-50"></div>
        {/* Parallax Clouds */}
        <div className="absolute top-[10%] left-[5%] w-48 h-20 bg-white/60 blur-2xl rounded-full animate-float opacity-80" style={{ animationDuration: '6s' }}></div>
        <div className="absolute top-[25%] right-[10%] w-64 h-28 bg-white/50 blur-3xl rounded-full animate-float opacity-70" style={{ animationDuration: '8s', animationDelay: '1s' }}></div>
        <div className="absolute top-[60%] left-[15%] w-40 h-16 bg-white/40 blur-xl rounded-full animate-float opacity-60" style={{ animationDuration: '7s', animationDelay: '2s' }}></div>

        {/* Rainbow Base */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[150%] aspect-square rounded-full border-[100px] border-white/5 opacity-10"></div>
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
            "logo": "https://www.ai-garoop-novel.com/images/garuchan_island_map.png",
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
      <section className="relative py-28 px-4 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Faded Background Image */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <Image
            src="/images/garuchan_island_map.png"
            alt="Hero Background"
            fill
            className="object-cover scale-110 blur-[2px]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-sky-400/40 via-white/10 to-transparent"></div>
        </div>

        {/* Floating Park Elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-20 left-10 text-6xl animate-float opacity-40">🎈</div>
          <div className="absolute top-40 right-10 text-6xl animate-float opacity-40" style={{ animationDelay: '1s' }}>🎡</div>
          <div className="absolute bottom-20 left-1/4 text-5xl animate-float opacity-30" style={{ animationDelay: '2s' }}>🍿</div>
          <div className="absolute top-1/2 right-1/4 text-5xl animate-float opacity-30" style={{ animationDelay: '1.5s' }}>🍭</div>
          <div className="absolute top-10 right-1/3 text-4xl animate-float opacity-20">🎢</div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Decorative Elements */}
          <div className="absolute -top-16 -right-8 lg:-right-32 w-48 h-48 lg:w-72 lg:h-72 animate-float hidden md:block" style={{ animationDelay: '1s' }}>
            <Image
              src="/images/garuchan_detective.png"
              alt="Detective Garuchan"
              fill
              className="object-contain drop-shadow-2xl transform rotate-12"
            />
          </div>

          <div className="inline-block mb-6 px-8 py-3 bg-white/90 backdrop-blur-md rounded-full shadow-xl text-pink-600 font-black border-4 border-pink-200 animate-bounce text-lg tracking-wider">
            {dict.hero.welcome}
          </div>

          <h1 className="text-5xl md:text-9xl font-black mb-8 tracking-tighter text-white drop-shadow-[0_8px_8px_rgba(0,0,0,0.3)] leading-none"
            style={{ textShadow: '4px 4px 0px #ec4899, 8px 8px 0px #f97316, 12px 12px 0px #eab308' }}>
            {dict.hero.title}
          </h1>

          <div className="relative mb-12 transform -rotate-1">
            <p className="text-xl md:text-3xl text-gray-800 leading-relaxed font-black bg-white/90 p-8 rounded-[2rem] shadow-2xl backdrop-blur-md border-b-8 border-r-8 border-pink-200">
              {dict.hero.subtitle}<br />
              <span className="text-lg text-pink-500 mt-3 block font-bold tracking-widest">{dict.hero.badges}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <GaLink
              href="/game"
              eventParams={{
                cta_label: "go_games",
                cta_location: "home_hero",
                cta_target: "/game",
              }}
              className="group relative px-12 py-6 bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-400 text-white font-black rounded-full hover:shadow-[0_20px_40px_rgba(249,115,22,0.5)] transition-all duration-500 text-2xl shadow-2xl transform hover:-translate-y-2 border-4 border-white active:scale-95"
            >
              <span className="relative z-10">{dict.hero.cta_games}</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity rounded-full"></div>
            </GaLink>
            <GaLink
              href="/novels"
              eventParams={{
                cta_label: "read_news",
                cta_location: "home_hero",
                cta_target: "/novels",
              }}
              className="px-10 py-5 bg-white text-gray-800 font-black rounded-full hover:bg-gray-50 transition-all duration-300 text-xl shadow-xl transform hover:-translate-y-1 border-4 border-gray-100 active:scale-95"
            >
              {dict.hero.cta_news}
            </GaLink>
          </div>
        </div>
      </section>

      {/* ✅ おすすめゲームセクション (Featured Games) - SWAPPED TO TOP */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-pink-300 to-transparent opacity-50"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-16">
            <div className="h-20 w-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl text-white transform rotate-3">🎮</div>
            <div className="text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-2">{dict.sections.featured_games.title}</h2>
              <p className="text-orange-500 text-xl font-black uppercase tracking-widest italic flex items-center justify-center md:justify-start">
                <span className="bg-orange-100 px-3 py-1 rounded-lg">{dict.sections.featured_games.subtitle}</span>
              </p>
            </div>
            <Link href="/game" className="md:ml-auto px-8 py-4 bg-white text-orange-600 font-black rounded-full border-4 border-orange-100 hover:border-orange-400 hover:text-orange-500 transition-all shadow-xl hover:shadow-2xl active:scale-95">
              {dict.common.all_games}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { id: 'rpg', title: dict.games.rpg.title, desc: dict.games.rpg.desc, img: '/images/game_rpg.png', color: 'orange', icon: '⚔️' },
              { id: 'startup', title: dict.games.startup.title, desc: dict.games.startup.desc, img: '/images/game_startup.png', color: 'blue', icon: '🚀' },
              { id: 'mystery', title: dict.games.mystery.title, desc: dict.games.mystery.desc, img: '/images/game_mystery.png', color: 'gray', icon: '🕵️‍♂️' },
              { id: 'poker', title: dict.games.poker.title, desc: dict.games.poker.desc, img: '/images/game_poker.png', color: 'red', icon: '🃏' },
            ].map((game) => (
              <Link key={game.id} href={`/game/${game.id}`} className="group relative">
                {/* Ticket Stub Card Design */}
                <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl group-hover:shadow-[0_40px_60px_-15px_rgba(0,0,0,0.2)] transition-all duration-500 border-4 border-white group-hover:border-pink-300 transform group-hover:-translate-y-4">
                  {/* Card Header (Strap Design) */}
                  <div className={`h-4 bg-${game.color}-500 w-full mb-1 border-b-2 border-dashed border-white`}></div>

                  {/* Image Container with "Perforation" effect */}
                  <div className="relative h-48 overflow-hidden mx-3 mt-2 rounded-[1.5rem] bg-gray-100">
                    <Image src={game.img} alt={game.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-pink-100 group-hover:rotate-12 transition-transform">
                      {game.icon}
                    </div>
                  </div>

                  <div className="p-6 relative">
                    {/* Perforation holes on sides */}
                    <div className="absolute top-0 -left-3 w-6 h-6 bg-sky-100 rounded-full border-4 border-white shadow-inner"></div>
                    <div className="absolute top-0 -right-3 w-6 h-6 bg-sky-100 rounded-full border-4 border-white shadow-inner"></div>

                    <h3 className="text-xl font-black text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-gray-500 text-sm font-bold line-clamp-1 mb-4 opacity-70">
                      {game.desc}
                    </p>

                    <div className="flex justify-between items-center mt-2 border-t-2 border-dashed border-pink-50 pt-4">
                      <span className="text-[10px] font-black text-pink-400 tracking-tighter uppercase">ADMIT ONE • FREE</span>
                      <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 font-bold group-hover:bg-pink-500 group-hover:text-white transition-all">
                        ▶
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shadow/Reflection beneath */}
                <div className="h-4 w-4/5 mx-auto bg-black/5 blur-lg rounded-full mt-4 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ 最新ニュースセクション (News Attractions) - SWAPPED TO BOTTOM */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-16">
            <div className="h-20 w-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl text-white transform -rotate-3">📰</div>
            <div className="text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-black text-gray-800 mb-2">{dict.sections.latest_news.title}</h2>
              <p className="text-pink-500 text-xl font-black uppercase tracking-widest italic flex items-center justify-center md:justify-start">
                <span className="bg-pink-100 px-3 py-1 rounded-lg">{dict.sections.latest_news.subtitle}</span>
              </p>
            </div>
            <Link href="/novels" className="md:ml-auto px-8 py-4 bg-white text-pink-600 font-black rounded-full border-4 border-pink-100 hover:border-pink-400 hover:text-pink-500 transition-all shadow-xl hover:shadow-2xl active:scale-95">
              {dict.common.all_news}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {latestNovels.map((novel) => (
              <Link
                href={`/novels/${novel.id}`}
                key={novel.id}
                className="group block"
              >
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-[0_30px_50px_-10px_rgba(0,0,0,0.15)] transition-all duration-500 border-4 border-white hover:border-pink-100 transform hover:-translate-y-3 h-full flex flex-col relative">
                  {/* Decorative Tape Element */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-pink-100/50 -rotate-2 z-10 hidden group-hover:block"></div>

                  <div className="h-4 bg-gradient-to-r from-pink-400 via-pink-300 to-pink-500 border-b-2 border-dashed border-white/50"></div>
                  <div className="p-10 flex flex-col h-full">
                    <div className="mb-6">
                      <span className="text-xs font-black px-4 py-2 rounded-xl bg-gray-100 text-gray-600 uppercase tracking-widest border border-gray-200">
                        {novel.category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black mb-4 text-gray-800 group-hover:text-pink-500 transition-colors leading-tight">
                      {novel.title}
                    </h3>
                    <p className="text-gray-500 text-base line-clamp-3 mb-8 flex-grow font-medium leading-relaxed opacity-80">
                      {novel.description}
                    </p>
                    <div className="flex items-center text-pink-500 font-black group-hover:translate-x-3 transition-transform text-sm tracking-tighter">
                      {dict.sections.latest_news.read_more} <span className="ml-3 text-xl">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
