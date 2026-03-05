"use client";

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { getDictionary } from '@/locales';
import LanguageSwitcher from './LanguageSwitcher';
import { detectLocaleFromPathname, localizePath } from '@/lib/locale-path';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const currentLocale = detectLocaleFromPathname(pathname);
    const dict = getDictionary(currentLocale);

    const pg = (path: string) => localizePath(path, currentLocale);

    return (
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
                    <Link href={pg('/')} className="hover:text-amber-200 transition-colors py-2">
                        {dict.common.home}
                    </Link>
                    <Link href={pg('/novels')} className="hover:text-amber-200 transition-colors py-2">
                        {dict.common.news}
                    </Link>
                    <Link href={pg('/about')} className="hover:text-amber-200 transition-colors py-2">
                        {dict.common.about}
                    </Link>
                    <Link href={pg('/contact')} className="hover:text-amber-200 transition-colors py-2 text-sm">
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
                        <Link
                            href={pg('/')}
                            className="hover:text-amber-200 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {dict.common.home}
                        </Link>
                        <Link
                            href={pg('/novels')}
                            className="hover:text-amber-200 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {dict.common.news}
                        </Link>
                        <Link
                            href={pg('/about')}
                            className="hover:text-amber-200 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {dict.common.about}
                        </Link>
                        <Link
                            href={pg('/contact')}
                            className="hover:text-amber-200 transition-colors"
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
