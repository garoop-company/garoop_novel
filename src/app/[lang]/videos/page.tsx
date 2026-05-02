import Link from 'next/link';
import GaLink from '@/components/GaLink';
import { fetchJson, VIDEOS_INDEX_PATH } from '@/lib/data-source';

type Video = {
  id: string;
  videoId: string;
  title: string;
  description: string;
};

async function getVideos(): Promise<Video[]> {
  return fetchJson<Video[]>(VIDEOS_INDEX_PATH);
}

const VideosPage = async () => {
  const videos = await getVideos();

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 p-8">
      <header className="text-center mb-10">
        <Link href="/">
          <h1 className="text-5xl font-bold font-serif cursor-pointer hover:text-amber-300 transition-colors">
            Featured Videos
          </h1>
        </Link>
        <p className="text-lg text-slate-400 mt-2">
          厳選された動画コンテンツをお楽しみください。
        </p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-slate-900/70 rounded-lg border border-slate-800 overflow-hidden shadow-lg hover:shadow-amber-900/40 transition-shadow duration-300"
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
              <p className="text-slate-400">{video.description}</p>
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
          className="text-amber-300 hover:underline"
        >
          トップページへ戻る
        </GaLink>
      </footer>
    </div>
  );
};

export default VideosPage;
