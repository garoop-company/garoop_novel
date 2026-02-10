'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

type Props = {
    novelId: string;
    title: string;
    category: string;
    content: string[];
    page: number;
    lang: string;
    sourceVideoUrl?: string;
};

export default function ClientNovelView({ novelId, title, category, content, page, lang, sourceVideoUrl }: Props) {
    const totalPages = content.length;
    const currentPageContent = content[page - 1] ?? '';
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const isFirst = page === 1;
    const isLast = page === totalPages;

    // 言語別メッセージ
    const firstMessage = lang === 'ja'
        ? 'はじめまして。ページを読み進めると…ふふふ。👀'
        : 'Nice to meet you. Keep reading and… hehehe 👀';

    const lastMessage = lang === 'ja'
        ? '🎉 最後まで読んでくれてありがとう！'
        : '🎉 Thanks for reading to the end!';

    return (
        <>
            {/* 背景パルス */}
            <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: isFirst || isLast ? 0.45 : 0.2 }}
                transition={{ duration: 1.2 }}
                style={{
                    background:
                        'radial-gradient(1200px 600px at 20% 20%, rgba(217, 164, 97, 0.16), transparent 70%), radial-gradient(1000px 500px at 80% 80%, rgba(94, 168, 160, 0.12), transparent 70%)'
                }}
            />

            <motion.div
                className="max-w-4xl w-full bg-slate-900/60 rounded-lg shadow-lg p-4 sm:p-8 relative z-10"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
            >
                <header className="text-center mb-6">
                    <motion.h1
                        className="text-3xl sm:text-4xl font-bold font-serif"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05, duration: 0.35 }}
                    >
                        {title}
                    </motion.h1>
                    <motion.p
                        className={`text-md sm:text-lg mt-2 inline-block ${category === 'Horror' ? 'text-amber-300' : 'text-teal-300'}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12, duration: 0.35 }}
                    >
                        {category}
                    </motion.p>
                </header>

                {/* 本文 + キャラ画像 */}
                <main className="bg-slate-950/60 p-6 sm:p-8 rounded-lg shadow-inner mb-6 min-h-[30vh] sm:min-h-[40vh] flex flex-col sm:flex-row items-center sm:items-start gap-6 overflow-hidden">
                    {/* キャラ画像（最初のページはふわふわ） */}
                    <motion.div
                        className="flex-shrink-0 w-32 sm:w-40"
                        animate={isFirst ? { y: [0, -6, 0] } : { y: 0 }}
                        transition={isFirst ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : {}}
                    >
                        <Image
                            src="https://d3ez7mat4qd439.cloudfront.net/garoo_kawaii.webp"
                            alt="Garoop character"
                            width={160}
                            height={160}
                            className="rounded-full border-2 border-amber-300/60 shadow-lg"
                            priority
                        />
                        {isFirst && (
                            <motion.div
                                className="mt-2 text-center text-amber-200 text-sm"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                            >
                                {firstMessage}
                            </motion.div>
                        )}
                    </motion.div>

                    {/* 吹き出し風本文（最後はキラッ） */}
                    <motion.div
                        className="relative bg-slate-900 text-slate-200 leading-relaxed text-md sm:text-lg whitespace-pre-wrap w-full rounded-xl p-4 sm:p-6 shadow-inner"
                        key={page}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        <span className="absolute left-[-12px] top-6 w-0 h-0 border-t-8 border-b-8 border-r-12 border-t-transparent border-b-transparent border-r-slate-900"></span>

                        {isLast && (
                            <motion.span
                                aria-hidden
                                className="pointer-events-none absolute inset-0 rounded-xl"
                                initial={{ x: '-120%' }}
                                animate={{ x: '120%' }}
                                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                                style={{
                                    background:
                                        'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.12) 35%, transparent 60%)'
                                }}
                            />
                        )}

                        {currentPageContent}
                    </motion.div>
                </main>

                {/* ナビ */}
                <nav className="flex justify-between items-center">
                    <div>
                        {hasPrevPage ? (
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                                <Link
                                    href={`/novels/${novelId}?page=${page - 1}`}
                                    className="px-4 py-2 sm:px-6 sm:py-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors text-sm sm:text-base"
                                >
                                    &larr; Previous
                                </Link>
                            </motion.div>
                        ) : (
                            <span className="px-4 py-2 sm:px-6 sm:py-2 bg-slate-900 text-slate-500 rounded cursor-not-allowed text-sm sm:text-base">
                                &larr; Previous
                            </span>
                        )}
                    </div>

                    <div className="text-slate-400 text-sm sm:text-base">
                        Page {page} of {totalPages}
                    </div>

                    <div>
                        {hasNextPage ? (
                            <motion.div
                                animate={isFirst ? { y: [0, -3, 0] } : {}}
                                transition={isFirst ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 } : {}}
                            >
                                <Link
                                    href={`/novels/${novelId}?page=${page + 1}`}
                                    className="px-4 py-2 sm:px-6 sm:py-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors text-sm sm:text-base"
                                >
                                    Next &rarr;
                                </Link>
                            </motion.div>
                        ) : (
                            <span className="px-4 py-2 sm:px-6 sm:py-2 bg-slate-900 text-slate-500 rounded cursor-not-allowed text-sm sm:text-base">
                                Next &rarr;
                            </span>
                        )}
                    </div>
                </nav>

                {/* 最後だけ完読バッジ */}
                {isLast && (
                    <div className="mt-8 flex flex-col items-center gap-4">
                        <motion.div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/90 text-slate-950 shadow-lg"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                        >
                            <span className="text-lg">🎉</span>
                            <span className="font-semibold">{lastMessage}</span>
                        </motion.div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="text-center">
                                <Link href="/novels" className="inline-block px-5 py-2 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 shadow">
                                    {lang === 'ja' ? 'ライブラリに戻る' : 'Back to Library'}
                                </Link>
                            </motion.div>

                            {sourceVideoUrl && (
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="text-center">
                                    <a
                                        href={sourceVideoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-5 py-2 rounded bg-red-600 hover:bg-red-500 text-white shadow"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                        </svg>
                                        <span>{lang === 'ja' ? '元の動画を見る' : 'Watch Original Video'}</span>
                                    </a>
                                </motion.div>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </>
    );
}
