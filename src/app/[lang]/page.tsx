import Link from 'next/link';
import Script from 'next/script';
import Image from 'next/image';
import GaLink from '@/components/GaLink';
import { locales, getDictionary, Locale } from '@/locales';
import { localizePath } from '@/lib/locale-path';
import { fetchJson, NOVELS_INDEX_PATH } from '@/lib/data-source';


import { generateLocalizedMetadata, SITE_URL } from "@/lib/seo";

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

type Novel = {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string[];
  keywords: string;
  lang: string;
};

async function getLatestNovels(lang: string): Promise<Novel[]> {
  const novels = await fetchJson<Novel[]>(NOVELS_INDEX_PATH);
  const filtered = novels.filter(n => n.lang === lang);
  return (filtered.length > 0 ? filtered : novels.filter(n => n.lang === 'ja')).slice(0, 6);
}

const SPINE_PALETTE = [
  { bg: 'linear-gradient(180deg,#3b1f1a 0%,#2a1410 60%,#3b1f1a 100%)', accent: '#e6c98a' },
  { bg: 'linear-gradient(180deg,#1f2a3b 0%,#0f1828 60%,#1f2a3b 100%)', accent: '#cfa86b' },
  { bg: 'linear-gradient(180deg,#2c2419 0%,#1a140b 60%,#2c2419 100%)', accent: '#d6b573' },
  { bg: 'linear-gradient(180deg,#3b2a1f 0%,#241710 60%,#3b2a1f 100%)', accent: '#c89d5e' },
  { bg: 'linear-gradient(180deg,#1f3b33 0%,#0f1f1a 60%,#1f3b33 100%)', accent: '#dcb96f' },
  { bg: 'linear-gradient(180deg,#2a1f3b 0%,#150f24 60%,#2a1f3b 100%)', accent: '#d8b264' },
];

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
    <main className="relative flex min-h-screen flex-col overflow-x-hidden font-sans text-amber-50">
      {/* Library backdrop */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(1000px 600px at 20% 15%, rgba(217,164,97,0.18), transparent 70%), radial-gradient(800px 500px at 85% 85%, rgba(120,40,40,0.18), transparent 70%), linear-gradient(160deg, #0a0807 0%, #100b0a 50%, #0a0807 100%)',
          }}
        />
        {/* faint paper grain */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] mix-blend-soft-light"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,220,170,0.6) 1px, transparent 1px)',
            backgroundSize: '3px 3px',
          }}
        />
        {/* candle smoke */}
        <div className="absolute top-[10%] left-[8%] w-60 h-24 bg-amber-300/10 blur-3xl rounded-full animate-float opacity-50" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[60%] right-[10%] w-72 h-28 bg-rose-300/10 blur-3xl rounded-full animate-float opacity-40" style={{ animationDuration: '10s', animationDelay: '1.5s' }} />
      </div>

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
                "height": 630,
              },
              "founder": {
                "@type": "Person",
                "name": "山下大貴",
                "jobTitle": "代表取締役",
                "affiliation": { "@type": "Organization", "name": "株式会社Garoop" },
              },
              "foundingDate": "2023",
              "address": { "@type": "PostalAddress", "addressRegion": "Nagasaki", "addressCountry": "JP" },
              "sameAs": [
                "https://x.com/garoop_company",
                "https://www.instagram.com/garoop_official/",
                "https://www.youtube.com/@garooptv",
                "https://garoop.jp",
              ],
              "description": "生成AIが綴る人物列伝と長崎物語。Garoopの夜の文庫。",
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
                  "urlTemplate": `${SITE_URL}${localizePath('/novels', lang)}?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            },
          ]),
        }}
      />

      {/* HERO — bookplate style */}
      <section className="relative pt-20 pb-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="relative">
            {/* Bookplate frame */}
            <div
              className="relative rounded-[10px] px-6 sm:px-12 py-14 sm:py-20 overflow-hidden"
              style={{
                background:
                  'linear-gradient(180deg, rgba(245,228,191,0.04) 0%, rgba(245,228,191,0.02) 100%)',
                boxShadow:
                  'inset 0 0 0 1px rgba(217,180,120,0.18), inset 0 0 0 6px rgba(217,180,120,0.06), inset 0 0 0 7px rgba(217,180,120,0.18)',
              }}
            >
              {/* Background image, very faint */}
              <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
                <Image
                  src="/images/garoop_novel_background.png"
                  alt=""
                  fill
                  className="object-cover blur-[3px]"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-stone-950/85 via-stone-950/65 to-stone-950/90" />
              </div>

              {/* ガルちゃん character (decorative, floating) */}
              <div
                aria-hidden
                className="absolute z-10 right-2 sm:right-6 md:right-10 -bottom-6 sm:-bottom-10 md:bottom-6 w-28 sm:w-40 md:w-52 lg:w-60 pointer-events-none animate-float"
                style={{ animationDuration: '6s' }}
              >
                <div className="relative aspect-square">
                  {/* halo */}
                  <div className="absolute inset-0 rounded-full bg-amber-300/20 blur-2xl" />
                  <Image
                    src="https://d3ez7mat4qd439.cloudfront.net/garoo_kawaii.webp"
                    alt="ガルちゃん"
                    fill
                    sizes="(max-width: 640px) 7rem, (max-width: 768px) 10rem, (max-width: 1024px) 13rem, 15rem"
                    className="object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.6)]"
                    priority
                  />
                </div>
                {/* speech bookmark */}
                <div className="absolute -top-2 -left-3 sm:-left-4 md:-left-6 rotate-[-8deg] bg-amber-50 text-stone-800 rounded-md px-2.5 py-1 text-[10px] sm:text-[11px] font-serif shadow-md border border-amber-200">
                  📖 一緒に読も?
                </div>
              </div>

              <div className="relative z-20 text-center">
                <p className="font-serif tracking-[0.4em] text-amber-200/70 text-[11px] sm:text-xs uppercase">
                  {dict.hero.welcome}
                </p>

                <h1
                  className="mt-6 mb-4 font-serif font-black text-amber-50 text-5xl sm:text-7xl md:text-8xl tracking-[0.04em]"
                  style={{ textShadow: '0 0 30px rgba(217,164,97,0.25)' }}
                >
                  {dict.hero.title}
                </h1>

                <div className="mx-auto my-6 flex items-center justify-center gap-3 text-amber-200/60">
                  <span className="block h-px w-16 bg-amber-200/30" />
                  <span className="text-sm">❦</span>
                  <span className="block h-px w-16 bg-amber-200/30" />
                </div>

                <p className="font-serif text-base sm:text-lg leading-loose text-amber-50/85 max-w-2xl mx-auto">
                  {dict.hero.subtitle}
                </p>

                <p className="mt-6 font-serif text-amber-200/70 tracking-[0.2em] text-xs">
                  {dict.hero.badges}
                </p>

                <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <GaLink
                    href={localizePath('/novels', lang)}
                    eventParams={{
                      cta_label: 'open_library',
                      cta_location: 'home_hero',
                      cta_target: '/novels',
                    }}
                    className="group relative inline-flex items-center gap-3 px-9 py-4 rounded-[6px] bg-amber-300 text-stone-900 font-serif font-bold tracking-wider shadow-[0_18px_40px_-12px_rgba(217,164,97,0.55)] hover:bg-amber-200 transition-all"
                  >
                    <span className="text-xl leading-none">📖</span>
                    <span>{dict.hero.cta_news}</span>
                  </GaLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHELF — books displayed as spines */}
      <section className="px-4 pb-24">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-baseline justify-between gap-4 mb-8 border-b border-amber-200/15 pb-4">
            <div>
              <p className="font-serif tracking-[0.3em] text-amber-200/70 text-xs uppercase">
                {dict.sections.latest_news.subtitle}
              </p>
              <h2 className="mt-1 font-serif text-3xl sm:text-4xl text-amber-50">
                {dict.sections.latest_news.title}
              </h2>
            </div>
            <Link
              href={localizePath('/novels', lang)}
              className="self-start md:self-auto inline-flex items-center gap-1 text-amber-200/80 hover:text-amber-100 font-serif text-sm tracking-wider"
            >
              {dict.common.all_news}
            </Link>
          </div>

          {/* Bookshelf */}
          <div
            className="relative rounded-[10px] p-5 sm:p-7"
            style={{
              background:
                'linear-gradient(180deg, rgba(60,38,22,0.5) 0%, rgba(34,21,12,0.65) 100%)',
              boxShadow:
                'inset 0 0 0 1px rgba(217,180,120,0.18), 0 30px 50px -20px rgba(0,0,0,0.7)',
            }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
              {latestNovels.map((novel, i) => {
                const palette = SPINE_PALETTE[i % SPINE_PALETTE.length];
                return (
                  <Link
                    href={localizePath(`/novels/${novel.id}`, lang)}
                    key={`${novel.id}-${novel.lang}`}
                    className="group relative h-[300px] sm:h-[340px] rounded-[3px] overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:rotate-[-1deg]"
                    style={{
                      background: palette.bg,
                      boxShadow:
                        '0 18px 30px -12px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,220,170,0.08), inset 4px 0 8px rgba(0,0,0,0.4), inset -4px 0 8px rgba(0,0,0,0.4)',
                    }}
                  >
                    {/* gold lines */}
                    <div className="absolute top-3 left-3 right-3 h-px" style={{ backgroundColor: palette.accent, opacity: 0.5 }} />
                    <div className="absolute bottom-3 left-3 right-3 h-px" style={{ backgroundColor: palette.accent, opacity: 0.5 }} />

                    {/* Spine text — vertical */}
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-between py-7 px-3 text-center"
                      style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                    >
                      <span
                        className="font-serif text-[10px] tracking-[0.25em] uppercase"
                        style={{ color: palette.accent, opacity: 0.85 }}
                      >
                        {novel.category}
                      </span>
                      <h3
                        className="font-serif text-base sm:text-lg leading-tight px-1 line-clamp-[10]"
                        style={{ color: '#f5e9c8' }}
                      >
                        {novel.title}
                      </h3>
                      <span
                        className="font-serif text-[10px] tracking-widest"
                        style={{ color: palette.accent, opacity: 0.7 }}
                      >
                        Garoop 文庫
                      </span>
                    </div>

                    {/* Hover glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,235,180,0.10) 0%, transparent 50%)',
                      }}
                    />
                  </Link>
                );
              })}
            </div>
            {/* shelf wood */}
            <div
              className="mt-5 h-3 rounded"
              style={{
                background:
                  'linear-gradient(180deg, #3b2418 0%, #1f140c 100%)',
                boxShadow: '0 6px 14px rgba(0,0,0,0.6)',
              }}
            />
          </div>

          {/* Synopsis grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestNovels.slice(0, 3).map((novel) => (
              <Link
                href={localizePath(`/novels/${novel.id}`, lang)}
                key={`syn-${novel.id}-${novel.lang}`}
                className="group block"
              >
                <article
                  className="relative h-full rounded-[8px] p-7 transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(245,228,191,0.04) 0%, rgba(245,228,191,0.01) 100%)',
                    boxShadow:
                      'inset 0 0 0 1px rgba(217,180,120,0.18), inset 0 0 0 6px rgba(217,180,120,0.05), inset 0 0 0 7px rgba(217,180,120,0.12)',
                  }}
                >
                  <p className="font-serif tracking-[0.3em] text-amber-200/70 text-[10px] uppercase mb-3">
                    {novel.category}
                  </p>
                  <h3 className="font-serif text-xl text-amber-50 leading-snug mb-3 group-hover:text-amber-200 transition-colors">
                    {novel.title}
                  </h3>
                  <p className="font-serif text-sm leading-loose text-amber-50/70 line-clamp-4">
                    {novel.description}
                  </p>
                  <div className="mt-5 flex items-center text-amber-200/80 group-hover:text-amber-100 font-serif text-sm tracking-wider transition-colors">
                    {dict.sections.latest_news.read_more}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
