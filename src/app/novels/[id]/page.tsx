import Link from 'next/link';
import { notFound } from 'next/navigation';
import { promises as fs } from 'fs';
import path from 'path';

type Novel = {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string[];
};

// This function tells Next.js which dynamic routes to pre-render at build time.
export async function generateStaticParams() {
  const jsonDirectory = path.join(process.cwd(), 'src', 'data');
  const fileContents = await fs.readFile(path.join(jsonDirectory, 'novels.json'), 'utf8');
  const novels: Novel[] = JSON.parse(fileContents);

  return novels.map((novel) => ({
    id: novel.id,
  }));
}

async function getNovelById(id: string): Promise<Novel | undefined> {
  const jsonDirectory = path.join(process.cwd(), 'src', 'data');
  const fileContents = await fs.readFile(path.join(jsonDirectory, 'novels.json'), 'utf8');
  const novels: Novel[] = JSON.parse(fileContents);
  return novels.find((novel) => novel.id === id);
}

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

const NovelDetailPage = async ({ params, searchParams }: Props) => {
  const novel = await getNovelById(params.id);

  if (!novel) {
    notFound();
  }

  let page = searchParams.page ? parseInt(searchParams.page as string, 10) : 1;
  // Ensure page is within valid range
  if (isNaN(page) || page < 1) {
    page = 1;
  }
  if (page > novel.content.length) {
    page = novel.content.length;
  }

  const pageIndex = page - 1;
  const currentPageContent = novel.content[pageIndex];
  const totalPages = novel.content.length;

  const hasNextPage = pageIndex < totalPages - 1;
  const hasPrevPage = pageIndex > 0;

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col items-center p-4 sm:p-8">
      <div className="max-w-4xl w-full bg-gray-800/50 rounded-lg shadow-lg p-4 sm:p-8">
        <header className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold font-serif">{novel.title}</h1>
          <p className={`text-md sm:text-lg mt-2 inline-block ${novel.category === 'Horror' ? 'text-red-400' : 'text-blue-400'}`}>
            {novel.category}
          </p>
        </header>

        <main className="bg-gray-900/70 p-6 sm:p-8 rounded-lg shadow-inner mb-6 min-h-[30vh] sm:min-h-[40vh] flex items-center">
          <p className="text-gray-300 leading-relaxed text-md sm:text-lg whitespace-pre-wrap w-full">
            {currentPageContent}
          </p>
        </main>

        <nav className="flex justify-between items-center">
          <div>
            {hasPrevPage ? (
              <Link href={`/novels/${novel.id}?page=${page - 1}`} className="px-4 py-2 sm:px-6 sm:py-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors text-sm sm:text-base">
                &larr; Previous
              </Link>
            ) : (
               <span className="px-4 py-2 sm:px-6 sm:py-2 bg-gray-800 text-gray-500 rounded cursor-not-allowed text-sm sm:text-base">&larr; Previous</span>
            )}
          </div>

          <div className="text-gray-400 text-sm sm:text-base">
            Page {page} of {totalPages}
          </div>

          <div>
            {hasNextPage ? (
              <Link href={`/novels/${novel.id}?page=${page + 1}`} className="px-4 py-2 sm:px-6 sm:py-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors text-sm sm:text-base">
                Next &rarr;
              </Link>
            ) : (
              <span className="px-4 py-2 sm:px-6 sm:py-2 bg-gray-800 text-gray-500 rounded cursor-not-allowed text-sm sm:text-base">Next &rarr;</span>
            )}
          </div>
        </nav>

        <footer className="text-center mt-8">
            <Link href="/novels" className="text-red-500 hover:underline">
              Back to Library
            </Link>
        </footer>
      </div>
    </div>
  );
};

export default NovelDetailPage;
