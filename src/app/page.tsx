import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-8">
      <div className="text-center z-10">
        <h1 className="text-5xl font-bold mb-4 font-serif">Tales of Shadow and Cipher</h1>
        <p className="text-lg text-gray-400 mb-8">
          Where secrets lurk in every corner and darkness holds the truth.
        </p>
      </div>

      <div className="mb-8 z-10">
        <Image
          src="https://placehold.co/400/000000/FFFFFF?text=?"
          alt="Mysterious Character"
          width={400}
          height={600}
          className="rounded-lg shadow-2xl shadow-red-900/50"
          style={{ height: 'auto' }}
        />
      </div>

      <Link
        href="/novels"
        className="px-8 py-4 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 transition-colors duration-300 text-xl z-10"
      >
        Enter the Shadows
      </Link>
    </main>
  );
}
