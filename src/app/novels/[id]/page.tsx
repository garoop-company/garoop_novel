import { notFound } from 'next/navigation';
import { promises as fs } from 'fs';
import path from 'path';
import ClientNovelView from './ClientNovelView';
import Footer from '@/app/components/Footer';

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
  return novels.map((n) => ({ id: n.id }));
}

// Headではなくmetadata APIを推奨
export async function generateMetadata({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  const novel = await getNovelById(params.id);
  if (!novel) return {};

  const raw = searchParams.page ? parseInt(searchParams.page as string, 10) : 1;
  const page = Number.isNaN(raw) || raw < 1 ? 1 : Math.min(raw, novel.content.length);

  const title = `${novel.title}${novel.content.length > 1 ? ` - Page ${page}` : ''} | ${novel.category}`;
  const description = novel.description?.slice(0, 160) ?? novel.title;

  return {
    title,
    description,
    keywords: novel.keywords,
    alternates: { canonical: `/novels/${novel.id}${page > 1 ? `?page=${page}` : ''}` },
    other: { 'content-language': novel.lang },
    openGraph: {
      title,
      description,
      type: 'article',
      locale: novel.lang === 'ja' ? 'ja_JP' : 'en_US',
      url: `/novels/${novel.id}${page > 1 ? `?page=${page}` : ''}`,
      siteName: 'Garoop Novels',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

type Props = { params: { id: string }; searchParams: { [k: string]: string | string[] | undefined } };

export default async function Page({ params, searchParams }: Props) {
  const novel = await getNovelById(params.id);
  if (!novel) notFound();

  let page = searchParams.page ? parseInt(searchParams.page as string, 10) : 1;
  if (isNaN(page) || page < 1) page = 1;
  if (page > novel.content.length) page = novel.content.length;

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center p-4 sm:p-8 relative overflow-hidden">
      <ClientNovelView
        novelId={novel.id}
        title={novel.title}
        category={novel.category}
        content={novel.content}
        page={page}
        lang={novel.lang}   // ← 渡す
      />
      <Footer />
    </div>
  );
}