"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaNewspaper, FaFilm } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { getDictionary } from '@/locales';
import { detectLocaleFromPathname, localizePath } from '@/lib/locale-path';

export default function BottomNav() {
    const pathname = usePathname();

    const currentLocale = detectLocaleFromPathname(pathname);
    const dict = getDictionary(currentLocale);

    const NAV_ITEMS = [
        { href: '/', label: dict.common.home, icon: FaHome, color: 'text-amber-300' },
        { href: '/novels', label: dict.common.news, icon: FaNewspaper, color: 'text-teal-300' },
        { href: '/dramas', label: currentLocale === 'ja' ? 'ドラマ' : 'Drama', icon: FaFilm, color: 'text-rose-300' },
    ];

    const pg = (path: string) => localizePath(path, currentLocale);

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-slate-950/90 backdrop-blur-xl border-t border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.4)] px-4 pb-safe-area pt-2">
            <div className="flex justify-around items-center max-w-md mx-auto">
                {NAV_ITEMS.map((item) => {
                    const localizedHref = pg(item.href);
                    const isActive = pathname === localizedHref || (item.href !== '/' && pathname.startsWith(localizedHref));
                    return (
                        <Link key={item.href} href={localizedHref} className="relative group">
                            <div className="flex flex-col items-center py-1 px-4 transition-all duration-300">
                                <div className={`text-2xl mb-1 ${isActive ? item.color : 'text-slate-500 group-hover:text-amber-300'} transition-colors`}>
                                    <item.icon />
                                </div>
                                <span className={`text-[10px] font-black ${isActive ? 'text-slate-200' : 'text-slate-500'} transition-colors`}>
                                    {item.label}
                                </span>

                                {isActive && (
                                    <motion.div
                                        layoutId="bottom-nav-active"
                                        className="absolute -bottom-2 w-8 h-1 bg-amber-300 rounded-full"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
