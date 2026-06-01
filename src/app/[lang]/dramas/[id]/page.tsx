import { notFound } from 'next/navigation';
import { locales, Locale, localeMeta } from '@/locales';
import { localizePath } from '@/lib/locale-path';
import { generateLocalizedMetadata, SITE_URL } from '@/lib/seo';
import { getAllDramas, getDramaById } from '@/lib/dramas';
import DramaPlayer from './DramaPlayer';

export async function generateStaticParams() {
  const dramas = getAllDramas();
  const params: { lang: string; id: string }[] = [];
  for (const lang of locales) {
    for (const d of dramas) {
      params.push({ lang, id: d.id });
    }
  }
  return params;
}

export async function generateMetadata(props: {
  params: Promise<{ id: string; lang: string }>;
}) {
  const { id, lang: rawLang } = await props.params;
  const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
  const drama = getDramaById(id);
  if (!drama) return {};
  return generateLocalizedMetadata({
    title: `${drama.seriesTitle} | ドラマ劇場`,
    description: drama.logline.slice(0, 160),
    lang,
    path: `/dramas/${drama.id}`,
    type: 'article',
    image: '/images/dramas/garuchan/portrait.png',
  });
}

type Props = {
  params: Promise<{ id: string; lang: string }>;
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
};

export default async function DramaDetailPage(props: Props) {
  const { id, lang: rawLang } = await props.params;
  const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
  const searchParams = await props.searchParams;
  const drama = getDramaById(id);
  if (!drama) notFound();

  let epNumber = searchParams.ep ? parseInt(searchParams.ep as string, 10) : 1;
  if (isNaN(epNumber) || epNumber < 1) epNumber = 1;
  if (epNumber > drama.episodes.length) epNumber = drama.episodes.length;

  const canonical = `${SITE_URL}${localizePath(`/dramas/${drama.id}`, lang)}`;

  const jsonLdSeries = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: drama.seriesTitle,
    alternateName: drama.enTitle,
    inLanguage: localeMeta[lang].i18nTag,
    genre: drama.genre,
    description: drama.logline,
    url: canonical,
    numberOfEpisodes: drama.episodes.length,
    character: drama.characters
      .filter((c) => c.role !== '端役')
      .map((c) => ({ '@type': 'Person', name: c.name, roleName: c.role })),
    episode: drama.episodes.map((ep) => ({
      '@type': 'TVEpisode',
      episodeNumber: ep.number,
      name: ep.title,
      description: ep.synopsis,
    })),
    publisher: { '@type': 'Organization', name: '株式会社Garoop', url: SITE_URL },
  };

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'ドラマ劇場', item: `${SITE_URL}${localizePath('/dramas', lang)}` },
      { '@type': 'ListItem', position: 3, name: drama.seriesTitle, item: canonical },
    ],
  };

  return (
    <>
      <link rel="canonical" href={canonical} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSeries) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <DramaPlayer drama={drama} lang={lang} initialEp={epNumber} />
    </>
  );
}
