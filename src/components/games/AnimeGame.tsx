"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// --- Data ---
const PARTS = {
    bg: [
        { id: 'bg1', name: '教室', color: 'bg-yellow-100' },
        { id: 'bg2', name: '異世界', color: 'bg-purple-200' },
        { id: 'bg3', name: 'ステージ', color: 'bg-pink-200' },
        { id: 'bg4', name: 'サイバー', color: 'bg-slate-800' },
    ],
    body: [
        { id: 'normal', name: 'ノーマル', image: '/images/garoop_happy.png' },
        { id: 'cool', name: 'クール', image: '/images/garoop_thinking.png' },
        { id: 'battle', name: 'バトル', image: '/images/garoop_battle.png' },
    ],
    accessory: [
        { id: 'none', name: 'なし', icon: '🚫' },
        { id: 'glasses', name: 'メガネ', icon: '👓' },
        { id: 'ribbon', name: 'リボン', icon: '🎀' },
        { id: 'sword', name: '剣', icon: '⚔️' },
        { id: 'mic', name: 'マイク', icon: '🎤' },
    ],
    effect: [
        { id: 'none', name: 'なし', icon: '🚫' },
        { id: 'sparkle', name: 'キラキラ', icon: '✨' },
        { id: 'fire', name: '炎', icon: '🔥' },
        { id: 'music', name: '音符', icon: '🎵' },
    ]
};

export default function AnimeGame() {
    const [selection, setSelection] = useState({
        bg: PARTS.bg[0],
        body: PARTS.body[0],
        accessory: PARTS.accessory[0],
        effect: PARTS.effect[0],
    });

    const [isPublished, setIsPublished] = useState(false);

    const handleSelect = (category: keyof typeof PARTS, item: any) => {
        setSelection(prev => ({ ...prev, [category]: item }));
        setIsPublished(false);
    };

    return (
        <div className="min-h-screen bg-indigo-50 font-sans text-gray-800 flex flex-col items-center p-4 relative">

            {/* Header */}
            <div className="absolute top-4 left-4 z-20">
                <Link href="/game" className="bg-white text-indigo-600 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-50 transition-colors">
                    ← もどる
                </Link>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-indigo-700 mb-8 mt-16 drop-shadow-sm">
                🎨 ガルちゃん メーカー
            </h1>

            <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl">

                {/* Preview Area */}
                <div className="flex-1 flex flex-col items-center">
                    <div className={`w-80 h-80 md:w-96 md:h-96 rounded-3xl shadow-2xl border-8 border-white relative overflow-hidden transition-colors duration-500 ${selection.bg.color} flex items-center justify-center`}>

                        {/* Body */}
                        <div className="w-3/4 h-3/4 relative z-10">
                            <Image src={selection.body.image} alt="Body" fill className="object-contain" />
                        </div>

                        {/* Accessory (Overlay) */}
                        {selection.accessory.id !== 'none' && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                                <span className="text-8xl drop-shadow-lg transform -translate-y-10 translate-x-10">
                                    {selection.accessory.icon}
                                </span>
                            </div>
                        )}

                        {/* Effect (Overlay) */}
                        {selection.effect.id !== 'none' && (
                            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-pulse">
                                <span className="text-9xl opacity-70">
                                    {selection.effect.icon}
                                </span>
                            </div>
                        )}

                    </div>

                    {isPublished && (
                        <div className="mt-8 bg-white p-6 rounded-xl shadow-lg text-center animate-in slide-in-from-bottom">
                            <p className="text-gray-500 font-bold mb-2">みんなの反応</p>
                            <div className="flex gap-4 justify-center text-2xl font-black text-pink-500">
                                <span>❤️ 12.5k</span>
                                <span>🔁 5.2k</span>
                            </div>
                            <p className="mt-2 text-indigo-600 font-bold">「神キャラきたー！」「推せる！」</p>
                        </div>
                    )}
                </div>

                {/* Controls Area */}
                <div className="flex-1 bg-white p-6 rounded-3xl shadow-xl h-fit">

                    {/* BG Selector */}
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-500 mb-2">はいけい</h3>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {PARTS.bg.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelect('bg', item)}
                                    className={`px-4 py-2 rounded-full whitespace-nowrap border-2 ${selection.bg.id === item.id ? 'border-indigo-500 bg-indigo-100' : 'border-gray-200'}`}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Body Selector */}
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-500 mb-2">ポーズ</h3>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {PARTS.body.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelect('body', item)}
                                    className={`px-4 py-2 rounded-full whitespace-nowrap border-2 ${selection.body.id === item.id ? 'border-indigo-500 bg-indigo-100' : 'border-gray-200'}`}
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Accessory Selector */}
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-500 mb-2">アイテム</h3>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {PARTS.accessory.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelect('accessory', item)}
                                    className={`px-4 py-2 rounded-full whitespace-nowrap border-2 ${selection.accessory.id === item.id ? 'border-indigo-500 bg-indigo-100' : 'border-gray-200'}`}
                                >
                                    {item.icon} {item.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Effect Selector */}
                    <div className="mb-8">
                        <h3 className="font-bold text-gray-500 mb-2">エフェクト</h3>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {PARTS.effect.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelect('effect', item)}
                                    className={`px-4 py-2 rounded-full whitespace-nowrap border-2 ${selection.effect.id === item.id ? 'border-indigo-500 bg-indigo-100' : 'border-gray-200'}`}
                                >
                                    {item.icon} {item.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => setIsPublished(true)}
                        className="w-full bg-pink-500 text-white py-4 rounded-xl font-black text-xl hover:bg-pink-600 shadow-lg transition-transform hover:scale-105 active:scale-95"
                    >
                        とうこう する！ (シェア)
                    </button>

                </div>

            </div>

        </div>
    );
}
