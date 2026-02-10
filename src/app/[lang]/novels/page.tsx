import { locales, Locale, getDictionary } from '@/locales';
import { generateLocalizedMetadata } from '@/lib/seo';

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
import { promises as fs } from 'fs';
import path from 'path';
import GaLink from '@/components/GaLink';

type Novel = {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string[];
  keywords: string;
  lang: string;
};

async function getNovels(): Promise<Novel[]> {
  const jsonDirectory = path.join(process.cwd(), 'src', 'data');
  const fileContents = await fs.readFile(
    path.join(jsonDirectory, 'novels.json'),
    'utf8'
  );
  return JSON.parse(fileContents);
}

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const NovelsPage = async (props: Props) => {
  const { lang: rawLang } = await props.params;
  const routeLang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
  const searchParams = await props.searchParams;
  const novels = await getNovels();

  // クエリ取得
  const lang = (searchParams.lang as string) || routeLang;
  const category = (searchParams.category as string) || 'all';
  const q = ((searchParams.q as string) || '').trim(); // タイトル検索

  // 全カテゴリ一覧（表示用）
  const allCategories = Array.from(new Set(novels.map((n) => n.category))).sort();

  // フィルタリング
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

  // 現在のクエリを保ったままパラメータを差し替えるユーティリティ
  const buildHref = (next: Partial<{ lang: string; category: string; q: string }>) => {
    const params = new URLSearchParams();
    const nextLang = next.lang ?? lang;
    const nextCategory = next.category ?? category;
    const nextQ = next.q ?? q;

    if (nextLang !== 'all') params.set('lang', nextLang);
    if (nextCategory !== 'all') params.set('category', nextCategory);
    if (nextQ) params.set('q', nextQ);

    const qs = params.toString();
    return qs ? `/${routeLang}/novels?${qs}` : `/${routeLang}/novels`;
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8">
      <header className="text-center mb-10">
        <Link href="/">
          <h1 className="text-5xl font-bold font-serif cursor-pointer hover:text-amber-300 transition-colors">
            Library of Whispers
          </h1>
        </Link>
        <p className="text-lg text-slate-400 mt-2">Choose your poison.</p>

        {/* 新しいコンテンツへのリンク */}
        <div className="mt-6 flex justify-center gap-4">
          <GaLink
            href="/videos"
            eventParams={{
              cta_label: "watch_videos",
              cta_location: "novels_header",
              cta_target: "/videos",
            }}
            className="px-6 py-3 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 transition"
          >
            動画を見る
          </GaLink>
        </div>

        {/* タイトル検索フォーム（GETでクエリを保つ） */}
        <form
          method="GET"
          className="mt-6 flex items-center justify-center gap-2 flex-wrap"
        >
          {/* 既存フィルタを保持 */}
          {lang !== 'all' && <input type="hidden" name="lang" value={lang} />}
          {category !== 'all' && <input type="hidden" name="category" value={category} />}

          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by title..."
            className="w-72 md:w-96 px-4 py-2 rounded bg-slate-900 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
            aria-label="Search by title"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
          >
            Search
          </button>
          {q && (
            <Link
              href={buildHref({ q: '' })}
              className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700"
              aria-label="Clear title search"
            >
              Clear Title
            </Link>
          )}
        </form>

        {/* 言語切り替え */}
        <div className="mt-6 flex justify-center gap-3 flex-wrap">
          <Link
            href={buildHref({ lang: 'en' })}
            className={`px-4 py-2 rounded ${lang === 'en' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700'
              }`}
          >
            English
          </Link>
          <Link
            href={buildHref({ lang: 'ja' })}
            className={`px-4 py-2 rounded ${lang === 'ja' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700'
              }`}
          >
            日本語
          </Link>
          <Link
            href={buildHref({ lang: 'all' })}
            className={`px-4 py-2 rounded ${lang === 'all' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700'
              }`}
          >
            All Languages
          </Link>
        </div>

        {/* カテゴリパネル */}
        <div className="mt-5">
          <div className="text-sm text-slate-400 mb-2">Categories</div>
          <div className="flex justify-center gap-2 flex-wrap">
            <Link
              href={buildHref({ category: 'all' })}
              className={`px-3 py-1.5 rounded-full text-sm border ${category === 'all'
                ? 'bg-teal-500 text-slate-950 border-teal-400'
                : 'bg-slate-900 border-slate-700 hover:bg-slate-800'
                }`}
            >
              All
            </Link>
            {allCategories.map((cat) => (
              <Link
                key={cat}
                href={buildHref({ category: cat })}
                className={`px-3 py-1.5 rounded-full text-sm border ${category === cat
                  ? 'bg-teal-500 text-slate-950 border-teal-400'
                  : 'bg-slate-900 border-slate-700 hover:bg-slate-800'
                  }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* 現在のフィルタ表示（クリア導線付き） */}
        <div className="mt-4 text-sm text-slate-400">
          <span>
            Filter: <span className="text-slate-200">lang = {lang}</span>,{' '}
            <span className="text-slate-200">category = {category}</span>
            {q && (
              <>
                , <span className="text-slate-200">title ~ {q}</span>
              </>
            )}
          </span>
          <Link
            href="/novels"
            className="ml-3 text-amber-300 hover:underline"
            aria-label="Clear filters"
          >
            Clear All
          </Link>
        </div>
      </header>

      {/* 小説リスト */}
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center text-slate-400">
            条件に一致する作品がありません。フィルタを変更してください。
          </div>
        ) : (
          filtered.map((novel) => (
            <Link
              href={`/novels/${novel.id}`}
              key={`${novel.id}-${novel.lang}`}
              className="p-6 bg-slate-900/70 rounded-lg border border-slate-800 hover:bg-slate-800 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-amber-900/30 h-full flex flex-col"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${novel.category === 'Horror'
                      ? 'bg-amber-500/15 text-amber-300'
                      : 'bg-teal-500/15 text-teal-300'
                      }`}
                  >
                    {novel.category}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                    {novel.lang.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold font-serif text-white">
                  {novel.title}
                </h2>
                <p className="text-slate-400 flex-grow">{novel.description}</p>
              </div>
            </Link>
          ))
        )}
      </main>

    </div>
  );
};

export default NovelsPage;
