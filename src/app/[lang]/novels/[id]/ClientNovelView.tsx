'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { defaultLocale, isLocale, localeMeta, type Locale } from '@/locales';
import { localizePath } from '@/lib/locale-path';
import { getLoginUser, getMyBabies, type GaruLoginUser, type PublicBaby } from '@/lib/baby-api';
import BabyHatchPet, { hatchPetIdFromUrl } from '@/components/BabyHatchPet';

type Props = {
    novelId: string;
    title: string;
    category: string;
    content: string[];
    companionLines?: string[];
    page: number;
    lang: string;
    animationPreset?: string;
    sourceVideoUrl?: string;
};

const COMPANION_IMG = 'https://d3ez7mat4qd439.cloudfront.net/garoo_kawaii.webp';

const ANIMAL_EMOJI: Record<string, string> = {
    cat: '🐱', dog: '🐶', rabbit: '🐰', fox: '🦊', bear: '🐻',
    panda: '🐼', wolf: '🐺', lion: '🦁', tiger: '🐯', penguin: '🐧',
    owl: '🦉', dragon: '🐲', unicorn: '🦄', bird: '🐦', hamster: '🐹',
    kangaroo: '🦘', mouse: '🐭', cow: '🐮', pig: '🐷', frog: '🐸',
    monkey: '🐵', sheep: '🐑',
};

function babyEmoji(animalType: string): string {
    const lower = (animalType ?? '').toLowerCase();
    for (const [k, v] of Object.entries(ANIMAL_EMOJI)) {
        if (lower.includes(k)) return v;
    }
    return '🐣';
}

const DEFAULT_COMPANION_LINES_JA = [
    'いっしょに読も?',
    'うんうん、続き気になる…',
    'ふむふむ……なるほど',
    'いいね、この一行',
    'ぐっとくる場面だなあ',
    'ここで深呼吸……',
    '続きが楽しみ!',
    'もう最後? 読み返したいかも',
];

const DEFAULT_COMPANION_LINES_EN = [
    "Let's read together?",
    'Hmm, I want to know what happens next…',
    'Ah, I see…',
    'I love this line',
    'A really moving scene',
    'Take a deep breath here…',
    "Can't wait for what's next!",
    'Already the end? I want to re-read.',
];

function pickCompanionLine(lines: string[] | undefined, page: number, lang: string) {
    const fallback = lang === 'ja' ? DEFAULT_COMPANION_LINES_JA : DEFAULT_COMPANION_LINES_EN;
    const arr = lines && lines.length > 0 ? lines : fallback;
    return arr[(page - 1) % arr.length];
}

type TtsState = 'idle' | 'speaking' | 'paused';

function langToBcp47(lang: string): string {
    if (isLocale(lang)) return localeMeta[lang as Locale].i18nTag;
    return 'ja-JP';
}

function pickVoice(voices: SpeechSynthesisVoice[], bcp47: string): SpeechSynthesisVoice | null {
    if (!voices.length) return null;
    const prefix = bcp47.split('-')[0];
    return (
        voices.find((v) => v.lang === bcp47) ??
        voices.find((v) => v.lang.startsWith(prefix)) ??
        null
    );
}

export default function ClientNovelView({
    novelId,
    title,
    category,
    content,
    companionLines,
    page,
    lang,
    sourceVideoUrl,
}: Props) {
    const totalPages = content.length;
    const currentPageContent = content[page - 1] ?? '';
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const isFirst = page === 1;
    const isLast = page === totalPages;
    const routeLocale = isLocale(lang) ? lang : defaultLocale;
    const companionLine = pickCompanionLine(companionLines, page, lang);

    // Auth + babies
    const [user, setUser] = useState<GaruLoginUser | null>(null);
    const [myBabies, setMyBabies] = useState<PublicBaby[]>([]);
    const [authLoaded, setAuthLoaded] = useState(false);

    const loadAuth = useCallback(async () => {
        const isLogin = typeof window !== 'undefined' && sessionStorage.getItem('isLogin') === 'true';
        if (!isLogin) {
            setUser(null);
            setMyBabies([]);
            setAuthLoaded(true);
            return;
        }
        const [u, babies] = await Promise.all([getLoginUser(), getMyBabies()]);
        setUser(u);
        setMyBabies(babies ?? []);
        setAuthLoaded(true);
    }, []);

    useEffect(() => {
        loadAuth();
        const handler = () => { loadAuth(); };
        window.addEventListener('garu-login', handler);
        return () => window.removeEventListener('garu-login', handler);
    }, [loadAuth]);

    const activeBaby = useMemo<PublicBaby | null>(() => {
        if (!myBabies.length) return null;
        // pick the highest-growth baby as the reader
        return [...myBabies].sort((a, b) => b.growthLevel - a.growthLevel)[0];
    }, [myBabies]);

    // 選択中の赤ちゃんが hatch-pet なら、その動くスプライトで表示する
    const hatchPetId = useMemo(
        () => (activeBaby ? hatchPetIdFromUrl(activeBaby.avatarUrl) : null),
        [activeBaby]
    );
    // companion スプライトの表示サイズ（lg 以上で大きく）
    const [companionLg, setCompanionLg] = useState(false);
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mq = window.matchMedia('(min-width: 1024px)');
        const apply = () => setCompanionLg(mq.matches);
        apply();
        mq.addEventListener('change', apply);
        return () => mq.removeEventListener('change', apply);
    }, []);

    // TTS
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [ttsState, setTtsState] = useState<TtsState>('idle');
    const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

    useEffect(() => {
        if (!ttsSupported) return;
        const populate = () => setVoices(window.speechSynthesis.getVoices());
        populate();
        window.speechSynthesis.addEventListener('voiceschanged', populate);
        return () => window.speechSynthesis.removeEventListener('voiceschanged', populate);
    }, [ttsSupported]);

    // Stop any speech when page changes or component unmounts
    useEffect(() => {
        return () => {
            if (ttsSupported) {
                window.speechSynthesis.cancel();
            }
        };
    }, [page, ttsSupported]);

    useEffect(() => {
        // also reset state on page change
        if (ttsSupported) {
            window.speechSynthesis.cancel();
            setTtsState('idle');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const speak = useCallback(() => {
        if (!ttsSupported) return;
        if (!currentPageContent) return;
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(currentPageContent);
        utter.lang = langToBcp47(lang);
        utter.pitch = 1.4; // baby-ish
        utter.rate = 0.95;
        utter.volume = 1;
        const v = pickVoice(voices, utter.lang);
        if (v) utter.voice = v;
        utter.onend = () => setTtsState('idle');
        utter.onerror = () => setTtsState('idle');
        window.speechSynthesis.speak(utter);
        setTtsState('speaking');
    }, [currentPageContent, lang, voices, ttsSupported]);

    const pause = useCallback(() => {
        if (!ttsSupported) return;
        window.speechSynthesis.pause();
        setTtsState('paused');
    }, [ttsSupported]);

    const resume = useCallback(() => {
        if (!ttsSupported) return;
        window.speechSynthesis.resume();
        setTtsState('speaking');
    }, [ttsSupported]);

    const stop = useCallback(() => {
        if (!ttsSupported) return;
        window.speechSynthesis.cancel();
        setTtsState('idle');
    }, [ttsSupported]);

    const lastMessage = lang === 'ja'
        ? '🎉 最後まで読んでくれてありがとう!'
        : '🎉 Thanks for reading to the end!';

    const prevLabel = lang === 'ja' ? '前のページ' : 'Previous';
    const nextLabel = lang === 'ja' ? '次のページ' : 'Next';
    const pageLabel = lang === 'ja' ? `${page} / ${totalPages} ページ` : `Page ${page} of ${totalPages}`;
    const backToLibrary = lang === 'ja' ? '本棚にもどる' : 'Back to Library';

    const readerName = activeBaby?.name ?? (lang === 'ja' ? 'ガルちゃん' : 'Garu-chan');
    const readerLabel = lang === 'ja' ? `${readerName} と読書中` : `Reading with ${readerName}`;

    // TTS button labels
    const playLabel = lang === 'ja'
        ? (activeBaby ? `${readerName}に読んでもらう` : 'ガルちゃんに読んでもらう')
        : `Have ${readerName} read aloud`;
    const pauseLabel = lang === 'ja' ? '一時停止' : 'Pause';
    const resumeLabel = lang === 'ja' ? '再開' : 'Resume';
    const stopLabel = lang === 'ja' ? '停止' : 'Stop';

    return (
        <>
            {/* Ambient warm-paper backdrop */}
            <motion.div
                aria-hidden
                className="pointer-events-none fixed inset-0 -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2 }}
                style={{
                    background:
                        'radial-gradient(1200px 600px at 20% 20%, rgba(217, 164, 97, 0.18), transparent 70%), radial-gradient(900px 500px at 80% 80%, rgba(94, 168, 160, 0.10), transparent 70%), linear-gradient(135deg, #07080c 0%, #11131c 55%, #0b0d14 100%)',
                }}
            />

            <div className="w-full max-w-6xl mx-auto">
                {/* Top breadcrumb / category */}
                <header className="text-center mb-6">
                    <p className="text-amber-200/80 tracking-[0.3em] text-xs uppercase">
                        {category}
                    </p>
                    <motion.h1
                        className="mt-2 text-2xl sm:text-4xl font-serif font-bold text-amber-50"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {title}
                    </motion.h1>
                </header>

                {/* Book + Companion layout */}
                <div className="flex flex-col lg:flex-row items-stretch gap-6">
                    {/* The Book */}
                    <motion.div
                        key={`book-${page}`}
                        initial={{ opacity: 0, rotateY: 8, y: 12 }}
                        animate={{ opacity: 1, rotateY: 0, y: 0 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        className="relative flex-1 mx-auto w-full max-w-3xl"
                        style={{ perspective: '1800px' }}
                    >
                        {/* Book outer (cover/board) */}
                        <div
                            className="relative rounded-[14px] p-3 sm:p-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]"
                            style={{
                                background:
                                    'linear-gradient(135deg, #5a3a25 0%, #3e2716 50%, #5a3a25 100%)',
                                boxShadow:
                                    '0 30px 60px -20px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,200,140,0.12), inset 0 0 30px rgba(0,0,0,0.45)',
                            }}
                        >
                            {/* Bookmark ribbon */}
                            <div
                                aria-hidden
                                className="absolute -top-2 right-8 sm:right-14 w-3 sm:w-4 h-16 sm:h-24 bg-rose-700 shadow-md"
                                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}
                            />

                            {/* Inner page (parchment) */}
                            <div
                                className="relative rounded-[8px] overflow-hidden"
                                style={{
                                    background:
                                        'radial-gradient(ellipse at top left, #fbf3df 0%, #f3e6c3 60%, #e7d7ad 100%)',
                                    boxShadow:
                                        'inset 0 0 0 1px rgba(120,80,30,0.12), inset 0 30px 60px rgba(120,80,30,0.06)',
                                }}
                            >
                                {/* Center spine shadow */}
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 w-12 hidden md:block"
                                    style={{
                                        background:
                                            'linear-gradient(90deg, transparent 0%, rgba(120,80,30,0.18) 45%, rgba(120,80,30,0.28) 50%, rgba(120,80,30,0.18) 55%, transparent 100%)',
                                    }}
                                />

                                {/* Top page-edge ornament */}
                                <div className="flex items-center justify-between px-6 sm:px-10 pt-6 sm:pt-8 text-stone-500 text-[11px] tracking-[0.3em] uppercase font-serif">
                                    <span>Garoop Novel</span>
                                    <span className="hidden sm:inline">— 第 {page} 葉 —</span>
                                    <span>Ch.{String(page).padStart(2, '0')}</span>
                                </div>

                                {/* Body text */}
                                <div className="px-6 sm:px-12 py-8 sm:py-12 min-h-[55vh]">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={`page-${page}`}
                                            initial={{ opacity: 0, x: 18 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -18 }}
                                            transition={{ duration: 0.35, ease: 'easeOut' }}
                                            className="font-serif text-[15px] sm:text-[17px] leading-[2.0] sm:leading-[2.1] text-stone-800 whitespace-pre-wrap [text-indent:1em]"
                                            style={{ fontFamily: '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif' }}
                                        >
                                            {currentPageContent}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Bottom page-edge ornament */}
                                <div className="flex items-center justify-between px-6 sm:px-10 pb-5 sm:pb-7 text-stone-500 text-[11px] tracking-widest font-serif">
                                    <span>{pageLabel}</span>
                                    <span className="text-stone-400">❦</span>
                                    <span>{novelId}</span>
                                </div>

                                {/* Last-page shimmer */}
                                {isLast && (
                                    <motion.span
                                        aria-hidden
                                        className="pointer-events-none absolute inset-0"
                                        initial={{ x: '-120%' }}
                                        animate={{ x: '120%' }}
                                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                                        style={{
                                            background:
                                                'linear-gradient(120deg, transparent 0%, rgba(255,220,160,0.25) 25%, rgba(255,220,160,0.45) 40%, transparent 65%)',
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Page-turn controls (bookmark style) */}
                        <nav className="mt-5 flex items-center justify-between gap-3">
                            {hasPrevPage ? (
                                <Link
                                    href={`${localizePath(`/novels/${novelId}`, routeLocale)}?page=${page - 1}`}
                                    className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-200/10 text-amber-100 hover:bg-stone-200/20 border border-amber-100/20 backdrop-blur transition"
                                >
                                    <span className="text-lg leading-none">←</span>
                                    <span className="text-sm font-medium">{prevLabel}</span>
                                </Link>
                            ) : (
                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-200/5 text-stone-500 border border-stone-200/10 cursor-not-allowed">
                                    <span className="text-lg leading-none">←</span>
                                    <span className="text-sm">{prevLabel}</span>
                                </span>
                            )}

                            <div className="text-amber-100/80 text-xs tracking-[0.25em] uppercase font-serif">
                                {pageLabel}
                            </div>

                            {hasNextPage ? (
                                <Link
                                    href={`${localizePath(`/novels/${novelId}`, routeLocale)}?page=${page + 1}`}
                                    className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-300/90 text-stone-900 hover:bg-amber-200 border border-amber-100/40 shadow-md transition"
                                >
                                    <span className="text-sm font-medium">{nextLabel}</span>
                                    <motion.span
                                        className="text-lg leading-none"
                                        animate={isFirst ? { x: [0, 4, 0] } : {}}
                                        transition={isFirst ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' } : {}}
                                    >
                                        →
                                    </motion.span>
                                </Link>
                            ) : (
                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-200/5 text-stone-500 border border-stone-200/10 cursor-not-allowed">
                                    <span className="text-sm">{nextLabel}</span>
                                    <span className="text-lg leading-none">→</span>
                                </span>
                            )}
                        </nav>
                    </motion.div>

                    {/* Reading Companion */}
                    <aside className="lg:w-72 flex-shrink-0 flex lg:flex-col items-center lg:items-stretch gap-4 lg:sticky lg:top-6 self-start">
                        <div className="relative w-32 sm:w-36 lg:w-full flex-shrink-0">
                            <motion.div
                                animate={ttsState === 'speaking'
                                    ? { y: [0, -3, 0], scale: [1, 1.02, 1] }
                                    : { y: [0, -6, 0] }
                                }
                                transition={{
                                    duration: ttsState === 'speaking' ? 0.6 : 3.4,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                                className="relative"
                            >
                                {activeBaby ? (
                                    // User's baby as reader
                                    <div
                                        className="relative w-full aspect-square rounded-[28px] flex items-center justify-center text-7xl sm:text-8xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden"
                                        style={{
                                            background:
                                                'linear-gradient(160deg, rgba(245,228,191,0.12) 0%, rgba(245,228,191,0.04) 100%)',
                                            boxShadow:
                                                '0 20px 40px -10px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(217,180,120,0.30), inset 0 0 0 6px rgba(217,180,120,0.08)',
                                        }}
                                    >
                                        {hatchPetId ? (
                                            <BabyHatchPet
                                                petId={hatchPetId}
                                                state={ttsState === 'speaking' ? 'waving' : 'idle'}
                                                size={companionLg ? 188 : 116}
                                            />
                                        ) : (
                                            <span aria-hidden>{babyEmoji(activeBaby.animalType)}</span>
                                        )}
                                        {/* sound waves when speaking */}
                                        {ttsState === 'speaking' && (
                                            <>
                                                <motion.span
                                                    aria-hidden
                                                    className="absolute inset-0 rounded-[28px] border-2 border-amber-300/40"
                                                    initial={{ scale: 1, opacity: 0.6 }}
                                                    animate={{ scale: 1.15, opacity: 0 }}
                                                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                                                />
                                                <motion.span
                                                    aria-hidden
                                                    className="absolute inset-0 rounded-[28px] border-2 border-amber-300/40"
                                                    initial={{ scale: 1, opacity: 0.6 }}
                                                    animate={{ scale: 1.15, opacity: 0 }}
                                                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut', delay: 0.7 }}
                                                />
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    // Default ガルちゃん image (logged out / no babies)
                                    <Image
                                        src={COMPANION_IMG}
                                        alt="Reading companion"
                                        width={240}
                                        height={240}
                                        className="rounded-[28px] border border-amber-200/30 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] bg-slate-900/40"
                                        priority
                                    />
                                )}
                                {/* tiny book icon at companion's hands */}
                                <div className="absolute -bottom-2 -right-2 bg-stone-100 text-stone-700 rounded-md px-2 py-1 text-[11px] font-serif shadow-md rotate-[-6deg] border border-stone-300">
                                    📖 一緒に読書中
                                </div>
                            </motion.div>

                            {/* Baby info badge */}
                            {activeBaby && (
                                <div className="mt-3 px-3 py-2 rounded-xl bg-stone-900/60 border border-amber-200/15 text-center">
                                    <p className="font-serif text-amber-50 text-sm leading-tight">
                                        {activeBaby.name}
                                    </p>
                                    <p className="mt-0.5 font-serif text-amber-200/70 text-[10px] tracking-widest uppercase">
                                        {activeBaby.animalType} · Lv.{Math.floor(activeBaby.growthLevel / 10) + 1}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Read aloud controls */}
                        {ttsSupported && (
                            <div className="w-full flex flex-col gap-2">
                                {ttsState === 'idle' && (
                                    <button
                                        onClick={speak}
                                        className="group inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-amber-300 hover:bg-amber-200 text-stone-900 font-serif text-sm shadow-md transition"
                                    >
                                        <span className="text-base leading-none">🔊</span>
                                        <span>{playLabel}</span>
                                    </button>
                                )}
                                {ttsState === 'speaking' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={pause}
                                            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-amber-300 hover:bg-amber-200 text-stone-900 font-serif text-xs"
                                        >
                                            <span>⏸</span><span>{pauseLabel}</span>
                                        </button>
                                        <button
                                            onClick={stop}
                                            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-stone-200/15 hover:bg-stone-200/25 text-amber-100 border border-amber-100/15 font-serif text-xs"
                                        >
                                            <span>⏹</span><span>{stopLabel}</span>
                                        </button>
                                    </div>
                                )}
                                {ttsState === 'paused' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={resume}
                                            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-amber-300 hover:bg-amber-200 text-stone-900 font-serif text-xs"
                                        >
                                            <span>▶︎</span><span>{resumeLabel}</span>
                                        </button>
                                        <button
                                            onClick={stop}
                                            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-stone-200/15 hover:bg-stone-200/25 text-amber-100 border border-amber-100/15 font-serif text-xs"
                                        >
                                            <span>⏹</span><span>{stopLabel}</span>
                                        </button>
                                    </div>
                                )}

                                {/* Login hint when not logged in */}
                                {authLoaded && !user && lang === 'ja' && (
                                    <p className="text-amber-100/55 text-[11px] leading-relaxed text-center lg:text-left font-serif">
                                        ※ ログインすると、自分のマイベイビーが読んでくれます
                                    </p>
                                )}
                                {authLoaded && user && !activeBaby && lang === 'ja' && (
                                    <p className="text-amber-100/55 text-[11px] leading-relaxed text-center lg:text-left font-serif">
                                        ※ マイベイビーを作ると、その子が読んでくれます
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Speech bubble with per-page companion line */}
                        <div className="relative flex-1 lg:flex-none">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`companion-${page}`}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.35 }}
                                    className="relative bg-amber-50 text-stone-800 rounded-2xl px-4 py-3 shadow-md border border-amber-200"
                                >
                                    {/* Bubble tail (left side on desktop, top on mobile) */}
                                    <span
                                        aria-hidden
                                        className="absolute hidden lg:block left-0 top-6 -translate-x-2 w-3 h-3 bg-amber-50 border-l border-b border-amber-200 rotate-45"
                                    />
                                    <span
                                        aria-hidden
                                        className="absolute lg:hidden top-0 left-6 -translate-y-2 w-3 h-3 bg-amber-50 border-t border-l border-amber-200 rotate-45"
                                    />
                                    <p className="font-serif text-[14px] leading-relaxed">
                                        {companionLine}
                                    </p>
                                </motion.div>
                            </AnimatePresence>

                            <p className="mt-2 text-amber-100/60 text-[11px] text-center lg:text-left tracking-wider font-serif">
                                {readerLabel}
                            </p>
                        </div>
                    </aside>
                </div>

                {/* Last-page footer */}
                {isLast && (
                    <div className="mt-10 flex flex-col items-center gap-4">
                        <motion.div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/90 text-stone-900 shadow-lg"
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                        >
                            <span className="text-lg">🎉</span>
                            <span className="font-semibold">{lastMessage}</span>
                        </motion.div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href={localizePath('/novels', routeLocale)}
                                className="inline-block px-5 py-2 rounded-full bg-stone-200/10 text-amber-100 hover:bg-stone-200/20 border border-amber-100/20 transition"
                            >
                                {backToLibrary}
                            </Link>

                            {sourceVideoUrl && (
                                <a
                                    href={sourceVideoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white shadow"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                    </svg>
                                    <span>{lang === 'ja' ? '元の動画を見る' : 'Watch Original Video'}</span>
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
