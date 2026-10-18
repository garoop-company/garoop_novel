import { locales, Locale, localeMeta, getDictionary } from '@/locales';
import { generateLocalizedMetadata } from '@/lib/seo';
import { localizePath } from '@/lib/locale-path';

export async function generateMetadata({ params, searchParams }: Props) {
  const { lang: rawLang } = await params;
  const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
  const dict = getDictionary(lang);
  const sp = await searchParams;
  const page = parsePage(sp.page);
  // 絞り込み（lang/category/q）付きの一覧は 1 ページ目の素の一覧を canonical にする
  const filtered = Boolean(sp.lang || sp.category || sp.q);
  return generateLocalizedMetadata({
    title: `${dict.sections.latest_news.title}${page > 1 ? ` (${page})` : ''} | Garoop Novel`,
    description: dict.sections.latest_news.subtitle,
    lang,
    path: '/novels',
    page: filtered ? undefined : page,
  });
}
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Pager from '@/components/Pager';
import { SITE_URL } from '@/lib/seo';

/** 1 ページに並べる冊数。NOVELS_PAGE_SIZE（サーバー側の環境変数）で上書きできる（E2E でページ送りを確かめる用） */
const PAGE_SIZE = (() => {
  const n = parseInt(process.env.NOVELS_PAGE_SIZE ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : 24;
})();

function parsePage(raw: string | string[] | undefined): number {
  const n = parseInt(String(Array.isArray(raw) ? raw[0] : raw ?? '1'), 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}
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

// 背表紙の色は globals.css の .novel-spine-0〜5 に定義（インライン style の重複で HTML が膨らまないように）
const SPINE_VARIANTS = 6;

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
  const allGrouped = new Map<string, Novel[]>();
  for (const n of filtered) {
    if (!allGrouped.has(n.category)) allGrouped.set(n.category, []);
    allGrouped.get(n.category)!.push(n);
  }
  // Sort within each group by episodeNumber
  for (const [, list] of allGrouped) {
    list.sort((a, b) => (a.episodeNumber ?? 0) - (b.episodeNumber ?? 0));
  }

  // 書架の並び順のままページ分割し、そのページ分だけを書架ごとにまとめ直す
  const ordered = Array.from(allGrouped.values()).flat();
  const totalPages = Math.max(1, Math.ceil(ordered.length / PAGE_SIZE));
  const page = parsePage(searchParams.page);
  if (page > totalPages) notFound();
  const pageItems = ordered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const grouped = new Map<string, Novel[]>();
  for (const n of pageItems) {
    if (!grouped.has(n.category)) grouped.set(n.category, []);
    grouped.get(n.category)!.push(n);
  }

  const buildHref = (next: Partial<{ lang: string; category: string; q: string; page: number }>) => {
    const params = new URLSearchParams();
    const nextLang = next.lang ?? lang;
    const nextCategory = next.category ?? category;
    const nextQ = next.q ?? q;

    // 言語の既定値はルートの言語。既定と同じなら付けない（'all' は明示しないと既定に戻ってしまうので付ける）
    if (nextLang !== routeLang) params.set('lang', nextLang);
    if (nextCategory !== 'all') params.set('category', nextCategory);
    if (nextQ) params.set('q', nextQ);
    // 絞り込みを変えたら 1 ページ目に戻る（page は明示したときだけ付ける）
    if (next.page && next.page > 1) params.set('page', String(next.page));

    const qs = params.toString();
    const base = localizePath('/novels', routeLang);
    return qs ? `${base}?${qs}` : base;
  };

  const pageHref = (p: number) => buildHref({ page: p });
  const absolute = (href: string) => `${SITE_URL}${href}`;

  return (
    <main className="relative min-h-screen text-amber-50 overflow-x-hidden">
      {/* ページ送りの前後関係（React が <head> に移す） */}
      {page > 1 && <link rel="prev" href={absolute(pageHref(page - 1))} />}
      {page < totalPages && <link rel="next" href={absolute(pageHref(page + 1))} />}
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
            十歳の起業家、軍隊式の合宿、緊迫の十分間、そしてカンガルーのガルちゃん。正しいことを、正しく行う人たちの小説を、夜の文庫に並べました。
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
                  {allGrouped.get(cat)?.length ?? list.length} 巻
                </span>
              </div>

              {/* Shelf */}
              <div className="novel-shelf relative rounded-[10px] p-4 sm:p-6">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
                  {list.map((novel, i) => (
                    <Link
                      href={localizePath(`/novels/${novel.id}`, routeLang)}
                      key={`${novel.id}-${novel.lang}`}
                      className={`novel-spine novel-spine-${i % SPINE_VARIANTS} group relative h-[260px] sm:h-[300px] rounded-[3px] overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:rotate-[-1deg]`}
                    >
                      <div className="novel-spine-rule top-3" />
                      <div className="novel-spine-rule bottom-3" />
                      <div className="novel-spine-body absolute inset-0 flex flex-col items-center justify-between py-6 px-2 text-center">
                        <span className="novel-spine-accent font-serif text-[9px] tracking-[0.25em] uppercase opacity-85">
                          {novel.episodeNumber ? `第${novel.episodeNumber}巻` : novel.lang.toUpperCase()}
                        </span>
                        <h3 className="novel-spine-title font-serif text-[13px] sm:text-sm leading-tight px-1 line-clamp-[10]">
                          {novel.title}
                        </h3>
                        <span className="novel-spine-accent font-serif text-[9px] tracking-widest opacity-70">
                          Garoop 文庫
                        </span>
                      </div>
                      <div className="novel-spine-shine absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </Link>
                  ))}
                </div>
                <div className="novel-shelf-board mt-4 h-3 rounded" />
              </div>

              {/* Synopsis cards beneath each shelf */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {list.map((novel) => (
                  <Link
                    href={localizePath(`/novels/${novel.id}`, routeLang)}
                    key={`syn-${novel.id}-${novel.lang}`}
                    className="group block"
                  >
                    <article className="novel-synopsis relative h-full rounded-[6px] p-5 transition-all duration-300 hover:-translate-y-0.5">
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
        <Pager current={page} total={totalPages} hrefFor={pageHref} labels={dict.pager} />
      </section>
    </main>
  );
};

export default NovelsPage;
