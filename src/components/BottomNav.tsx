"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaNewspaper } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { locales, getDictionary, Locale } from '@/locales';

export default function BottomNav() {
    const pathname = usePathname();

    // Extract current locale
    const segments = pathname.split('/');
    const currentLocale = (locales.includes(segments[1] as Locale) ? segments[1] : 'ja') as Locale;
    const dict = getDictionary(currentLocale);

    const NAV_ITEMS = [
        { href: '/', label: dict.common.home, icon: FaHome, color: 'text-pink-500' },
        { href: '/novels', label: dict.common.news, icon: FaNewspaper, color: 'text-blue-500' },
    ];

    const pg = (path: string) => `/${currentLocale}${path === '/' ? '' : path}`;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-t-2 border-pink-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-4 pb-safe-area pt-2">
            <div className="flex justify-around items-center max-w-md mx-auto">
                {NAV_ITEMS.map((item) => {
                    const localizedHref = pg(item.href);
                    const isActive = pathname === localizedHref || (item.href !== '/' && pathname.startsWith(localizedHref));
                    return (
                        <Link key={item.href} href={localizedHref} className="relative group">
                            <div className="flex flex-col items-center py-1 px-4 transition-all duration-300">
                                <div className={`text-2xl mb-1 ${isActive ? item.color : 'text-gray-400 group-hover:text-pink-400'} transition-colors`}>
                                    <item.icon />
                                </div>
                                <span className={`text-[10px] font-black ${isActive ? 'text-gray-800' : 'text-gray-400'} transition-colors`}>
                                    {item.label}
                                </span>

                                {isActive && (
                                    <motion.div
                                        layoutId="bottom-nav-active"
                                        className="absolute -bottom-2 w-8 h-1 bg-pink-400 rounded-full"
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
