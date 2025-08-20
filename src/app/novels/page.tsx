import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';

type Novel = {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string[];
};

async function getNovels(): Promise<Novel[]> {
  const jsonDirectory = path.join(process.cwd(), 'src', 'data');
  const fileContents = await fs.readFile(path.join(jsonDirectory, 'novels.json'), 'utf8');
  return JSON.parse(fileContents);
}

const NovelsPage = async () => {
  const novels = await getNovels();

  return (
    <div className="bg-gray-900 min-h-screen text-white p-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold font-serif">Library of Whispers</h1>
        <p className="text-lg text-gray-400 mt-2">Choose your poison.</p>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {novels.map((novel) => (
          <Link href={`/novels/${novel.id}`} key={novel.id} className="block p-6 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-red-900/50 h-full flex flex-col">
            <div>
              <span className={`text-sm font-semibold mb-2 inline-block ${novel.category === 'Horror' ? 'text-red-400' : 'text-blue-400'}`}>
                {novel.category.toUpperCase()}
              </span>
              <h2 className="text-2xl font-bold mb-2 font-serif text-white">{novel.title}</h2>
              <p className="text-gray-400 flex-grow">{novel.description}</p>
            </div>
          </Link>
        ))}
      </main>
      <footer className="text-center mt-12">
        <Link href="/" className="text-red-500 hover:underline">
          &larr; Back to the Entrance
        </Link>
      </footer>
    </div>
  );
};

export default NovelsPage;
