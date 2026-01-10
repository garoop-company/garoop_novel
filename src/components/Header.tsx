"use client";

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/ga';
import { locales, getDictionary, Locale } from '@/locales';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    // Extract current locale
    const segments = pathname.split('/');
    const currentLocale = (locales.includes(segments[1] as Locale) ? segments[1] : 'ja') as Locale;
    const dict = getDictionary(currentLocale);

    const pg = (path: string) => `/${currentLocale}${path === '/' ? '' : path}`;

    return (
        <header className="bg-white/80 backdrop-blur-md border-b-4 border-pink-400 sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                        🎡
                    </div>
                    <Link href={pg('/')} className="text-xl md:text-2xl font-black text-pink-600 tracking-wider hover:text-pink-400 transition-colors">
                        {dict.hero.title}
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex gap-6 font-bold text-gray-600 items-center">
                    <Link href={pg('/')} className="hover:text-pink-500 transition-colors py-2">
                        {dict.common.home}
                    </Link>
                    <Link href={pg('/novels')} className="hover:text-pink-500 transition-colors py-2">
                        {dict.common.news}
                    </Link>
                    <Link
                        href={pg('/game')}
                        className="bg-gradient-to-r from-pink-500 to-orange-400 text-white px-5 py-2 rounded-full hover:shadow-lg hover:scale-105 transition-all"
                        onClick={() =>
                            trackEvent("cta_click", {
                                cta_label: "play_games",
                                cta_location: "header_nav",
                                cta_target: "/game",
                            })
                        }
                    >
                        {dict.common.games} 🎮
                    </Link>
                    <Link href={pg('/about')} className="hover:text-pink-500 transition-colors py-2">
                        {dict.common.about}
                    </Link>
                    <Link href={pg('/contact')} className="hover:text-pink-500 transition-colors py-2 text-sm">
                        {dict.common.contact}
                    </Link>

                    <div className="ml-2">
                        <LanguageSwitcher />
                    </div>
                </nav>

                {/* Mobile Menu Button / Language Switcher */}
                <div className="flex items-center gap-3">
                    <div className="md:hidden">
                        <LanguageSwitcher />
                    </div>
                    <button
                        className="md:hidden p-2 focus:outline-none"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <div className="w-6 h-0.5 bg-pink-500 mb-1.5"></div>
                        <div className="w-6 h-0.5 bg-pink-500 mb-1.5"></div>
                        <div className="w-6 h-0.5 bg-pink-500"></div>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <nav className="md:hidden bg-white border-t border-pink-100">
                    <div className="flex flex-col p-4 space-y-4 font-bold text-gray-600">
                        <Link
                            href={pg('/')}
                            className="hover:text-pink-500 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {dict.common.home}
                        </Link>
                        <Link
                            href={pg('/novels')}
                            className="hover:text-pink-500 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {dict.common.news}
                        </Link>
                        <Link
                            href={pg('/game')}
                            className="text-pink-500"
                            onClick={() => {
                                trackEvent("cta_click", {
                                    cta_label: "play_games",
                                    cta_location: "header_nav_mobile",
                                    cta_target: "/game",
                                });
                                setIsMenuOpen(false);
                            }}
                        >
                            {dict.common.games} 🎮
                        </Link>
                        <Link
                            href={pg('/about')}
                            className="hover:text-pink-500 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {dict.common.about}
                        </Link>
                        <Link
                            href={pg('/contact')}
                            className="hover:text-pink-500 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {dict.common.contact}
                        </Link>
                    </div>
                </nav>
            )}
        </header>
    );
}
