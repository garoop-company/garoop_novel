import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';
import Footer from '../components/Footer';

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
  searchParams: { [key: string]: string | string[] | undefined };
};

const NovelsPage = async ({ searchParams }: Props) => {
  const novels = await getNovels();

  // クエリ取得
  const lang = (searchParams.lang as string) || 'all';
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
    return qs ? `/novels?${qs}` : `/novels`;
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white p-8">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-bold font-serif">Library of Whispers</h1>
        <p className="text-lg text-gray-400 mt-2">Choose your poison.</p>

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
            className="w-72 md:w-96 px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Search by title"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 transition"
          >
            Search
          </button>
          {q && (
            <Link
              href={buildHref({ q: '' })}
              className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600"
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
            className={`px-4 py-2 rounded ${lang === 'en' ? 'bg-red-500 text-white' : 'bg-gray-700 hover:bg-gray-600'
              }`}
          >
            English
          </Link>
          <Link
            href={buildHref({ lang: 'ja' })}
            className={`px-4 py-2 rounded ${lang === 'ja' ? 'bg-red-500 text-white' : 'bg-gray-700 hover:bg-gray-600'
              }`}
          >
            日本語
          </Link>
          <Link
            href={buildHref({ lang: 'all' })}
            className={`px-4 py-2 rounded ${lang === 'all' ? 'bg-red-500 text-white' : 'bg-gray-700 hover:bg-gray-600'
              }`}
          >
            All Languages
          </Link>
        </div>

        {/* カテゴリパネル */}
        <div className="mt-5">
          <div className="text-sm text-gray-400 mb-2">Categories</div>
          <div className="flex justify-center gap-2 flex-wrap">
            <Link
              href={buildHref({ category: 'all' })}
              className={`px-3 py-1.5 rounded-full text-sm border ${category === 'all'
                  ? 'bg-blue-500 text-white border-blue-400'
                  : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
                }`}
            >
              All
            </Link>
            {allCategories.map((cat) => (
              <Link
                key={cat}
                href={buildHref({ category: cat })}
                className={`px-3 py-1.5 rounded-full text-sm border ${category === cat
                    ? 'bg-blue-500 text-white border-blue-400'
                    : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
                  }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* 現在のフィルタ表示（クリア導線付き） */}
        <div className="mt-4 text-sm text-gray-400">
          <span>
            Filter: <span className="text-gray-200">lang = {lang}</span>,{' '}
            <span className="text-gray-200">category = {category}</span>
            {q && (
              <>
                , <span className="text-gray-200">title ~ "{q}"</span>
              </>
            )}
          </span>
          <Link
            href="/novels"
            className="ml-3 text-pink-400 hover:underline"
            aria-label="Clear filters"
          >
            Clear All
          </Link>
        </div>
      </header>

      {/* 小説リスト */}
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center text-gray-400">
            条件に一致する作品がありません。フィルタを変更してください。
          </div>
        ) : (
          filtered.map((novel) => (
            <Link
              href={`/novels/${novel.id}`}
              key={novel.id}
              className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-red-900/50 h-full flex flex-col"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${novel.category === 'Horror'
                        ? 'bg-red-900/40 text-red-300'
                        : 'bg-blue-900/40 text-blue-300'
                      }`}
                  >
                    {novel.category}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-gray-700 text-gray-200">
                    {novel.lang.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold font-serif text-white">
                  {novel.title}
                </h2>
                <p className="text-gray-400 flex-grow">{novel.description}</p>
              </div>
            </Link>
          ))
        )}
      </main>

      <Footer />
    </div>
  );
};

export default NovelsPage;
