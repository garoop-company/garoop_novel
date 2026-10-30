import type { BlogPost } from './types';
import { POSTS } from './posts';

export type { BlogPost } from './types';

/** 新しい順（同じ日は slug 順） */
export const posts: BlogPost[] = [...POSTS].sort(
    (a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug),
);

export function getPost(slug: string): BlogPost | undefined {
    return posts.find((p) => p.slug === slug);
}

/** "2026-10-30" → "2026年10月30日" */
export function formatBlogDate(date: string): string {
    const [y, m, d] = date.split('-').map(Number);
    return `${y}年${m}月${d}日`;
}
