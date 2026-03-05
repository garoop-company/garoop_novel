"use client";

import { usePathname, useRouter } from 'next/navigation';
import { locales, Locale, localeMeta } from '@/locales';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGlobe } from 'react-icons/fa';
import { detectLocaleFromPathname, switchLocalePath } from '@/lib/locale-path';

export default function LanguageSwitcher() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const currentLocale = detectLocaleFromPathname(pathname);

    const handleLanguageChange = (newLocale: Locale) => {
        if (newLocale === currentLocale) return;

        const newPathname = switchLocalePath(pathname, newLocale);

        setIsOpen(false);
        router.push(newPathname);
    };

    const currentMeta = localeMeta[currentLocale];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-full hover:bg-slate-800/90 transition-all text-slate-200 font-bold shadow-sm"
            >
                <FaGlobe className="hidden sm:block text-amber-300" />
                <span className="text-base leading-none">{currentMeta.flag}</span>
                <span className="hidden sm:inline text-xs">{currentMeta.label}</span>
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
                            className="absolute right-0 mt-2 w-20 sm:w-56 bg-slate-950 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden z-50"
                        >
                            <div className="flex flex-col py-2">
                                {locales.map((locale) => (
                                    <button
                                        key={locale}
                                        onClick={() => handleLanguageChange(locale as Locale)}
                                        className={`px-4 py-3 text-center sm:text-left hover:bg-slate-800 transition-colors font-bold text-sm ${currentLocale === locale ? 'text-amber-200 bg-amber-500/10' : 'text-slate-300'
                                            }`}
                                    >
                                        <span className="text-base leading-none">{localeMeta[locale].flag}</span>
                                        <span className="hidden sm:inline ml-2">{localeMeta[locale].label}</span>
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
