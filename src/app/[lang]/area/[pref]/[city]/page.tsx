import Link from 'next/link';
import { notFound } from 'next/navigation';
import { defaultLocale } from '@/locales';
import { findPrefecture } from '@/lib/area/prefectures';
import { CITIES, findCity } from '@/lib/area/cities';
import {
    SERVICE_FEATURES,
    SERVICE_KEYWORD,
    SERVICE_NAME,
    areaPath,
    cityFaqs,
    cityJsonLd,
    cityLeadText,
    cityPageDescription,
    cityPageTitle,
    cityPath,
    cityUrl,
    cityUsageExamples,
    otherCitiesInPrefecture,
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
} from '../../area-ui';

type Props = { params: Promise<{ lang: string; pref: string; city: string }> };

// CITIES の全件を日本語だけ静的生成。県と市区の組み合わせがないもの・他ロケールは 404。
export const dynamicParams = false;
export function generateStaticParams() {
    return CITIES.map((c) => ({ lang: defaultLocale, pref: c.pref, city: c.slug }));
}

function resolve(lang: string, pref: string, city: string) {
    if (lang !== defaultLocale) return null;
    const c = findCity(pref, city);
    const p = c ? findPrefecture(c.pref) : undefined;
    return c && p ? { c, p } : null;
}

export async function generateMetadata({ params }: Props) {
    const { lang, pref, city } = await params;
    const r = resolve(lang, pref, city);
    if (!r) return {};
    return areaMetadata({
        title: cityPageTitle(r.c, r.p),
        description: cityPageDescription(r.c, r.p),
        url: cityUrl(r.c),
    });
}

export default async function AreaCityPage({ params }: Props) {
    const { lang, pref, city } = await params;
    const r = resolve(lang, pref, city);
    if (!r) notFound();
    const { c, p } = r;
    const others = otherCitiesInPrefecture(c);

    return (
        <main className="relative min-h-screen px-4 pt-10 pb-20 font-sans text-amber-50 overflow-x-hidden">
            <AreaBackdrop />
            <JsonLd data={cityJsonLd(c, p)} />
            <div className="container mx-auto max-w-4xl">
                <Breadcrumbs
                    items={[
                        { name: 'トップ', href: '/' },
                        { name: '地域から探す', href: '/area' },
                        { name: p.name, href: areaPath(p.slug) },
                        { name: c.name },
                    ]}
                />

                <AreaHero
                    label={`${p.region}地方・${p.name}・${c.name}`}
                    title={`${c.name}（${p.name}）で読める${SERVICE_KEYWORD}`}
                    sub={`｜${SERVICE_NAME}`}
                    lead={cityLeadText(c, p)}
                />

                <section className="mt-14">
                    <SectionHeading>{SERVICE_NAME}でできること</SectionHeading>
                    <CardList items={SERVICE_FEATURES} grid />
                </section>

                <section className="mt-14">
                    <SectionHeading>{c.name}での使い方の例</SectionHeading>
                    <CardList items={cityUsageExamples(c, p)} />
                </section>

                <section className="mt-14">
                    <SectionHeading>{c.name}の方からのよくある質問</SectionHeading>
                    <FaqList items={cityFaqs(c, p)} />
                </section>

                <section className="mt-14">
                    <SectionHeading>近くの地域</SectionHeading>
                    <LinkChips
                        title={`${p.name}のほかの市区`}
                        links={others.map((o) => ({ href: cityPath(o), name: o.name }))}
                    />
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                        <Link href={areaPath(p.slug)} className="font-serif text-sm text-amber-200/80 hover:text-amber-100 underline underline-offset-4">
                            {p.name}のページを見る →
                        </Link>
                        <Link href="/area" className="font-serif text-sm text-amber-200/80 hover:text-amber-100 underline underline-offset-4">
                            47都道府県の一覧を見る →
                        </Link>
                    </div>
                </section>

                <BottomCta text={`${c.name}からも、今すぐブラウザで読めます。`} />
            </div>
        </main>
    );
}
