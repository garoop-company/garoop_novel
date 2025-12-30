"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { trackEvent } from '@/lib/ga';

// Game definitions
const GAMES = [
    {
        id: 'poker',
        title: 'ポーカー',
        description: 'カジノで一攫千金！',
        image: '/images/garuchan_poker.png', // New Asset
        color: 'bg-indigo-600',
        url: '/game/poker'
    },
    {
        id: 'mystery',
        title: '名探偵ガルちゃん',
        description: '犯人は誰だ！？',
        image: '/images/garuchan_detective.png', // New Asset
        color: 'bg-gray-800',
        url: '/game/mystery'
    },
    {
        id: 'escape',
        title: '脱出ゲーム',
        description: '密室から脱出せよ！',
        image: '/images/garuchan_escape.png', // New Asset
        color: 'bg-teal-600',
        url: '/game/escape'
    },
    {
        id: 'rpg',
        title: 'ガルちゃんの冒険',
        description: '王道コマンドRPG！',
        image: '/images/garoop_battle.png',
        color: 'bg-pink-600',
        url: '/game/rpg'
    },
    {
        id: 'puzzle',
        title: 'パズル',
        description: '絵合わせパズル！',
        image: '/images/games/puzzle/shipbuilding.png',
        color: 'bg-blue-500',
        url: '/game/puzzle'
    },
    {
        id: 'shooter',
        title: 'シューティング',
        description: '敵を撃ち落とせ！',
        image: '/images/games/shooter/garoop_shooter.png',
        color: 'bg-purple-500',
        url: '/game/shooter'
    },
    {
        id: 'legend',
        title: 'レジェンド・クエスト',
        description: '伝説の勇者になろう！',
        image: '/images/garoop_battle.png',
        color: 'bg-blue-800',
        url: '/game/legend'
    },
    {
        id: 'card',
        title: 'カードバトル',
        description: '最強デッキを作ろう！',
        image: '/images/garoop_battle.png',
        color: 'bg-red-500',
        url: '/game/card'
    },
    {
        id: 'talking',
        title: 'おしゃべりガルちゃん',
        description: '楽しくおしゃべり！',
        image: '/images/garoop_happy.png',
        color: 'bg-yellow-500',
        url: '/game/talking'
    },
    {
        id: 'manzai',
        title: 'ツッコミの達人',
        description: '笑いのセンスを磨け！',
        image: '/images/garoop_happy.png',
        color: 'bg-orange-500',
        url: '/game/manzai'
    },
    {
        id: 'somen',
        title: '流しそうめん',
        description: '夏だ！そうめんだ！',
        image: '/images/garoop_thinking.png',
        color: 'bg-green-500',
        url: '/game/somen'
    },
    {
        id: 'castle',
        title: 'お城探検',
        description: '3Dダンジョン！',
        image: '/images/garoop_battle.png',
        color: 'bg-gray-700',
        url: '/game/castle'
    },
    {
        id: 'slot',
        title: 'サイバースロット',
        description: '大当たりを目指せ！',
        image: '/images/garoop_thinking.png',
        color: 'bg-purple-700',
        url: '/game/slot'
    },
    {
        id: 'movie',
        title: 'ガルちゃんスタジオ',
        description: '映画監督になろう！',
        image: '/images/garoop_battle.png',
        color: 'bg-blue-600',
        url: '/game/movie'
    },
    {
        id: 'anime',
        title: 'ガルちゃんメーカー',
        description: '自分だけのキャラ！',
        image: '/images/garoop_happy.png',
        color: 'bg-indigo-500',
        url: '/game/anime'
    },
    {
        id: 'platformer',
        title: 'スーパーガルちゃん',
        description: 'アクション大冒険！',
        image: '/images/garoop_battle.png',
        color: 'bg-red-600',
        url: '/game/platformer'
    },
    {
        id: 'bomber',
        title: 'ガルちゃんボンバー',
        description: '爆発注意！',
        image: '/images/garoop_battle.png',
        color: 'bg-green-600',
        url: '/game/bomber'
    },
    {
        id: 'crystal',
        title: 'クリスタル F.',
        description: '神秘の冒険へ！',
        image: '/images/garoop_battle.png',
        color: 'bg-blue-600',
        url: '/game/crystal'
    },
    {
        id: 'jungle',
        title: 'ジャングル J.',
        description: '野生の大冒険！',
        image: '/images/garoop_battle.png',
        color: 'bg-orange-700',
        url: '/game/jungle'
    },
    {
        id: 'sky',
        title: 'スカイ・ライダー',
        description: '空を駆け抜けろ！',
        image: '/images/garoop_battle.png',
        color: 'bg-sky-500',
        url: '/game/sky'
    }
];

export default function GameHub() {
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
                                    ようこそ！ ガルちゃんランドへ
                                </h2>
                                <p className="text-white text-lg font-bold drop-shadow-md bg-black/30 px-6 py-2 rounded-full backdrop-blur-sm inline-block">
                                    AIと笑いの夢の国！
                                </p>
                            </div>
                        </div>

                    </motion.div>
                </div>

                {/* Attractions Grid (Games) */}
                <div className="w-full max-w-6xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-2 w-10 bg-pink-500 rounded-full"></div>
                        <h3 className="text-3xl font-black text-pink-600 drop-shadow-sm">アトラクション (ゲーム)</h3>
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
