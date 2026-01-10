import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';
import GaLink from '@/components/GaLink';

type Video = {
  id: string;
  videoId: string;
  title: string;
  description: string;
};

async function getVideos(): Promise<Video[]> {
  const jsonDirectory = path.join(process.cwd(), 'src', 'data');
  const fileContents = await fs.readFile(
    path.join(jsonDirectory, 'videos.json'),
    'utf8'
  );
  return JSON.parse(fileContents);
}

const VideosPage = async () => {
  const videos = await getVideos();

  return (
    <div className="bg-gray-900 min-h-screen text-white p-8">
      <header className="text-center mb-10">
        <Link href="/">
          <h1 className="text-5xl font-bold font-serif cursor-pointer hover:text-pink-400 transition-colors">
            Featured Videos
          </h1>
        </Link>
        <p className="text-lg text-gray-400 mt-2">
          厳選された動画コンテンツをお楽しみください。
        </p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-lg hover:shadow-pink-900/50 transition-shadow duration-300"
          >
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={`https://www.youtube.com/embed/${video.videoId}`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold font-serif text-white mb-2">
                {video.title}
              </h2>
              <p className="text-gray-400">{video.description}</p>
            </div>
          </div>
        ))}
      </main>

      <footer className="text-center mt-12">
        <GaLink
          href="/"
          eventParams={{
            cta_label: "back_home",
            cta_location: "videos_footer",
            cta_target: "/",
          }}
          className="text-pink-400 hover:underline"
        >
          トップページへ戻る
        </GaLink>
      </footer>
    </div>
  );
};

export default VideosPage;
