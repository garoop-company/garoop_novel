"use client";

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getDictionary } from '@/locales';
import LanguageSwitcher from './LanguageSwitcher';
import { detectLocaleFromPathname, localizePath } from '@/lib/locale-path';
import { GaruLoginModal } from './GaruLoginModal';
import { getLoginUser, getPlanUi, logoutUser, type GaruLoginUser } from '@/lib/baby-api';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [user, setUser] = useState<GaruLoginUser | null>(null);
    const pathname = usePathname();

    const currentLocale = detectLocaleFromPathname(pathname);
    const dict = getDictionary(currentLocale);
    const pg = (path: string) => localizePath(path, currentLocale);

    useEffect(() => {
        const checkLogin = async () => {
            const u = await getLoginUser();
            if (u) {
                sessionStorage.setItem('isLogin', 'true');
                sessionStorage.setItem('garoopLoginUserId', u.id);
                setIsLogin(true);
                setUser(u);
            } else {
                sessionStorage.removeItem('isLogin');
                setIsLogin(false);
                setUser(null);
            }
        };
        checkLogin();
        const handler = () => { checkLogin(); };
        window.addEventListener('garu-login', handler);
        return () => window.removeEventListener('garu-login', handler);
    }, []);

    const planUi = getPlanUi(user?.planType);

    const handleLogout = useCallback(async () => {
        sessionStorage.removeItem('isLogin');
        sessionStorage.removeItem('garoopLoginUserId');
        await logoutUser();
        setIsLogin(false);
        setUser(null);
        window.dispatchEvent(new CustomEvent('garu-login'));
    }, []);

    const closeMenu = useCallback(() => setIsMenuOpen(false), []);

    // Close on Escape, lock body scroll while open
    useEffect(() => {
        if (!isMenuOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu(); };
        document.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [isMenuOpen, closeMenu]);

    const navItems: { href: string; label: string; icon: string }[] = [
        { href: pg('/'), label: dict.common.home, icon: '🏠' },
        { href: pg('/novels'), label: dict.common.news, icon: '📚' },
        { href: pg('/about'), label: dict.common.about, icon: '🪶' },
        { href: pg('/contact'), label: dict.common.contact, icon: '✉️' },
    ];

    return (
        <>
            {showLogin && (
                <GaruLoginModal
                    onClose={() => setShowLogin(false)}
                    onLogin={(u) => { setUser(u); setIsLogin(true); setShowLogin(false); }}
                />
            )}

            <header
                className="sticky top-0 z-40 border-b border-amber-200/15 backdrop-blur-md"
                style={{ background: 'linear-gradient(180deg, rgba(10,8,7,0.92) 0%, rgba(10,8,7,0.78) 100%)' }}
            >
                <div className="container mx-auto px-3 sm:px-4 py-3 flex items-center gap-3">
                    {/* Hamburger (PC: left) */}
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen(true)}
                        aria-label="Open menu"
                        aria-expanded={isMenuOpen}
                        className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-md border border-amber-200/20 bg-stone-900/60 hover:bg-stone-900/80 hover:border-amber-200/40 transition-colors"
                    >
                        <span className="sr-only">Open menu</span>
                        <div className="flex flex-col gap-1.25">
                            <span className="block w-5 h-0.5 bg-amber-200 rounded-full"></span>
                            <span className="block w-5 h-0.5 bg-amber-200 rounded-full"></span>
                            <span className="block w-5 h-0.5 bg-amber-200 rounded-full"></span>
                        </div>
                    </button>

                    {/* Logo */}
                    <Link href={pg('/')} className="flex items-center gap-2 group">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xl text-amber-200 border border-amber-300/30 bg-amber-400/10">
                            🕯️
                        </div>
                        <span className="font-serif text-lg sm:text-xl font-bold text-amber-100 tracking-wider group-hover:text-amber-200 transition-colors">
                            {dict.hero.title}
                        </span>
                    </Link>

                    <div className="ml-auto flex items-center gap-2 sm:gap-3">
                        {isLogin && user && (
                            <a
                                href="https://www.ai-garoop-interactive.com/plan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`hidden sm:inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-black tracking-[0.2em] ${planUi.className}`}
                            >
                                <span>{planUi.emoji}</span>{planUi.label}
                            </a>
                        )}
                        {isLogin ? (
                            <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/60 border border-amber-200/15 text-amber-50/80 text-xs font-serif">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                {user?.name ?? 'Reader'}
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setShowLogin(true)}
                                aria-label={currentLocale === 'ja' ? 'ログイン' : 'Sign in'}
                                className="relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-amber-200/30 bg-stone-900/60 hover:bg-stone-900/80 hover:border-amber-200/60 text-amber-200 transition-colors"
                            >
                                {/* lucide log-in icon */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                    <polyline points="10 17 15 12 10 7" />
                                    <line x1="15" x2="3" y1="12" y2="12" />
                                </svg>
                                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-zinc-500 border-2 border-[#0a0807]" />
                            </button>
                        )}

                        {/* Hamburger (Mobile: right) */}
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(true)}
                            aria-label="Open menu"
                            aria-expanded={isMenuOpen}
                            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-amber-200/20 bg-stone-900/60 hover:bg-stone-900/80 hover:border-amber-200/40 transition-colors"
                        >
                            <span className="sr-only">Open menu</span>
                            <div className="flex flex-col gap-1.25">
                                <span className="block w-5 h-0.5 bg-amber-200 rounded-full"></span>
                                <span className="block w-5 h-0.5 bg-amber-200 rounded-full"></span>
                                <span className="block w-5 h-0.5 bg-amber-200 rounded-full"></span>
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            {/* Side Drawer (left) */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="drawer-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={closeMenu}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                            aria-hidden
                        />

                        {/* Drawer panel */}
                        <motion.aside
                            key="drawer-panel"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Site menu"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                            className="fixed top-0 left-0 z-60 h-full w-[88%] max-w-[320px] flex flex-col"
                            style={{
                                background:
                                    'linear-gradient(180deg, #100b0a 0%, #0a0807 60%, #100b0a 100%)',
                                boxShadow: '20px 0 60px rgba(0,0,0,0.7)',
                                borderRight: '1px solid rgba(217,180,120,0.18)',
                            }}
                        >
                            {/* Drawer header */}
                            <div className="flex items-center gap-3 p-4 border-b border-amber-200/12">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl text-amber-200 border border-amber-300/30 bg-amber-400/10">
                                    🕯️
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-serif text-amber-100 text-base leading-none">
                                        {dict.hero.title}
                                    </p>
                                    <p className="mt-1 font-serif text-amber-200/60 text-[11px] tracking-[0.25em] uppercase">
                                        Garoop 文庫
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeMenu}
                                    aria-label="Close menu"
                                    className="w-9 h-9 rounded-md border border-amber-200/20 bg-stone-900/40 hover:bg-stone-900/70 text-amber-200 flex items-center justify-center text-lg"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* User block */}
                            {isLogin && user && (
                                <div className="px-4 py-3 border-b border-amber-200/10 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-stone-900/70 border border-amber-200/20 flex items-center justify-center text-lg text-amber-200">
                                        {user.iconPath ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={user.iconPath} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            '👤'
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-serif text-amber-50 text-sm truncate">{user.name}</p>
                                        <a
                                            href="https://www.ai-garoop-interactive.com/plan"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black tracking-[0.2em] ${planUi.className}`}
                                        >
                                            <span>{planUi.emoji}</span>{planUi.label}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Featured CTA: 育てる */}
                            <div className="px-4 pt-4">
                                <a
                                    href="https://baby.garoop.jp/"
                                    onClick={closeMenu}
                                    className="group block rounded-2xl px-4 py-3 text-white shadow-lg transition-transform hover:-translate-y-0.5"
                                    style={{
                                        background:
                                            'linear-gradient(135deg, #f472b6 0%, #fb7185 50%, #d946ef 100%)',
                                        boxShadow:
                                            '0 12px 30px -10px rgba(244,114,182,0.55), inset 0 0 0 1px rgba(255,255,255,0.18)',
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl leading-none">👶</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-serif font-black text-sm leading-tight">
                                                育てる・調教・産む
                                            </p>
                                            <p className="font-serif text-white/85 text-[11px] mt-0.5">
                                                マイベイビーをそだてる
                                            </p>
                                        </div>
                                        <span className="text-white/80 text-lg leading-none group-hover:translate-x-0.5 transition-transform">→</span>
                                    </div>
                                </a>
                            </div>

                            {/* Nav list */}
                            <nav className="flex-1 overflow-y-auto px-2 py-4">
                                <ul className="flex flex-col gap-1">
                                    {navItems.map((item) => {
                                        const active = pathname === item.href ||
                                            (item.href !== pg('/') && pathname.startsWith(item.href));
                                        return (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    onClick={closeMenu}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-serif text-base transition-colors ${active
                                                        ? 'bg-amber-300/15 text-amber-100 border border-amber-200/25'
                                                        : 'text-amber-50/85 hover:bg-stone-100/5 border border-transparent'
                                                        }`}
                                                >
                                                    <span className="text-xl w-6 text-center">{item.icon}</span>
                                                    <span className="flex-1">{item.label}</span>
                                                    {active && <span className="text-amber-200/60 text-xs">●</span>}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>

                                <div className="my-4 mx-3 border-t border-amber-200/10" />

                                {/* Language */}
                                <div className="px-4 py-2">
                                    <p className="font-serif text-amber-200/60 text-[10px] tracking-[0.3em] uppercase mb-2">
                                        Language
                                    </p>
                                    <div className="text-amber-50">
                                        <LanguageSwitcher />
                                    </div>
                                </div>
                            </nav>

                            {/* Footer of drawer */}
                            <div className="p-4 border-t border-amber-200/10 flex flex-col gap-2">
                                {isLogin ? (
                                    <button
                                        type="button"
                                        onClick={() => { handleLogout(); closeMenu(); }}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-stone-900/60 border border-amber-200/15 text-amber-50/85 hover:bg-stone-900/80 font-serif text-sm transition"
                                    >
                                        <span>🚪</span>
                                        <span>{currentLocale === 'ja' ? 'ログアウト' : 'Sign out'}</span>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => { setShowLogin(true); closeMenu(); }}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-amber-300 hover:bg-amber-200 text-stone-900 font-serif text-sm font-bold transition shadow"
                                    >
                                        <span>📖</span>
                                        <span>{currentLocale === 'ja' ? 'ログイン' : 'Sign in'}</span>
                                    </button>
                                )}

                                <p className="text-amber-200/45 text-[10px] tracking-[0.2em] uppercase font-serif text-center mt-1">
                                    © Garoop · 夜の書架
                                </p>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
