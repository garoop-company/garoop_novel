import { notFound } from 'next/navigation';
import { promises as fs } from 'fs';
import path from 'path';
import ClientNovelView from './ClientNovelView';
import { locales, Locale, localeMeta } from '@/locales';
import { localizePath } from '@/lib/locale-path';

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
  sourceVideoUrl?: string;
};

type ChapterPayload = {
  id: string;
  pages: string[];
};

async function getNovels(): Promise<Novel[]> {
  const jsonDirectory = path.join(process.cwd(), 'src', 'data');
  const fileContents = await fs.readFile(path.join(jsonDirectory, 'novels.json'), 'utf8');
  return JSON.parse(fileContents);
}

async function getNovelById(id: string, lang: string): Promise<Novel | undefined> {
  const novels = await getNovels();
  return novels.find((n) => n.id === id && n.lang === lang);
}

async function getNovelContent(novel: Novel): Promise<string[]> {
  if (Array.isArray(novel.content) && novel.content.length > 0) {
    return novel.content;
  }

  if (!novel.chapterFile) return [];
  const chapterPath = path.join(process.cwd(), 'src', 'data', 'chapters', novel.chapterFile);
  const chapterRaw = await fs.readFile(chapterPath, 'utf8');
  const chapter = JSON.parse(chapterRaw) as ChapterPayload;
  return Array.isArray(chapter.pages) ? chapter.pages : [];
}

// 事前ビルド対象
export async function generateStaticParams() {
  const novels = await getNovels();
  const params = [];
  for (const lang of locales) {
    for (const n of novels) {
      if (n.lang === lang) {
        params.push({ lang, id: n.id });
      }
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
  const novel = await getNovelById(id, lang);
  if (!novel) return {};
  const content = await getNovelContent(novel);

  const raw = searchParams.page ? parseInt(searchParams.page as string, 10) : 1;
  const page = Number.isNaN(raw) || raw < 1 ? 1 : Math.min(raw, content.length || 1);

  const title = `${novel.title}${content.length > 1 ? ` - Page ${page}` : ''} | ${novel.category}`;
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
  const novel = await getNovelById(id, lang);
  if (!novel) notFound();
  const content = await getNovelContent(novel);
  if (content.length === 0) notFound();

  let page = searchParams.page ? parseInt(searchParams.page as string, 10) : 1;
  if (isNaN(page) || page < 1) page = 1;
  if (page > content.length) page = content.length;

  const canonical = `${SITE_URL}${localizePath(`/novels/${novel.id}`, lang)}${page > 1 ? `?page=${page}` : ''}`;

  // Prev / Next（複数ページ記事向け：クロール導線を明確化）
  const prevHref = page > 1 ? `${SITE_URL}${localizePath(`/novels/${novel.id}`, lang)}?page=${page - 1}` : null;
  const nextHref = page < content.length ? `${SITE_URL}${localizePath(`/novels/${novel.id}`, lang)}?page=${page + 1}` : null;

  // JSON-LD（Article + BreadcrumbList + WebSite/Organization）
  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": novel.title,
    "inLanguage": localeMeta[lang].i18nTag,
    "articleSection": novel.category,
    "keywords": novel.keywords,
    "description": novel.description,
    "url": canonical,
    "isPartOf": { "@type": "WebSite", "name": "Garoop Novel", "url": SITE_URL },
    "author": {
      "@type": "Person",
      "name": "山下大貴",
      "jobTitle": "AI Content Creator",
      "url": "https://garoop.jp"
    },
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": "株式会社Garoop",
      "url": SITE_URL,
      "logo": { "@type": "ImageObject", "url": `${SITE_URL}/images/garoop_novel_background.png` }
    },
    "datePublished": "2024-01-01T00:00:00+09:00", // Placeholder if not in JSON
    "dateModified": new Date().toISOString(),
    "mainEntityOfPage": canonical,
    "articleBody": content.join("\n\n"),
    "isAccessibleForFree": true,
    "creativeWorkStatus": "Published",
    "genre": novel.category
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Novels", "item": `${SITE_URL}${localizePath('/novels', lang)}` },
      { "@type": "ListItem", "position": 3, "name": novel.title, "item": canonical }
    ]
  };

  const jsonLdWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Garoop Novel",
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}${localizePath('/novels', lang)}?q={search_term_string}`,
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
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col items-center p-4 sm:p-8 relative overflow-hidden">
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
        content={content}
        page={page}
        lang={novel.lang}
        animationPreset={novel.animationPreset}
        sourceVideoUrl={(novel as any).sourceVideoUrl} // Add cast or update type definition
      />
    </div>
  );
}
