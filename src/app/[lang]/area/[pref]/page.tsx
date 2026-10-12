import Link from 'next/link';
import { notFound } from 'next/navigation';
import { defaultLocale } from '@/locales';
import { PREFECTURES, findPrefecture } from '@/lib/area/prefectures';
import { citiesInPrefecture } from '@/lib/area/cities';
import {
    SERVICE_FEATURES,
    SERVICE_KEYWORD,
    SERVICE_NAME,
    areaPath,
    areaUrl,
    cityPath,
    faqs,
    leadText,
    nearbyPrefectures,
    pageDescription,
    pageTitle,
    prefectureJsonLd,
    usageExamples,
} from '@/lib/area/content';
import {
    AreaBackdrop,
    AreaHero,
    BottomCta,
    Breadcrumbs,
    CardList,
    FaqList,
    JsonLd,
    LinkChips,
    SectionHeading,
    areaMetadata,
} from '../area-ui';

type Props = { params: Promise<{ lang: string; pref: string }> };

// 47 都道府県を日本語だけ静的生成。未知の slug・他ロケールは 404。
export const dynamicParams = false;
export function generateStaticParams() {
    return PREFECTURES.map((p) => ({ lang: defaultLocale, pref: p.slug }));
}

export async function generateMetadata({ params }: Props) {
    const { lang, pref } = await params;
    const p = findPrefecture(pref);
    if (lang !== defaultLocale || !p) return {};
    return areaMetadata({ title: pageTitle(p), description: pageDescription(p), url: areaUrl(p.slug) });
}

export default async function AreaPrefecturePage({ params }: Props) {
    const { lang, pref } = await params;
    const p = findPrefecture(pref);
    if (lang !== defaultLocale || !p) notFound();

    const { neighbors, sameRegion } = nearbyPrefectures(p);
    const cities = citiesInPrefecture(p.slug);

    return (
        <main className="relative min-h-screen px-4 pt-10 pb-20 font-sans text-amber-50 overflow-x-hidden">
            <AreaBackdrop />
            <JsonLd data={prefectureJsonLd(p)} />
            <div className="container mx-auto max-w-4xl">
                <Breadcrumbs
                    items={[
                        { name: 'トップ', href: '/' },
                        { name: '地域から探す', href: '/area' },
                        { name: p.name },
                    ]}
                />

                <AreaHero
                    label={`${p.region}地方・${p.name}`}
                    title={`${p.name}で読める${SERVICE_KEYWORD}`}
                    sub={`｜${SERVICE_NAME}`}
                    lead={leadText(p)}
                />

                <section className="mt-14">
                    <SectionHeading>{SERVICE_NAME}でできること</SectionHeading>
                    <CardList items={SERVICE_FEATURES} grid />
                </section>

                <section className="mt-14">
                    <SectionHeading>{p.name}での使い方の例</SectionHeading>
                    <CardList items={usageExamples(p)} />
                </section>

                <section className="mt-14">
                    <SectionHeading>{p.name}の方からのよくある質問</SectionHeading>
                    <FaqList items={faqs(p)} />
                </section>

                {cities.length > 0 && (
                    <section className="mt-14">
                        <SectionHeading>{p.name}の市区から探す</SectionHeading>
                        <LinkChips links={cities.map((c) => ({ href: cityPath(c), name: c.name }))} />
                    </section>
                )}

                <section className="mt-14">
                    <SectionHeading>近くの地域</SectionHeading>
                    <LinkChips
                        title={`${p.name}のとなりの地域`}
                        links={neighbors.map((n) => ({ href: areaPath(n.slug), name: n.name }))}
                    />
                    <LinkChips
                        title={`${p.region}地方のほかの地域`}
                        links={sameRegion.map((n) => ({ href: areaPath(n.slug), name: n.name }))}
                    />
                    <Link href="/area" className="font-serif text-sm text-amber-200/80 hover:text-amber-100 underline underline-offset-4">
                        47都道府県の一覧を見る →
                    </Link>
                </section>

                <BottomCta text={`${p.name}からも、今すぐブラウザで読めます。`} />
            </div>
        </main>
    );
}
