import Link from 'next/link';
import Script from 'next/script';
import { promises as fs } from 'fs';
import path from 'path';
import Image from 'next/image';
import GaLink from '@/components/GaLink';
import { locales, getDictionary, Locale } from '@/locales';
import { localizePath } from '@/lib/locale-path';


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
      <div className="fixed inset-0 z-[-1] bg-slate-950 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(1200px 600px at 15% 20%, rgba(217, 164, 97, 0.12), transparent 70%), radial-gradient(900px 500px at 85% 80%, rgba(94, 168, 160, 0.1), transparent 70%), linear-gradient(135deg, #07080c 0%, #0f111a 55%, #0b0d14 100%)',
          }}
        />
        {/* Drifting Mist */}
        <div className="absolute top-[12%] left-[6%] w-52 h-20 bg-amber-400/10 blur-3xl rounded-full animate-float opacity-70" style={{ animationDuration: '7s' }}></div>
        <div className="absolute top-[30%] right-[12%] w-72 h-28 bg-teal-300/10 blur-3xl rounded-full animate-float opacity-60" style={{ animationDuration: '9s', animationDelay: '1s' }}></div>
        <div className="absolute top-[62%] left-[18%] w-48 h-16 bg-slate-200/10 blur-2xl rounded-full animate-float opacity-40" style={{ animationDuration: '8s', animationDelay: '2s' }}></div>

        {/* Halo Base */}
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[160%] aspect-square rounded-full border-[110px] border-slate-800/40 opacity-20"></div>
      </div>

      {/* ✅ 構造化データ（Googleニュース・AI検索・AIO最適化） */}
      <link rel="canonical" href={`${SITE_URL}${localizePath('/', lang)}`} />
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
              "ethicsPolicy": `${SITE_URL}${localizePath('/about', lang)}`,
              "masthead": `${SITE_URL}${localizePath('/about', lang)}`,
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
                  "urlTemplate": `${SITE_URL}${localizePath('/novels', lang)}?q={search_term_string}`
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
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-950/50 to-transparent"></div>
        </div>

        {/* Floating Clues */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-20 left-10 text-5xl animate-float opacity-30">🕯️</div>
          <div className="absolute top-40 right-10 text-5xl animate-float opacity-30" style={{ animationDelay: '1s' }}>🔍</div>
          <div className="absolute bottom-20 left-1/4 text-4xl animate-float opacity-25" style={{ animationDelay: '2s' }}>🗝️</div>
          <div className="absolute top-1/2 right-1/4 text-4xl animate-float opacity-25" style={{ animationDelay: '1.5s' }}>🕵️</div>
          <div className="absolute top-10 right-1/3 text-3xl animate-float opacity-20">📜</div>
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

          <div className="inline-block mb-6 px-8 py-3 bg-slate-900/80 backdrop-blur-md rounded-full shadow-xl text-amber-300 font-black border border-amber-300/40 animate-pulse text-lg tracking-wider">
            {dict.hero.welcome}
          </div>

          <h1 className="text-5xl md:text-9xl font-black mb-8 tracking-tighter text-slate-100 drop-shadow-[0_10px_14px_rgba(0,0,0,0.6)] leading-none"
            style={{ textShadow: '0 0 32px rgba(217, 164, 97, 0.45), 0 0 6px rgba(0, 0, 0, 0.9)' }}>
            {dict.hero.title}
          </h1>

          <div className="relative mb-12 transform -rotate-1">
            <p className="text-xl md:text-3xl text-slate-200 leading-relaxed font-black bg-slate-900/80 p-8 rounded-[2rem] shadow-2xl backdrop-blur-md border-b-8 border-r-8 border-slate-700">
              {dict.hero.subtitle}<br />
              <span className="text-lg text-amber-300 mt-3 block font-bold tracking-widest">{dict.hero.badges}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <GaLink
              href={localizePath('/novels', lang)}
              eventParams={{
                cta_label: "read_news",
                cta_location: "home_hero",
                cta_target: "/novels",
              }}
              className="group relative px-12 py-6 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-black rounded-full hover:shadow-[0_20px_40px_rgba(217,164,97,0.4)] transition-all duration-500 text-2xl shadow-2xl transform hover:-translate-y-2 border border-amber-200/40 active:scale-95"
            >
              <span className="relative z-10">{dict.hero.cta_news}</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity rounded-full"></div>
            </GaLink>
          </div>
        </div>
      </section>

      {/* ✅ 最新ニュースセクション (News Attractions) - SWAPPED TO BOTTOM */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-16">
            <div className="h-20 w-20 bg-gradient-to-br from-amber-500 to-teal-400 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl text-slate-950 transform -rotate-3">📰</div>
            <div className="text-center md:text-left">
              <h2 className="text-4xl md:text-5xl font-black text-slate-100 mb-2">{dict.sections.latest_news.title}</h2>
              <p className="text-amber-300 text-xl font-black uppercase tracking-widest italic flex items-center justify-center md:justify-start">
                <span className="bg-amber-500/10 px-3 py-1 rounded-lg text-amber-200">{dict.sections.latest_news.subtitle}</span>
              </p>
            </div>
            <Link href={localizePath('/novels', lang)} className="md:ml-auto px-8 py-4 bg-slate-900/80 text-amber-200 font-black rounded-full border border-slate-700 hover:border-amber-300/50 hover:text-amber-100 transition-all shadow-xl hover:shadow-2xl active:scale-95">
              {dict.common.all_news}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {latestNovels.map((novel) => (
              <Link
                href={localizePath(`/novels/${novel.id}`, lang)}
                key={novel.id}
                className="group block"
              >
                <div className="bg-slate-900/70 rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-[0_30px_50px_-10px_rgba(0,0,0,0.35)] transition-all duration-500 border border-slate-800 hover:border-amber-400/30 transform hover:-translate-y-3 h-full flex flex-col relative">
                  {/* Decorative Tape Element */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-amber-500/10 -rotate-2 z-10 hidden group-hover:block"></div>

                  <div className="h-4 bg-gradient-to-r from-amber-500/50 via-amber-400/40 to-teal-400/40 border-b-2 border-dashed border-slate-900/60"></div>
                  <div className="p-10 flex flex-col h-full">
                    <div className="mb-6">
                      <span className="text-xs font-black px-4 py-2 rounded-xl bg-slate-800 text-slate-300 uppercase tracking-widest border border-slate-700">
                        {novel.category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black mb-4 text-slate-100 group-hover:text-amber-200 transition-colors leading-tight">
                      {novel.title}
                    </h3>
                    <p className="text-slate-400 text-base line-clamp-3 mb-8 flex-grow font-medium leading-relaxed opacity-80">
                      {novel.description}
                    </p>
                    <div className="flex items-center text-amber-300 font-black group-hover:translate-x-3 transition-transform text-sm tracking-tighter">
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
