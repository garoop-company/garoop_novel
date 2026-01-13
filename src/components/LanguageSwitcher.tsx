"use client";

import { usePathname, useRouter } from 'next/navigation';
import { locales, Locale } from '@/locales';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGlobe } from 'react-icons/fa';

export default function LanguageSwitcher() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    // Extract current locale from pathname
    const segments = pathname.split('/');
    const currentLocale = (locales.includes(segments[1] as Locale) ? segments[1] : 'ja') as Locale;

    const handleLanguageChange = (newLocale: Locale) => {
        if (newLocale === currentLocale) return;

        const newSegments = [...segments];
        newSegments[1] = newLocale;
        const newPathname = newSegments.join('/') || '/';

        setIsOpen(false);
        router.push(newPathname);
    };

    const getLangLabel = (locale: string) => {
        switch (locale) {
            case 'ja': return '🇯🇵 日本語';
            case 'en': return '🇺🇸 English';
            case 'zh': return '🇨🇳 中文';
            default: return locale;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-full hover:bg-slate-800/90 transition-all text-slate-200 font-bold shadow-sm"
            >
                <FaGlobe className="text-amber-300" />
                <span className="uppercase text-xs">{currentLocale}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-40 bg-slate-950 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden z-50"
                        >
                            <div className="flex flex-col py-2">
                                {locales.map((locale) => (
                                    <button
                                        key={locale}
                                        onClick={() => handleLanguageChange(locale as Locale)}
                                        className={`px-4 py-3 text-left hover:bg-slate-800 transition-colors font-bold text-sm ${currentLocale === locale ? 'text-amber-200 bg-amber-500/10' : 'text-slate-300'
                                            }`}
                                    >
                                        {getLangLabel(locale)}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
