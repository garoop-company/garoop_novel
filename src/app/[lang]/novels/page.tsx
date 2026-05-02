import { locales, Locale, localeMeta, getDictionary } from '@/locales';
import { generateLocalizedMetadata } from '@/lib/seo';
import { localizePath } from '@/lib/locale-path';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
  const dict = getDictionary(lang);
  return generateLocalizedMetadata({
    title: `${dict.sections.latest_news.title} | Garoop Novel`,
    description: dict.sections.latest_news.subtitle,
    lang,
    path: '/novels',
  });
}
import Link from 'next/link';
import { fetchJson, NOVELS_INDEX_PATH } from '@/lib/data-source';

type Novel = {
  id: string;
  title: string;
  description: string;
  category: string;
  content?: string[];
  chapterFile?: string;
  pageCount?: number;
  animationPreset?: string;
  keywords: string;
  lang: string;
  episodeNumber?: number;
  seriesKey?: string;
};

async function getNovels(): Promise<Novel[]> {
  return fetchJson<Novel[]>(NOVELS_INDEX_PATH);
}

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const SPINE_PALETTE = [
  { bg: 'linear-gradient(180deg,#3b1f1a 0%,#2a1410 60%,#3b1f1a 100%)', accent: '#e6c98a' },
  { bg: 'linear-gradient(180deg,#1f2a3b 0%,#0f1828 60%,#1f2a3b 100%)', accent: '#cfa86b' },
  { bg: 'linear-gradient(180deg,#2c2419 0%,#1a140b 60%,#2c2419 100%)', accent: '#d6b573' },
  { bg: 'linear-gradient(180deg,#3b2a1f 0%,#241710 60%,#3b2a1f 100%)', accent: '#c89d5e' },
  { bg: 'linear-gradient(180deg,#1f3b33 0%,#0f1f1a 60%,#1f3b33 100%)', accent: '#dcb96f' },
  { bg: 'linear-gradient(180deg,#2a1f3b 0%,#150f24 60%,#2a1f3b 100%)', accent: '#d8b264' },
];

const NovelsPage = async (props: Props) => {
  const { lang: rawLang } = await props.params;
  const routeLang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
  const dict = getDictionary(routeLang);
  const searchParams = await props.searchParams;
  const novels = await getNovels();

  const lang = (searchParams.lang as string) || routeLang;
  const category = (searchParams.category as string) || 'all';
  const q = ((searchParams.q as string) || '').trim();

  const allCategories = Array.from(new Set(novels.map((n) => n.category))).sort();

  let filtered = novels;
  if (lang !== 'all') {
    filtered = filtered.filter((n) => n.lang === lang);
  }
  if (category !== 'all') {
    filtered = filtered.filter((n) => n.category === category);
  }
  if (q) {
    const needle = q.toLowerCase();
    filtered = filtered.filter((n) =>
      n.title.toLowerCase().includes(needle) ||
      n.description.toLowerCase().includes(needle) ||
      n.keywords.toLowerCase().includes(needle)
    );
  }

  // Group by category for shelf-style display
  const grouped = new Map<string, Novel[]>();
  for (const n of filtered) {
    if (!grouped.has(n.category)) grouped.set(n.category, []);
    grouped.get(n.category)!.push(n);
  }
  // Sort within each group by episodeNumber
  for (const [, list] of grouped) {
    list.sort((a, b) => (a.episodeNumber ?? 0) - (b.episodeNumber ?? 0));
  }

  const buildHref = (next: Partial<{ lang: string; category: string; q: string }>) => {
    const params = new URLSearchParams();
    const nextLang = next.lang ?? lang;
    const nextCategory = next.category ?? category;
    const nextQ = next.q ?? q;

    if (nextLang !== 'all') params.set('lang', nextLang);
    if (nextCategory !== 'all') params.set('category', nextCategory);
    if (nextQ) params.set('q', nextQ);

    const qs = params.toString();
    const base = localizePath('/novels', routeLang);
    return qs ? `${base}?${qs}` : base;
  };

  return (
    <main className="relative min-h-screen text-amber-50 overflow-x-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(900px 600px at 50% 0%, rgba(217,164,97,0.12), transparent 70%), linear-gradient(180deg, #0a0807 0%, #100b0a 50%, #0a0807 100%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] mix-blend-soft-light"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,220,170,0.6) 1px, transparent 1px)',
            backgroundSize: '3px 3px',
          }}
        />
      </div>

      <header className="px-4 pt-16 pb-12">
        <div className="max-w-5xl mx-auto text-center">
          <p className="font-serif tracking-[0.4em] text-amber-200/70 text-[11px] uppercase">
            Garoop Bunko · 書架
          </p>
          <Link href={localizePath('/', routeLang)}>
            <h1 className="mt-4 font-serif text-4xl sm:text-5xl text-amber-50 hover:text-amber-200 transition-colors">
              {dict.sections.latest_news.title}
            </h1>
          </Link>
          <div className="mx-auto my-5 flex items-center justify-center gap-3 text-amber-200/50">
            <span className="block h-px w-16 bg-amber-200/30" />
            <span className="text-sm">❦</span>
            <span className="block h-px w-16 bg-amber-200/30" />
          </div>
          <p className="font-serif text-amber-50/70 max-w-xl mx-auto leading-loose text-sm">
            人物列伝と長崎物語。坂と海と、誰かの机の灯りから生まれた小説たちを、夜の文庫に並べました。
          </p>
        </div>

        {/* Search */}
        <form
          method="GET"
          className="mt-10 max-w-2xl mx-auto flex items-center gap-2 flex-wrap justify-center"
        >
          {lang !== 'all' && <input type="hidden" name="lang" value={lang} />}
          {category !== 'all' && <input type="hidden" name="category" value={category} />}

          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="作品名・キーワードで探す"
            className="w-72 md:w-96 px-4 py-2.5 rounded-md bg-stone-900/60 border border-amber-200/20 text-amber-50 placeholder-amber-50/40 font-serif focus:outline-none focus:ring-1 focus:ring-amber-300/60 focus:border-amber-200/40"
            aria-label="Search by title"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-md bg-amber-300 text-stone-900 font-serif font-bold hover:bg-amber-200 transition"
          >
            探す
          </button>
          {q && (
            <Link
              href={buildHref({ q: '' })}
              className="px-3 py-2.5 rounded-md bg-stone-900/40 border border-amber-200/15 hover:bg-stone-900/60 text-amber-50/80 font-serif text-sm"
            >
              クリア
            </Link>
          )}
        </form>

        {/* Filters */}
        <div className="mt-6 max-w-5xl mx-auto">
          <div className="flex justify-center gap-2 flex-wrap">
            <Link
              href={buildHref({ category: 'all' })}
              className={`px-4 py-1.5 rounded-full text-xs font-serif tracking-wider border transition ${category === 'all'
                ? 'bg-amber-300 text-stone-900 border-amber-200'
                : 'bg-stone-900/40 border-amber-200/20 text-amber-50/80 hover:bg-stone-900/60'
                }`}
            >
              すべての書架
            </Link>
            {allCategories.map((cat) => (
              <Link
                key={cat}
                href={buildHref({ category: cat })}
                className={`px-4 py-1.5 rounded-full text-xs font-serif tracking-wider border transition ${category === cat
                  ? 'bg-amber-300 text-stone-900 border-amber-200'
                  : 'bg-stone-900/40 border-amber-200/20 text-amber-50/80 hover:bg-stone-900/60'
                  }`}
              >
                {cat}
              </Link>
            ))}
          </div>

          <div className="mt-4 flex justify-center gap-2 flex-wrap text-xs">
            {locales.map((locale) => (
              <Link
                key={locale}
                href={buildHref({ lang: locale })}
                className={`px-3 py-1 rounded-md font-serif border transition ${lang === locale
                  ? 'bg-stone-100/15 border-amber-200/40 text-amber-50'
                  : 'bg-transparent border-amber-200/10 text-amber-50/60 hover:bg-stone-900/40'
                  }`}
              >
                {localeMeta[locale].flag} {localeMeta[locale].label}
              </Link>
            ))}
            <Link
              href={buildHref({ lang: 'all' })}
              className={`px-3 py-1 rounded-md font-serif border transition ${lang === 'all'
                ? 'bg-stone-100/15 border-amber-200/40 text-amber-50'
                : 'bg-transparent border-amber-200/10 text-amber-50/60 hover:bg-stone-900/40'
                }`}
            >
              All
            </Link>
          </div>
        </div>
      </header>

      <section className="px-4 pb-24 max-w-7xl mx-auto">
        {filtered.length === 0 ? (
          <div className="text-center text-amber-50/60 font-serif py-20">
            条件に一致する書物がまだありません。書架を別の角度から眺めてみてください。
          </div>
        ) : (
          Array.from(grouped.entries()).map(([cat, list]) => (
            <div key={cat} className="mb-16">
              <div className="flex items-baseline justify-between mb-5 border-b border-amber-200/15 pb-3">
                <h2 className="font-serif text-2xl text-amber-50 tracking-wider">{cat}</h2>
                <span className="font-serif text-xs text-amber-200/60 tracking-[0.25em] uppercase">
                  {list.length} 巻
                </span>
              </div>

              {/* Shelf */}
              <div
                className="relative rounded-[10px] p-4 sm:p-6"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(60,38,22,0.5) 0%, rgba(34,21,12,0.65) 100%)',
                  boxShadow:
                    'inset 0 0 0 1px rgba(217,180,120,0.18), 0 25px 40px -20px rgba(0,0,0,0.6)',
                }}
              >
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
                  {list.map((novel, i) => {
                    const palette = SPINE_PALETTE[i % SPINE_PALETTE.length];
                    return (
                      <Link
                        href={localizePath(`/novels/${novel.id}`, routeLang)}
                        key={`${novel.id}-${novel.lang}`}
                        className="group relative h-[260px] sm:h-[300px] rounded-[3px] overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:rotate-[-1deg]"
                        style={{
                          background: palette.bg,
                          boxShadow:
                            '0 16px 28px -12px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,220,170,0.08), inset 4px 0 8px rgba(0,0,0,0.4), inset -4px 0 8px rgba(0,0,0,0.4)',
                        }}
                      >
                        <div className="absolute top-3 left-3 right-3 h-px" style={{ backgroundColor: palette.accent, opacity: 0.5 }} />
                        <div className="absolute bottom-3 left-3 right-3 h-px" style={{ backgroundColor: palette.accent, opacity: 0.5 }} />

                        <div
                          className="absolute inset-0 flex flex-col items-center justify-between py-6 px-2 text-center"
                          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                        >
                          <span className="font-serif text-[9px] tracking-[0.25em] uppercase" style={{ color: palette.accent, opacity: 0.85 }}>
                            {novel.episodeNumber ? `第${novel.episodeNumber}巻` : novel.lang.toUpperCase()}
                          </span>
                          <h3 className="font-serif text-[13px] sm:text-sm leading-tight px-1 line-clamp-[10]" style={{ color: '#f5e9c8' }}>
                            {novel.title}
                          </h3>
                          <span className="font-serif text-[9px] tracking-widest" style={{ color: palette.accent, opacity: 0.7 }}>
                            Garoop 文庫
                          </span>
                        </div>

                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                          style={{ background: 'linear-gradient(135deg, rgba(255,235,180,0.10) 0%, transparent 50%)' }}
                        />
                      </Link>
                    );
                  })}
                </div>
                <div
                  className="mt-4 h-3 rounded"
                  style={{
                    background: 'linear-gradient(180deg, #3b2418 0%, #1f140c 100%)',
                    boxShadow: '0 6px 14px rgba(0,0,0,0.6)',
                  }}
                />
              </div>

              {/* Synopsis cards beneath each shelf */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {list.map((novel) => (
                  <Link
                    href={localizePath(`/novels/${novel.id}`, routeLang)}
                    key={`syn-${novel.id}-${novel.lang}`}
                    className="group block"
                  >
                    <article
                      className="relative h-full rounded-[6px] p-5 transition-all duration-300 hover:-translate-y-0.5"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(245,228,191,0.04) 0%, rgba(245,228,191,0.01) 100%)',
                        boxShadow:
                          'inset 0 0 0 1px rgba(217,180,120,0.16)',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-serif text-amber-200/70 text-[11px] tracking-[0.25em] uppercase mt-1">
                          {novel.episodeNumber ? `Vol.${String(novel.episodeNumber).padStart(2, '0')}` : '—'}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-serif text-base sm:text-lg text-amber-50 leading-snug group-hover:text-amber-200 transition-colors">
                            {novel.title}
                          </h3>
                          <p className="mt-2 font-serif text-sm leading-loose text-amber-50/70 line-clamp-3">
                            {novel.description}
                          </p>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
};

export default NovelsPage;
