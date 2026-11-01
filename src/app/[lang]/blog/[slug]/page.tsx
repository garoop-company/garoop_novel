import Link from 'next/link';
import { notFound } from 'next/navigation';
import { locales, Locale } from '@/locales';
import { localizePath } from '@/lib/locale-path';
import { JA_ONLY, generateLocalizedMetadata, SITE_URL } from '@/lib/seo';
import { posts, getPost, formatBlogDate } from '@/lib/blog';
import BlogBody from '@/components/BlogBody';

type Params = { lang: string; slug: string };

export function generateStaticParams() {
    return locales.flatMap((lang) => posts.map((post) => ({ lang, slug: post.slug })));
}

export async function generateMetadata({ params }: { params: Promise<Params> }) {
    const { lang: rawLang, slug } = await params;
    const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
    const post = getPost(slug);
    if (!post) return {};

    return generateLocalizedMetadata({
        title: `${post.title} | Garoop Novel`,
        description: post.description,
        lang,
        path: `/blog/${post.slug}`,
        type: 'article',
        availableLocales: JA_ONLY,
    });
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
    const { lang: rawLang, slug } = await params;
    const lang = (locales.includes(rawLang as Locale) ? rawLang : 'ja') as Locale;
    const post = getPost(slug);
    if (!post) notFound();

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        inLanguage: 'ja',
        keywords: post.tags.join(','),
        mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
        author: { '@type': 'Person', name: post.author.name, jobTitle: post.author.role, url: post.author.url },
        publisher: { '@type': 'Organization', name: '株式会社Garoop', url: 'https://garoop.jp' },
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
            <article className="max-w-3xl mx-auto bg-slate-900/70 p-5 sm:p-10 rounded-2xl border border-slate-700 shadow-sm">
                <Link href={localizePath('/blog', lang)} className="text-sm font-bold text-slate-400 hover:text-amber-200">
                    ← ブログ一覧へ
                </Link>
                <header className="mt-6 mb-10 border-b border-slate-700 pb-6">
                    <time dateTime={post.publishedAt} className="text-xs font-bold tracking-widest text-slate-400">
                        {formatBlogDate(post.publishedAt)}
                    </time>
                    <h1 className="mt-3 text-2xl sm:text-3xl font-bold leading-snug text-slate-100">{post.title}</h1>
                    <p className="mt-4 text-sm text-slate-400">
                        寄稿：{post.author.name}（{post.author.role}）
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-100">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </header>
                <div className="space-y-6 leading-relaxed">
                    <BlogBody
                        body={post.body}
                        classNames={{
                            h2: 'mt-10 text-xl font-bold text-slate-100 border-l-4 border-slate-700 pl-3',
                            h3: 'mt-6 text-lg font-bold text-slate-100',
                            p: 'leading-8',
                            ul: 'list-disc space-y-2 pl-6 leading-7',
                            quote: 'border-l-4 border-slate-700 bg-slate-800 px-4 py-3 text-sm leading-7 text-slate-100 rounded',
                            source: 'grid gap-2',
                            sourceLabel: 'text-xs font-bold tracking-widest text-slate-400',
                            card: 'flex items-center gap-4 rounded-2xl border border-slate-700 bg-slate-900 p-4 no-underline transition hover:border-amber-200/60',
                            cardIcon: 'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-800 text-lg font-bold text-amber-200',
                            cardSite: 'block truncate text-xs text-slate-400',
                            cardTitle: 'mt-1 block font-bold leading-snug text-slate-100',
                            cardDesc: 'mt-1 hidden overflow-hidden text-xs leading-relaxed text-slate-400 [-webkit-box-orient:vertical] [-webkit-line-clamp:2] sm:[display:-webkit-box]',
                            cardImage: 'aspect-square w-24 flex-shrink-0 rounded-lg bg-slate-800 object-cover sm:aspect-[1.91/1] sm:w-44',
                        }}
                    />
                </div>
            </article>
        </div>
    );
}
