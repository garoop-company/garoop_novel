"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// --- Types ---
type View = 'main' | 'box_zoom' | 'door_zoom' | 'shelf_zoom';
type Item = 'key' | 'flashlight' | 'paper';

export default function EscapeGame() {
    const [view, setView] = useState<View>('main');
    const [inventory, setInventory] = useState<Item[]>([]);
    const [message, setMessage] = useState('へやから だっしゅつ しよう！');
    const [isBoxOpen, setIsBoxOpen] = useState(false);
    const [isDoorOpen, setIsDoorOpen] = useState(false);
    const [isDark, setIsDark] = useState(true);

    const addToInventory = (item: Item) => {
        if (!inventory.includes(item)) {
            setInventory([...inventory, item]);
            setMessage(`${getItemName(item)} を 手に入れた！`);
        }
    };

    const getItemName = (item: Item) => {
        switch (item) {
            case 'key': return 'きんの カギ';
            case 'flashlight': return 'かいちゅうでんとう';
            case 'paper': return 'なぞの メモ';
            default: return 'アイテム';
        }
    };

    const handleObjectClick = (obj: string) => {
        if (isDoorOpen) return;

        switch (obj) {
            case 'door':
                if (inventory.includes('key')) {
                    setIsDoorOpen(true);
                    setMessage('カギで ドアが あいた！ だっしゅつ せいこう！');
                } else {
                    setView('door_zoom');
                    setMessage('ドアには カギが かかっている...');
                }
                break;
            case 'box':
                setView('box_zoom');
                setMessage('あやしい はこ があるぞ...');
                break;
            case 'shelf':
                setView('shelf_zoom');
                setMessage('たな のしたに なにか あるかも？');
                break;
            case 'switch':
                setIsDark(!isDark);
                setMessage(isDark ? 'でんきが ついた！' : 'まっくらに なった...');
                break;
            case 'bed':
                if (isDark && !inventory.includes('flashlight')) {
                    addToInventory('flashlight');
                    setMessage('ベッドのしたで かいちゅうでんとう をみつけた！');
                } else {
                    setMessage('ベッドは ふかふかだ。');
                }
                break;
        }
    };

    const handleBack = () => {
        setView('main');
        setMessage('へやの ぜんたい だ。');
    };

    return (
        <div className={`min-h-screen font-sans transition-colors duration-1000 ${isDark ? 'bg-slate-900 text-gray-300' : 'bg-yellow-50 text-gray-800'}`}>

            {/* Header */}
            <div className="p-4 flex justify-between items-center bg-black/20 backdrop-blur-md fixed top-0 w-full z-50">
                <Link href="/game" className="bg-white text-black px-4 py-2 rounded-full font-bold hover:bg-gray-200">
                    ← もどる
                </Link>
                <h1 className="text-xl font-bold text-white">脱出！ ガルちゃんのへや</h1>
                <div className="w-20"></div>
            </div>

            {/* Main Game Area */}
            <div className="container mx-auto h-screen flex flex-col items-center justify-center pt-16 relative overflow-hidden">

                {/* Room Visual */}
                <div className="relative w-full max-w-3xl aspect-video bg-white rounded-2xl shadow-2xl overflow-hidden border-8 border-gray-800">

                    {/* MAIN VIEW */}
                    {view === 'main' && (
                        <div className={`w-full h-full relative transition-colors duration-1000 ${isDark ? 'bg-slate-800' : 'bg-blue-100'}`}>
                            {/* Wall Pattern */}
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                            {/* Door */}
                            <button
                                onClick={() => handleObjectClick('door')}
                                className={`absolute top-1/4 left-1/4 w-32 h-64 border-4 border-gray-600 ${isDoorOpen ? 'bg-black' : 'bg-orange-800'} transform hover:scale-105 transition-transform`}
                            >
                                {isDoorOpen ? (
                                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-center">
                                        EXIT<br />✨
                                    </div>
                                ) : (
                                    <div className="absolute right-2 top-1/2 w-4 h-4 bg-yellow-500 rounded-full shadow-sm"></div>
                                )}
                            </button>

                            {/* Shelf */}
                            <button
                                onClick={() => handleObjectClick('shelf')}
                                className="absolute bottom-0 right-1/4 w-40 h-48 bg-amber-700 border-t-4 border-amber-900 flex flex-col justify-end p-2 hover:brightness-110"
                            >
                                <div className="w-full h-2 bg-black/20 mb-8"></div>
                                <div className="w-full h-2 bg-black/20 mb-8"></div>
                            </button>

                            {/* Box (on shelf) */}
                            <button
                                onClick={() => handleObjectClick('box')}
                                className="absolute bottom-32 right-[28%] w-16 h-12 bg-purple-600 rounded shadow-md hover:scale-110 transition-transform"
                            >
                                <span className="text-xs text-white">BOX</span>
                            </button>

                            {/* Bed */}
                            <button
                                onClick={() => handleObjectClick('bed')}
                                className="absolute bottom-10 left-10 w-64 h-32 bg-blue-400 rounded-lg border-b-8 border-blue-600 hover:brightness-110"
                            >
                                <div className="absolute -top-4 left-4 w-20 h-12 bg-white rounded-full shadow-sm"></div>
                            </button>

                            {/* Light Switch */}
                            <button
                                onClick={() => handleObjectClick('switch')}
                                className="absolute top-1/3 right-10 w-8 h-12 bg-white border-2 border-gray-300 rounded shadow-sm hover:bg-gray-100 flex items-center justify-center"
                            >
                                <div className={`w-4 h-6 bg-gray-800 rounded-sm ${isDark ? 'mt-2' : 'mb-2'}`}></div>
                            </button>

                            {/* Darkness Overlay */}
                            {isDark && (
                                <div className="absolute inset-0 bg-black/80 pointer-events-none flex items-center justify-center text-white font-bold text-2xl">
                                    くらい... なにも みえない...
                                </div>
                            )}
                        </div>
                    )}

                    {/* ZOOM VIEWS */}
                    {view === 'box_zoom' && (
                        <div className="w-full h-full bg-purple-200 flex flex-col items-center justify-center p-8">
                            <div className="w-64 h-48 bg-purple-600 rounded-xl shadow-2xl flex items-center justify-center relative">
                                {isBoxOpen ? (
                                    <div className="text-center">
                                        <p className="text-white font-bold mb-2">なかが からっぽ だ！</p>
                                        {!inventory.includes('key') && (
                                            <button
                                                onClick={() => addToInventory('key')}
                                                className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold animate-bounce"
                                            >
                                                カギ を ひろう
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            if (inventory.includes('paper')) { // Need code? Nah, just click for kids
                                                setIsBoxOpen(true);
                                                setMessage('はこが あいた！');
                                            } else {
                                                setMessage('かたくて あかない... 「ヒント」が いるかも？');
                                            }
                                        }}
                                        className="text-white font-bold text-2xl hover:scale-110 transition-transform"
                                    >
                                        🔒 OPEN
                                    </button>
                                )}
                            </div>
                            <button onClick={handleBack} className="mt-8 bg-gray-500 text-white px-6 py-2 rounded-full">もどる</button>
                        </div>
                    )}

                    {view === 'shelf_zoom' && (
                        <div className="w-full h-full bg-amber-100 flex flex-col items-center justify-center p-8">
                            <div className="w-full max-w-md h-64 bg-amber-800 rounded shadow-inner relative">
                                {/* Hidden Paper */}
                                {!inventory.includes('paper') && (
                                    <button
                                        onClick={() => addToInventory('paper')}
                                        className="absolute bottom-4 right-4 w-12 h-16 bg-white shadow rotate-12 hover:scale-110 transition-transform flex items-center justify-center text-[8px]"
                                    >
                                        MEMO
                                    </button>
                                )}
                            </div>
                            <p className="mt-4 text-amber-900 font-bold">たなの したの ほうだ。</p>
                            <button onClick={handleBack} className="mt-8 bg-gray-500 text-white px-6 py-2 rounded-full">もどる</button>
                        </div>
                    )}

                    {view === 'door_zoom' && (
                        <div className="w-full h-full bg-blue-50 flex flex-col items-center justify-center p-8">
                            <div className="w-48 h-80 bg-orange-800 border-8 border-gray-700 relative shadow-2xl">
                                <div className="absolute right-4 top-1/2 w-6 h-6 bg-yellow-500 rounded-full shadow-lg"></div>
                            </div>
                            <p className="mt-4 font-bold">カギが かかっている。</p>
                            <button onClick={handleBack} className="mt-8 bg-gray-500 text-white px-6 py-2 rounded-full">もどる</button>
                        </div>
                    )}

                    {/* Message Overlay */}
                    <div className="absolute bottom-0 left-0 w-full bg-black/70 text-white p-4 text-center backdrop-blur-sm">
                        <p className="text-lg font-bold">{message}</p>
                    </div>

                    {/* Success Overlay */}
                    {isDoorOpen && view === 'main' && (
                        <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-50">
                            <h2 className="text-5xl font-black text-orange-500 mb-4">だっしゅつ せいこう！</h2>
                            <p className="text-2xl text-gray-700 mb-8">おめでとう！</p>
                            <Link href="/game" className="bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-xl hover:bg-blue-600 shadow-lg">
                                ゲームいちらんへ
                            </Link>
                        </div>
                    )}
                </div>

                {/* Inventory Bar */}
                <div className="mt-8 bg-white/90 p-4 rounded-2xl shadow-lg flex gap-4 items-center border-4 border-gray-200">
                    <span className="font-bold text-gray-500">もちもの:</span>
                    {inventory.length === 0 && <span className="text-gray-400 text-sm">なし</span>}
                    {inventory.map(item => (
                        <div key={item} className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-2xl shadow-inner" title={getItemName(item)}>
                            {item === 'key' && '🔑'}
                            {item === 'flashlight' && '🔦'}
                            {item === 'paper' && '📄'}
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
