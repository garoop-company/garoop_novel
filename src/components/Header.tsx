"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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

    const handleLogout = async () => {
        sessionStorage.removeItem('isLogin');
        sessionStorage.removeItem('garoopLoginUserId');
        await logoutUser();
        setIsLogin(false);
        setUser(null);
        window.dispatchEvent(new CustomEvent('garu-login'));
    };

    return (
        <>
            {showLogin && (
                <GaruLoginModal
                    onClose={() => setShowLogin(false)}
                    onLogin={(u) => { setUser(u); setIsLogin(true); setShowLogin(false); }}
                />
            )}

            <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-[0_1px_0_rgba(255,255,255,0.04)]">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-amber-400/10 border border-amber-300/30 rounded-full flex items-center justify-center text-2xl text-amber-200 shadow-lg">
                            🕯️
                        </div>
                        <Link href={pg('/')} className="text-xl md:text-2xl font-black text-amber-200 tracking-wider hover:text-amber-100 transition-colors">
                            {dict.hero.title}
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex gap-6 font-bold text-slate-200 items-center">
                        <Link href={pg('/')} className="hover:text-amber-200 transition-colors py-2">{dict.common.home}</Link>
                        <Link href={pg('/novels')} className="hover:text-amber-200 transition-colors py-2">{dict.common.news}</Link>
                        <Link href={pg('/about')} className="hover:text-amber-200 transition-colors py-2">{dict.common.about}</Link>
                        <Link href={pg('/contact')} className="hover:text-amber-200 transition-colors py-2 text-sm">{dict.common.contact}</Link>
                        <a
                            href="https://baby.garoop.jp/"
                            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 hover:from-pink-500 hover:to-fuchsia-500 rounded-full px-3 py-1.5 text-xs font-black text-white shadow-md hover:scale-105 transition-all"
                            aria-label="赤ちゃんを育てに行く"
                        >
                            <span aria-hidden="true">👶</span>
                            育てる・調教・産む
                        </a>
                        <div className="ml-2"><LanguageSwitcher /></div>

                        {isLogin && user && (
                            <a
                                href="https://www.ai-garoop-interactive.com/plan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`rounded-full border px-4 py-2 text-sm font-black tracking-[0.2em] ${planUi.className}`}
                            >
                                <span className="mr-1">{planUi.emoji}</span>{planUi.label}
                            </a>
                        )}

                        {isLogin ? (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all"
                            >
                                ログアウト
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowLogin(true)}
                                className="bg-gradient-to-r from-pink-500 via-rose-500 to-yellow-500 text-white font-black py-2 px-4 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.4)] text-sm"
                            >
                                ログイン
                            </button>
                        )}
                    </nav>

                    {/* Mobile */}
                    <div className="flex items-center gap-3">
                        <div className="md:hidden"><LanguageSwitcher /></div>
                        {!isLogin && (
                            <button
                                onClick={() => setShowLogin(true)}
                                className="md:hidden bg-gradient-to-r from-pink-500 to-yellow-500 text-white font-black py-1.5 px-3 rounded-full text-xs"
                            >
                                ログイン
                            </button>
                        )}
                        {isLogin && (
                            <a
                                href="https://www.ai-garoop-interactive.com/plan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`md:hidden rounded-full border px-3 py-1 text-xs font-black ${planUi.className}`}
                            >
                                {planUi.emoji} {planUi.label}
                            </a>
                        )}
                        <button
                            className="md:hidden p-2 focus:outline-none"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <div className="w-6 h-0.5 bg-amber-300 mb-1.5"></div>
                            <div className="w-6 h-0.5 bg-amber-300 mb-1.5"></div>
                            <div className="w-6 h-0.5 bg-amber-300"></div>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <nav className="md:hidden bg-slate-950 border-t border-slate-800">
                        <div className="flex flex-col p-4 space-y-4 font-bold text-slate-200">
                            <a
                                href="https://baby.garoop.jp/"
                                className="self-start inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-400 rounded-full px-3 py-1.5 text-xs font-black text-white shadow-md"
                                onClick={() => setIsMenuOpen(false)}
                                aria-label="赤ちゃんを育てに行く"
                            >
                                <span aria-hidden="true">👶</span>
                                育てる・調教・産む
                            </a>
                            <Link href={pg('/')} className="hover:text-amber-200 transition-colors" onClick={() => setIsMenuOpen(false)}>{dict.common.home}</Link>
                            <Link href={pg('/novels')} className="hover:text-amber-200 transition-colors" onClick={() => setIsMenuOpen(false)}>{dict.common.news}</Link>
                            <Link href={pg('/about')} className="hover:text-amber-200 transition-colors" onClick={() => setIsMenuOpen(false)}>{dict.common.about}</Link>
                            <Link href={pg('/contact')} className="hover:text-amber-200 transition-colors" onClick={() => setIsMenuOpen(false)}>{dict.common.contact}</Link>
                            {isLogin && (
                                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-left text-slate-400 hover:text-white transition-colors">
                                    ログアウト
                                </button>
                            )}
                        </div>
                    </nav>
                )}
            </header>
        </>
    );
}
