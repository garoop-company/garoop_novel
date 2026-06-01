import Link from 'next/link';
import Image from 'next/image';
import { locales, Locale } from '@/locales';
import { generateLocalizedMetadata } from '@/lib/seo';
import { localizePath } from '@/lib/locale-path';
import { getAllDramas } from '@/lib/dramas';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params;
  const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
  return generateLocalizedMetadata({
    title: 'ドラマ劇場 ── アニメで観るスパイ・サスペンス | Garoop Novel',
    description:
      'カンガルーのガルちゃんが主演する本格スパイ・ドラマ「スパイ・ガルーン」。動物たちが繰り広げる60分×8話のサスペンスを、アニメーションで再生して楽しめます。',
    lang,
    path: '/dramas',
  });
}

type Props = { params: Promise<{ lang: string }> };

export default async function DramasPage(props: Props) {
  const { lang: rawLang } = await props.params;
  const routeLang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
  const dramas = getAllDramas();

  return (
    <main className="relative min-h-screen text-amber-50 overflow-x-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(900px 600px at 50% 0%, rgba(245,158,11,0.14), transparent 70%), linear-gradient(180deg, #08070a 0%, #0d0a12 50%, #08070a 100%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05] mix-blend-soft-light"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,220,170,0.6) 1px, transparent 1px)',
            backgroundSize: '3px 3px',
          }}
        />
      </div>

      <header className="px-4 pt-16 pb-10 text-center">
        <p className="font-serif tracking-[0.4em] text-amber-200/70 text-[11px] uppercase">
          Garoop Drama Theater · 劇場
        </p>
        <h1 className="mt-4 font-serif text-4xl sm:text-5xl text-amber-50">ドラマ劇場</h1>
        <div className="mx-auto my-5 flex items-center justify-center gap-3 text-amber-200/50">
          <span className="block h-px w-16 bg-amber-200/30" />
          <span className="text-sm">🎬</span>
          <span className="block h-px w-16 bg-amber-200/30" />
        </div>
        <p className="font-serif text-amber-50/70 max-w-2xl mx-auto leading-loose text-sm">
          動物たちが演じる、アニメーション・ドラマの劇場。
          セリフが一行ずつ流れ、キャラクターが動き出す──
          再生ボタンを押して、物語を観てください。
        </p>
      </header>

      <section className="px-4 pb-24 max-w-5xl mx-auto space-y-16">
        {dramas.map((d) => {
          const cast = d.characters.filter((c) => c.role !== '端役');
          return (
            <article
              key={d.id}
              className="relative rounded-3xl overflow-hidden"
              style={{
                background:
                  'linear-gradient(160deg, rgba(245,228,191,0.05) 0%, rgba(20,16,26,0.6) 60%)',
                boxShadow: 'inset 0 0 0 1px rgba(217,180,120,0.18), 0 30px 60px -25px rgba(0,0,0,0.7)',
              }}
            >
              {/* Poster header */}
              <div className="grid md:grid-cols-[260px_1fr] gap-0">
                {/* Poster */}
                <Link
                  href={localizePath(`/dramas/${d.id}`, routeLang)}
                  className="group relative block min-h-[280px] overflow-hidden"
                  style={{
                    background:
                      `radial-gradient(120% 120% at 30% 20%, ${d.accent}33, transparent 60%), linear-gradient(180deg, #15101c 0%, #0a0810 100%)`,
                  }}
                >
                  <Image
                    src="/images/dramas/garuchan/portrait.png"
                    alt={d.seriesTitle}
                    width={260}
                    height={300}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[78%] max-w-[220px] object-contain drop-shadow-[0_18px_28px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-[1.03]"
                    priority
                  />
                  <span
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
                    style={{ background: `${d.accent}`, color: '#1a1206' }}
                  >
                    {d.genre}
                  </span>
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/55 text-amber-50 text-xs font-bold backdrop-blur border border-white/10">
                    ▶ 再生
                  </span>
                </Link>

                {/* Meta */}
                <div className="p-6 sm:p-8 flex flex-col">
                  <p className="font-serif text-amber-200/70 text-[11px] tracking-[0.3em] uppercase">
                    {d.enTitle}
                  </p>
                  <Link href={localizePath(`/dramas/${d.id}`, routeLang)}>
                    <h2 className="mt-2 font-serif text-2xl sm:text-3xl text-amber-50 leading-snug hover:text-amber-200 transition-colors">
                      {d.seriesTitle}
                    </h2>
                  </Link>
                  <p className="mt-3 font-serif italic text-amber-200/80 text-sm leading-relaxed">
                    「{d.tagline}」
                  </p>
                  <p className="mt-3 font-serif text-amber-50/70 text-sm leading-loose">
                    {d.logline}
                  </p>

                  {/* Cast row */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {cast.map((c) => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-serif border"
                        style={{
                          background: `${c.color}1a`,
                          borderColor: `${c.color}55`,
                          color: '#f5e9c8',
                        }}
                        title={c.role}
                      >
                        <span className="text-base leading-none">{c.emoji}</span>
                        {c.name}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center gap-4 text-amber-200/70 text-xs font-serif tracking-wider">
                    <span>📺 全{d.episodes.length}話</span>
                    <span>⏱ 各{d.runtimePerEpisode}分構成</span>
                    <span>🦘 主演 ガルちゃん</span>
                  </div>
                </div>
              </div>

              {/* Episode grid */}
              <div className="px-6 sm:px-8 pb-7">
                <div className="border-t border-amber-200/12 pt-5">
                  <p className="font-serif text-amber-200/60 text-[11px] tracking-[0.3em] uppercase mb-3">
                    Episodes
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {d.episodes.map((ep) => (
                      <Link
                        key={ep.number}
                        href={`${localizePath(`/dramas/${d.id}`, routeLang)}?ep=${ep.number}`}
                        className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-amber-300/[0.06] border border-transparent hover:border-amber-200/15"
                      >
                        <span
                          className="flex-shrink-0 w-9 h-9 rounded-lg grid place-items-center font-serif text-sm font-bold"
                          style={{ background: `${d.accent}22`, color: d.accent }}
                        >
                          {String(ep.number).padStart(2, '0')}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-serif text-amber-50 text-sm leading-snug group-hover:text-amber-200 transition-colors">
                            第{ep.number}話「{ep.title}」
                          </span>
                          <span className="block font-serif text-amber-50/55 text-[12px] leading-relaxed line-clamp-2 mt-0.5">
                            {ep.synopsis}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
