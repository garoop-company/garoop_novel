import Link from 'next/link';
import { notFound } from 'next/navigation';
import { defaultLocale } from '@/locales';
import { REGIONS, prefecturesInRegion } from '@/lib/area/prefectures';
import { SERVICE_NAME, areaIndexJsonLd, areaPath, areaUrl } from '@/lib/area/content';
import { AreaBackdrop, Breadcrumbs, JsonLd, TopCta, areaMetadata, panelStyle } from './area-ui';

type Props = { params: Promise<{ lang: string }> };

// 地域ページは日本語のみ（/area）。他ロケールは 404。
export const dynamicParams = false;
export function generateStaticParams() {
    return [{ lang: defaultLocale }];
}

export async function generateMetadata({ params }: Props) {
    const { lang } = await params;
    if (lang !== defaultLocale) return {};
    return areaMetadata({
        title: `地域から探す｜${SERVICE_NAME}`,
        description: `${SERVICE_NAME}は、生成AIが綴る小説を読める文庫サイトです。北海道から沖縄まで47都道府県のどこからでも、スマホやパソコンのブラウザでオンラインで読めます。お住まいの地域のページから使い方を確認できます。`,
        url: areaUrl(),
    });
}

export default async function AreaIndexPage({ params }: Props) {
    const { lang } = await params;
    if (lang !== defaultLocale) notFound();

    return (
        <main className="relative min-h-screen px-4 pt-10 pb-20 font-sans text-amber-50 overflow-x-hidden">
            <AreaBackdrop />
            <JsonLd data={areaIndexJsonLd()} />
            <div className="container mx-auto max-w-5xl">
                <Breadcrumbs items={[{ name: 'トップ', href: '/' }, { name: '地域から探す' }]} />

                <header className="mt-8 text-center">
                    <h1 className="font-serif font-black text-3xl sm:text-5xl tracking-[0.04em] text-amber-50">
                        地域から探す
                    </h1>
                    <p className="mt-6 font-serif text-base sm:text-lg leading-loose text-amber-50/85 max-w-2xl mx-auto">
                        {SERVICE_NAME}は、生成AIが綴る小説を読める文庫サイトです。47都道府県のどこからでも、スマホやパソコンのブラウザでオンラインで読めます。
                    </p>
                    <div className="mt-8">
                        <TopCta />
                    </div>
                </header>

                <div className="mt-14 space-y-8">
                    {REGIONS.map((region) => (
                        <section key={region} className="rounded-[8px] p-6 sm:p-7" style={panelStyle}>
                            <h2 className="font-serif text-xl sm:text-2xl text-amber-100 border-b border-amber-200/15 pb-3 mb-4">
                                {region}
                            </h2>
                            <ul className="flex flex-wrap gap-2 sm:gap-3">
                                {prefecturesInRegion(region).map((p) => (
                                    <li key={p.slug}>
                                        <Link
                                            href={areaPath(p.slug)}
                                            className="inline-block rounded-full border border-amber-200/25 px-4 py-2 font-serif text-sm text-amber-50/90 hover:bg-amber-300/10 hover:text-amber-100 transition-colors"
                                        >
                                            {p.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>

                <div className="mt-16">
                    <TopCta />
                </div>
            </div>
        </main>
    );
}
