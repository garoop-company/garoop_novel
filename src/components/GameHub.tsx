"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { trackEvent } from '@/lib/ga';
import { usePathname } from 'next/navigation';
import { locales, getDictionary, Locale } from '@/locales';

// Game definitions
export default function GameHub() {
    const pathname = usePathname();
    const segments = pathname.split('/');
    const currentLocale = (locales.includes(segments[1] as Locale) ? segments[1] : 'ja') as Locale;
    const dict = getDictionary(currentLocale);

    const pg = (path: string) => `/${currentLocale}${path === '/' ? '' : path}`;

    const GAMES = [
        {
            id: 'startup',
            title: dict.games.startup.title,
            description: dict.games.startup.desc,
            image: '/images/game_startup.png',
            color: 'bg-indigo-700',
            url: pg('/game/startup')
        },
        {
            id: 'poker',
            title: dict.games.poker.title,
            description: dict.games.poker.desc,
            image: '/images/game_poker.png',
            color: 'bg-indigo-600',
            url: pg('/game/poker')
        },
        {
            id: 'mystery',
            title: dict.games.mystery.title,
            description: dict.games.mystery.desc,
            image: '/images/game_mystery.png',
            color: 'bg-gray-800',
            url: pg('/game/mystery')
        },
        {
            id: 'escape',
            title: dict.games.escape.title,
            description: dict.games.escape.desc,
            image: '/images/game_escape.png',
            color: 'bg-teal-600',
            url: pg('/game/escape')
        },
        {
            id: 'rpg',
            title: dict.games.rpg.title,
            description: dict.games.rpg.desc,
            image: '/images/game_rpg.png',
            color: 'bg-pink-600',
            url: pg('/game/rpg')
        },
        {
            id: 'card',
            title: dict.games.card.title,
            description: dict.games.card.desc,
            image: '/images/game_card.png',
            color: 'bg-red-500',
            url: pg('/game/card')
        },
    ];
    const handleGameClick = (gameId: string, url: string) => {
        trackEvent("cta_click", {
            cta_label: `game_${gameId}`,
            cta_location: "game_hub",
            cta_target: url,
        });
    };

    return (
        <div className="min-h-screen bg-sky-200 font-sans overflow-hidden relative">

            {/* Background Sky and Clouds */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-sky-300 via-sky-200 to-green-100">
                <div className="absolute top-10 left-10 w-32 h-16 bg-white/40 blur-xl rounded-full"></div>
                <div className="absolute top-20 right-20 w-48 h-24 bg-white/40 blur-xl rounded-full"></div>
                <div className="absolute bottom-1/3 left-1/4 w-64 h-32 bg-white/30 blur-2xl rounded-full"></div>
            </div>

            {/* Background Sky and Clouds - Provided globally now, but keeping a local override if needed for specific feel, or removing if global is sufficient. 
            Actually, let's keep the specific background for the game hub to match the "Map" feel, but remove the Header/Footer. */}

            {/* Main Content */}
            <main className="relative z-10 container mx-auto p-4 md:p-8 flex flex-col items-center pt-12">

                {/* Map Section (Hero) */}
                <div className="w-full max-w-5xl relative aspect-[16/9] mb-12 group perspective-1000">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
                        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)] border-8 border-white bg-sky-300"
                    >
                        <Image
                            src="/images/garuchan_island_map.png"
                            alt="Garuchan Land Map"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            priority
                        />

                        {/* Map Overlay Text */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end justify-center pb-8 p-4">
                            <div className="text-center">
                                <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] mb-2">
                                    {dict.hero.welcome}
                                </h2>
                                <p className="text-white text-lg font-bold drop-shadow-md bg-black/30 px-6 py-2 rounded-full backdrop-blur-sm inline-block">
                                    {dict.hero.subtitle}
                                </p>
                            </div>
                        </div>

                    </motion.div>
                </div>

                {/* Attractions Grid (Games) */}
                <div className="w-full max-w-6xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-2 w-10 bg-pink-500 rounded-full"></div>
                        <h3 className="text-3xl font-black text-pink-600 drop-shadow-sm">{dict.common.games}</h3>
                        <div className="h-2 flex-grow bg-pink-200 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                        {GAMES.map((game, index) => (
                            <motion.div
                                key={game.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    href={game.url}
                                    className="block group h-full"
                                    onClick={() => handleGameClick(game.id, game.url)}
                                >
                                    <div className="relative h-full bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 hover:scale-102 border-4 border-transparent hover:border-pink-300">

                                        {/* Ticket Stub Design Top */}
                                        <div className="absolute top-0 inset-x-0 h-4 bg-gray-100 z-20 border-b border-dashed border-gray-300"></div>

                                        {/* Image Container */}
                                        <div className="h-48 relative overflow-hidden bg-gray-100 mt-4 mx-4 rounded-2xl shadow-inner">
                                            {game.image.includes('placeholder') ? (
                                                <div className={`w-full h-full flex items-center justify-center text-6xl ${game.color} text-white`}>
                                                    🎮
                                                </div>
                                            ) : (
                                                <Image
                                                    src={game.image}
                                                    alt={game.title}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            )}
                                            {/* Tag */}
                                            <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-black text-white shadow-md ${game.color}`}>
                                                FREE
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 relative">
                                            <h4 className="text-xl font-black text-gray-800 mb-1 group-hover:text-pink-500 transition-colors">
                                                {game.title}
                                            </h4>
                                            <p className="text-gray-500 text-sm font-bold opacity-80">
                                                {game.description}
                                            </p>

                                            <div className="mt-4 flex justify-end">
                                                <span className={`w-10 h-10 rounded-full ${game.color} text-white flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform`}>
                                                    ▶
                                                </span>
                                            </div>
                                        </div>

                                        {/* Ticket Stub Design Bottom */}
                                        <div className="absolute bottom-0 inset-x-0 h-2 bg-gray-100/50"></div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
}
