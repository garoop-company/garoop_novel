import { notFound } from 'next/navigation';
import { promises as fs } from 'fs';
import path from 'path';
import ClientNovelView from './ClientNovelView';
import Footer from '@/components/Footer';
import { locales, Locale } from '@/locales';

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
  const fileContents = await fs.readFile(path.join(jsonDirectory, 'novels.json'), 'utf8');
  return JSON.parse(fileContents);
}

async function getNovelById(id: string): Promise<Novel | undefined> {
  const novels = await getNovels();
  return novels.find((n) => n.id === id);
}

// 事前ビルド対象
export async function generateStaticParams() {
  const novels = await getNovels();
  const params = [];
  for (const lang of locales) {
    for (const n of novels) {
      params.push({ lang, id: n.id });
    }
  }
  return params;
}

import { generateLocalizedMetadata, SITE_URL } from '@/lib/seo';

// Headではなくmetadata APIを推奨
export async function generateMetadata(props: {
  params: Promise<{ id: string; lang: string }>;
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const { id, lang: rawLang } = await props.params;
  const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
  const searchParams = await props.searchParams;
  const novel = await getNovelById(id);
  if (!novel) return {};

  const raw = searchParams.page ? parseInt(searchParams.page as string, 10) : 1;
  const page = Number.isNaN(raw) || raw < 1 ? 1 : Math.min(raw, novel.content.length);

  const title = `${novel.title}${novel.content.length > 1 ? ` - Page ${page}` : ''} | ${novel.category}`;
  const description = novel.description?.slice(0, 160) ?? novel.title;

  return generateLocalizedMetadata({
    title,
    description,
    lang,
    path: `/novels/${novel.id}`,
    type: 'article',
    page,
  });
}

type Props = {
  params: Promise<{ id: string; lang: string }>;
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
};

export default async function Page(props: Props) {
  const { id, lang: rawLang } = await props.params;
  const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
  const searchParams = await props.searchParams;
  const novel = await getNovelById(id);
  if (!novel) notFound();

  let page = searchParams.page ? parseInt(searchParams.page as string, 10) : 1;
  if (isNaN(page) || page < 1) page = 1;
  if (page > novel.content.length) page = novel.content.length;

  const canonical = `${SITE_URL}/${lang}/novels/${novel.id}${page > 1 ? `?page=${page}` : ''}`;

  // Prev / Next（複数ページ記事向け：クロール導線を明確化）
  const prevHref = page > 1 ? `${SITE_URL}/${lang}/novels/${novel.id}?page=${page - 1}` : null;
  const nextHref = page < novel.content.length ? `${SITE_URL}/${lang}/novels/${novel.id}?page=${page + 1}` : null;

  // JSON-LD（Article + BreadcrumbList + WebSite/Organization）
  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": novel.title,
    "inLanguage": novel.lang === "ja" ? "ja-JP" : "en-US",
    "articleSection": novel.category,
    "keywords": novel.keywords,
    "description": novel.description,
    "url": canonical,
    "isPartOf": { "@type": "WebSite", "name": "Garuchan Land", "url": SITE_URL },
    "author": { "@type": "Person", "name": "山下大貴" },
    "publisher": {
      "@type": "Organization",
      "name": "Garoop株式会社",
      "url": SITE_URL,
      "logo": { "@type": "ImageObject", "url": `${SITE_URL}/images/garuchan_island_map.png` }
    },
    "mainEntityOfPage": canonical,
    "articleBody": novel.content.join("\n\n")
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Novels", "item": `${SITE_URL}/${lang}/novels` },
      { "@type": "ListItem", "position": 3, "name": novel.title, "item": canonical }
    ]
  };

  const jsonLdWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Garuchan Land",
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}/${lang}/novels/list?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  // AIアシスタント向け “speakable”（記事の要約見出しを音声読み上げ対象に）
  const jsonLdSpeakable = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": canonical,
    "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", "meta[name='description']"] }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center p-4 sm:p-8 relative overflow-hidden">
      {/* Prev/Next/Canonical 明示（head要素にリンク出力） */}
      <link rel="canonical" href={canonical} />
      {prevHref && <link rel="prev" href={prevHref} />}
      {nextHref && <link rel="next" href={nextHref} />}

      {/* JSON-LD（複数投入OK） */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSpeakable) }} />

      <ClientNovelView
        novelId={novel.id}
        title={novel.title}
        category={novel.category}
        content={novel.content}
        page={page}
        lang={novel.lang}   // ← 渡す
      />
      <Footer lang={lang} />
    </div>
  );
}