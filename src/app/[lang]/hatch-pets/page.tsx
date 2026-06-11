import { locales, Locale } from '@/locales';
import { generateLocalizedMetadata } from '@/lib/seo';
import { fetchHatchPetIndex, type HatchPetIndexEntry } from '@/lib/hatch-pets';
import HatchPetSelector from '@/components/hatch-pet/HatchPetSelector';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
  return generateLocalizedMetadata({
    title: 'ハッチペット ── 動くなかまたち | Garoop Novel',
    description:
      'ガルちゃんたち Hatch Pet が動き出す。好きなペットを選んで、待機・ジャンプ・手をふる・おしごと…いろんな動きを楽しめるアニメーション図鑑。',
    lang,
    path: '/hatch-pets',
    image: '/images/dramas/garuchan/portrait.png',
  });
}

type Props = { params: Promise<{ lang: string }> };

export default async function HatchPetsPage(props: Props) {
  await props.params;

  // 一覧は SSR で先読み（失敗してもクライアント側 hook が再取得する）
  let initialPets: HatchPetIndexEntry[] = [];
  try {
    initialPets = await fetchHatchPetIndex();
  } catch {
    initialPets = [];
  }

  return (
    <main className="relative min-h-screen text-amber-50">
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(900px 600px at 50% 0%, rgba(245,158,11,0.14), transparent 70%), linear-gradient(180deg, #08070a 0%, #0d0a12 50%, #08070a 100%)',
          }}
        />
      </div>

      <header className="px-4 pt-14 pb-8 text-center">
        <p className="font-serif tracking-[0.4em] text-amber-200/70 text-[11px] uppercase">
          Garoop · Hatch Pets
        </p>
        <h1 className="mt-3 font-serif text-3xl sm:text-5xl text-amber-50">ハッチペット図鑑</h1>
        <p className="mt-4 font-serif text-amber-50/70 max-w-xl mx-auto leading-loose text-sm">
          ガルちゃんたち、動くなかまたち。
          ペットを選んで、いろんな動き（状態）に切り替えてあそべます。
        </p>
      </header>

      <section className="px-4 pb-24 max-w-4xl mx-auto">
        <HatchPetSelector initialPets={initialPets} defaultPetId="garuchan-spy" />
      </section>
    </main>
  );
}
