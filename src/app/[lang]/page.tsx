import Link from 'next/link';
import Script from 'next/script';
import { promises as fs } from 'fs';
import path from 'path';
import Image from 'next/image';
import GaLink from '@/components/GaLink';
import { locales, getDictionary, Locale } from '@/locales';


import { generateLocalizedMetadata, SITE_URL } from "@/lib/seo";

// ✅ メタデータ（SEO対策）
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
  const dict = getDictionary(lang);

  return generateLocalizedMetadata({
    title: dict.hero.title,
    description: dict.hero.subtitle,
    lang,
    path: '/',
    image: 'https://d3ez7mat4qd439.cloudfront.net/summary_image/garoop_ai_land.webp',
  });
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

      {/* ✅ 構造化データ（Googleニュース・AI検索・AIO最適化） */}
      <link rel="canonical" href={`${SITE_URL}/${lang}`} />
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "NewsMediaOrganization",
              "name": "Garoop Novel",
              "alternateName": ["Garoop Novel"],
              "url": SITE_URL,
              "logo": {
                "@type": "ImageObject",
                "url": `${SITE_URL}/images/garoop_novel_background.png`,
                "width": 1200,
                "height": 630
              },
              "founder": {
                "@type": "Person",
                "name": "山下大貴",
                "jobTitle": "代表取締役",
                "affiliation": {
                  "@type": "Organization",
                  "name": "株式会社Garoop"
                }
              },
              "foundingDate": "2023",
              "address": {
                "@type": "PostalAddress",
                "addressRegion": "Nagasaki",
                "addressCountry": "JP"
              },
              "sameAs": [
                "https://x.com/garoop_company",
                "https://www.instagram.com/garoop_official/",
                "https://www.youtube.com/@garooptv",
                "https://garoop.jp"
              ],
              "description": "生成AIとエンターテインメントを融合させた次世代ポータル。AI小説と地方創生ニュースを提供。",
              "ethicsPolicy": `${SITE_URL}/${lang}/about`,
              "masthead": `${SITE_URL}/${lang}/about`,
              "isAccessibleForFree": true,
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Garoop Novel",
              "url": SITE_URL,
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${SITE_URL}/${lang}/novels?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              }
            }
          ]),
        }}
      />

      {/* ✅ ヒーローセクション (Entrance) */}
      <section className="relative py-28 px-4 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Faded Background Image */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <Image
            src="/images/garoop_novel_background.png"
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
              href="/novels"
              eventParams={{
                cta_label: "read_news",
                cta_location: "home_hero",
                cta_target: "/novels",
              }}
              className="group relative px-12 py-6 bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-400 text-white font-black rounded-full hover:shadow-[0_20px_40px_rgba(249,115,22,0.5)] transition-all duration-500 text-2xl shadow-2xl transform hover:-translate-y-2 border-4 border-white active:scale-95"
            >
              <span className="relative z-10">{dict.hero.cta_news}</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity rounded-full"></div>
            </GaLink>
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
