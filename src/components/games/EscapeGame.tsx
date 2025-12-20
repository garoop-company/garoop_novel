"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

// --- Types ---
type View = 'main' | 'box_zoom' | 'door_zoom' | 'shelf_zoom' | 'intro' | 'success';
type Item = 'key' | 'flashlight' | 'paper';

export default function EscapeGame() {
    const [view, setView] = useState<View>('intro');
    const [inventory, setInventory] = useState<Item[]>([]);
    const [message, setMessage] = useState('あやしい へや に とじこめられた！');
    const [isBoxOpen, setIsBoxOpen] = useState(false);
    const [isDoorOpen, setIsDoorOpen] = useState(false);
    const [isDark, setIsDark] = useState(true);

    // Audio effect simulation (visual only for now)
    const [shake, setShake] = useState(false);

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const addToInventory = (item: Item) => {
        if (!inventory.includes(item)) {
            setInventory([...inventory, item]);
            setMessage(`${getItemName(item)} を 手に入れた！`);
            triggerShake();
        }
    };

    const getItemName = (item: Item) => {
        switch (item) {
            case 'key': return '金のカギ';
            case 'flashlight': return '懐中電灯';
            case 'paper': return '謎のメモ';
            default: return 'アイテム';
        }
    };

    const handleObjectClick = (obj: string) => {
        if (isDoorOpen) return;

        switch (obj) {
            case 'door':
                if (inventory.includes('key')) {
                    setIsDoorOpen(true);
                    setMessage('カギで ドアが あいた！ 脱出成功！');
                    setTimeout(() => setView('success'), 1500);
                } else {
                    setView('door_zoom');
                    setMessage('ドアには カギが かかっている...');
                }
                break;
            case 'box':
                setView('box_zoom');
                setMessage('あやしい 宝箱 があるぞ...');
                break;
            case 'shelf':
                setView('shelf_zoom');
                setMessage('本棚だ。 何か ありそうだ。');
                break;
            case 'switch':
                setIsDark(!isDark);
                setMessage(isDark ? '電気が ついた！' : '真っ暗に なった...');
                break;
            case 'bed':
                if (isDark && !inventory.includes('flashlight')) {
                    addToInventory('flashlight');
                    setMessage('ベッドの下で 懐中電灯 を見つけた！');
                } else {
                    setMessage('ベッドは ふかふかだ。 寝ている場合じゃない！');
                }
                break;
        }
    };

    const handleBack = () => {
        setView('main');
        setMessage('部屋の 全体 だ。');
    };

    return (
        <div className={`min-h-screen font-sans transition-colors duration-1000 ${isDark && view !== 'intro' && view !== 'success' ? 'bg-slate-950 text-gray-300' : 'bg-orange-50 text-gray-800'} overflow-hidden select-none`}>

            {/* Header */}
            <div className="p-4 flex justify-between items-center bg-black/40 backdrop-blur-md fixed top-0 w-full z-50 border-b border-white/10">
                <Link href="/game" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full font-bold transition-colors flex items-center gap-2">
                    <span>↩</span> もどる
                </Link>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🚪</span>
                    <h1 className="text-xl font-bold text-white tracking-wider">脱出！ ガルちゃんの部屋</h1>
                </div>
                <div className="w-20"></div>
            </div>

            {/* Main Game Area */}
            <div className="container mx-auto h-screen flex flex-col items-center justify-center pt-16 relative">

                {/* VISUAL LAYOUT */}
                <div className={`relative w-full max-w-4xl aspect-video rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border-8 ${isDark ? 'border-slate-800' : 'border-orange-200'} bg-gray-900 transition-all duration-500`}>

                    {/* INTRO VIEW */}
                    {view === 'intro' && (
                        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-8 z-50">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <div className="w-48 h-48 mx-auto mb-6 relative rounded-full border-4 border-orange-500 overflow-hidden bg-white shadow-[0_0_30px_rgba(249,115,22,0.5)]">
                                    <Image src="/images/garuchan_escape.png" alt="Escape Garuchan" fill className="object-cover" priority />
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 mb-6">
                                    脱出！<br />ガルちゃんの部屋
                                </h2>
                                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                    気がつくと、謎の部屋に閉じ込められていた...<br />
                                    怪しい場所をタップして、アイテムを探し出そう！
                                </p>
                                <button
                                    onClick={() => setView('main')}
                                    className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-10 py-4 rounded-full font-black text-2xl hover:scale-105 transition-transform shadow-lg animate-pulse"
                                >
                                    START ▶
                                </button>
                            </motion.div>
                        </div>
                    )}

                    {/* SUCCESS VIEW */}
                    {view === 'success' && (
                        <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 z-50">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <div className="text-8xl mb-4 animate-bounce">🎊</div>
                                <h2 className="text-5xl md:text-7xl font-black text-orange-500 mb-6 drop-shadow-sm">脱出成功！</h2>
                                <p className="text-2xl text-gray-700 font-bold mb-8">
                                    おめでとう！<br />
                                    君は天才だ！
                                </p>
                                <Link href="/game" className="inline-block bg-black text-white px-10 py-4 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-xl">
                                    ゲーム一覧に戻る
                                </Link>
                            </motion.div>
                        </div>
                    )}

                    {/* MAIN ROOM VIEW */}
                    {view === 'main' && (
                        <div className={`w-full h-full relative transition-colors duration-1000 ${isDark ? 'bg-slate-900' : 'bg-[#eecfa1]'}`}>

                            {/* Room Architecture (CSS Art) */}
                            {/* Floor */}
                            <div className={`absolute bottom-0 w-full h-[30%] ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#d2b48c]'} border-t border-black/10`}></div>

                            {/* Wall Texture */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '60px 60px', backgroundPosition: '0 0, 30px 30px' }}></div>

                            {/* Door */}
                            <button
                                onClick={() => handleObjectClick('door')}
                                className={`absolute top-[15%] left-[15%] w-[20%] h-[60%] border-8 ${isDark ? 'border-gray-700 bg-gray-800' : 'border-[#5d4037] bg-[#8d6e63]'} shadow-2xl transform origin-left transition-transform duration-1000 ${isDoorOpen ? 'scale-x-0' : 'scale-100 hover:brightness-110'}`}
                            >
                                <div className="absolute right-3 top-1/2 w-3 h-3 md:w-4 md:h-4 bg-yellow-500 rounded-full shadow-md"></div>
                                {/* Door Detail */}
                                <div className="absolute inset-x-4 top-4 bottom-4 border-2 border-dashed border-black/10 opacity-50"></div>
                            </button>
                            {/* Door Open Void */}
                            <div className={`absolute top-[15%] left-[15%] w-[20%] h-[60%] bg-black -z-10 flex items-center justify-center`}>
                                <div className="text-white font-black text-lg animate-pulse">EXIT</div>
                            </div>

                            {/* Shelf */}
                            <button
                                onClick={() => handleObjectClick('shelf')}
                                className={`absolute bottom-[15%] right-[20%] w-[25%] h-[45%] ${isDark ? 'bg-gray-800 border-gray-900' : 'bg-[#795548] border-[#5d4037]'} border-4 shadow-xl flex flex-col justify-evenly p-2 hover:brightness-110 transition-filter`}
                            >
                                <div className="w-full h-1 bg-black/30 shadow-sm"></div>
                                <div className="w-full h-1 bg-black/30 shadow-sm"></div>
                                {/* Books */}
                                <div className="absolute bottom-[35%] left-2 w-4 h-12 bg-red-700/80 rounded-sm"></div>
                                <div className="absolute bottom-[35%] left-7 w-4 h-10 bg-blue-700/80 rounded-sm"></div>
                                <div className="absolute bottom-[35%] left-12 w-4 h-14 bg-green-700/80 rounded-sm"></div>
                            </button>

                            {/* Box (on shelf) */}
                            <button
                                onClick={() => handleObjectClick('box')}
                                className="absolute bottom-[48%] right-[28%] w-[10%] h-[8%] bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-lg shadow-md hover:-translate-y-1 transition-transform border border-yellow-900 flex items-center justify-center group"
                            >
                                <div className="w-[40%] h-[40%] bg-yellow-400 rounded-sm shadow-inner group-hover:bg-yellow-300"></div>
                            </button>

                            {/* Bed */}
                            <button
                                onClick={() => handleObjectClick('bed')}
                                className={`absolute bottom-[10%] left-[45%] w-[35%] h-[20%] ${isDark ? 'bg-indigo-900' : 'bg-blue-300'} rounded-lg border-b-8 ${isDark ? 'border-indigo-950' : 'border-blue-400'} shadow-lg hover:brightness-110 transition-filter`}
                            >
                                <div className="absolute -top-3 left-4 w-[30%] h-[60%] bg-white/90 rounded-2xl shadow-sm"></div> {/* Pillow */}
                                <div className="absolute inset-x-0 bottom-0 h-[80%] bg-white/20 rounded-b-lg"></div> {/* Blanket */}
                            </button>

                            {/* Light Switch */}
                            <button
                                onClick={() => handleObjectClick('switch')}
                                className="absolute top-[35%] right-[10%] w-[4%] h-[8%] bg-gray-200 border border-gray-400 rounded shadow-md hover:bg-white flex items-center justify-center"
                            >
                                <div className={`w-[60%] h-[40%] bg-gray-800 rounded-sm transition-transform ${isDark ? 'translate-y-1' : '-translate-y-1'}`}></div>
                            </button>

                            {/* Darkness Overlay (Interactive) */}
                            {isDark && (
                                <div className="absolute inset-0 bg-black/90 pointer-events-none flex items-center justify-center text-gray-500 font-bold text-lg md:text-2xl animate-pulse">
                                    <span className="bg-black px-4 py-2 rounded-md">暗くて よく見えない...</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ZOOM VIEWS */}
                    <AnimatePresence>
                        {view !== 'main' && view !== 'intro' && view !== 'success' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center p-4 md:p-12 cursor-pointer"
                                onClick={(e) => {
                                    if (e.target === e.currentTarget) handleBack();
                                }}
                            >
                                <div className="relative w-full h-full max-w-2xl bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700 flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>

                                    {/* Close Button */}
                                    <button onClick={handleBack} className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-colors">
                                        ×
                                    </button>

                                    {/* Box Content */}
                                    {view === 'box_zoom' && (
                                        <div className="bg-purple-900/50 w-full h-full flex flex-col items-center justify-center p-8 relative">
                                            <div className="w-64 h-48 bg-gradient-to-br from-yellow-700 to-yellow-900 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center justify-center relative border-4 border-yellow-600">
                                                {isBoxOpen ? (
                                                    <div className="text-center w-full">
                                                        <div className="absolute -top-12 left-0 w-full text-center text-yellow-400 font-black text-xl">OPEN!</div>
                                                        <p className="text-yellow-100 font-bold mb-4 opacity-75">中身は...</p>
                                                        {!inventory.includes('key') ? (
                                                            <button
                                                                onClick={() => addToInventory('key')}
                                                                className="bg-yellow-400 text-black px-6 py-3 rounded-full font-black animate-bounce shadow-[0_0_20px_rgba(250,204,21,0.6)] hover:scale-110 transition-transform"
                                                            >
                                                                🔑 カギ を拾う
                                                            </button>
                                                        ) : (
                                                            <p className="text-gray-400 italic">空っぽだ。</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-center">
                                                        <div className="text-6xl mb-4">🔒</div>
                                                        <button
                                                            onClick={() => {
                                                                if (inventory.includes('paper')) {
                                                                    setIsBoxOpen(true);
                                                                    setMessage('暗号を解いて 箱が開いた！');
                                                                } else {
                                                                    setMessage('鍵穴はない... 「暗号」が必要か？');
                                                                    triggerShake();
                                                                }
                                                            }}
                                                            className="text-white border-2 border-white/30 px-6 py-2 rounded-full font-bold hover:bg-white/10 transition-colors"
                                                        >
                                                            開ける
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Shelf Content */}
                                    {view === 'shelf_zoom' && (
                                        <div className="bg-amber-900/50 w-full h-full flex flex-col items-center justify-center p-8">
                                            <div className="w-full max-w-md h-64 bg-[#3e2723] rounded shadow-inner relative border-b-8 border-[#2d1b18] flex items-end justify-center perspective-1000">
                                                {/* Hidden Paper */}
                                                {!inventory.includes('paper') && (
                                                    <button
                                                        onClick={() => addToInventory('paper')}
                                                        className="absolute bottom-2 right-10 w-16 h-20 bg-gray-100 shadow-md rotate-6 hover:scale-110 hover:-rotate-0 transition-transform flex flex-col items-center justify-center text-[6px] text-gray-600 p-1 border border-gray-300"
                                                    >
                                                        <span className="font-bold text-[8px] mb-1">MEMO</span>
                                                        xxxxx<br />xxxxx
                                                    </button>
                                                )}
                                                <div className="w-full h-4 bg-black/20 absolute bottom-0"></div>
                                            </div>
                                            <p className="mt-8 text-amber-100 font-bold bg-black/40 px-4 py-2 rounded-full">棚の下の方に 何か落ちていないか...？</p>
                                        </div>
                                    )}

                                    {/* Door Content */}
                                    {view === 'door_zoom' && (
                                        <div className="bg-slate-800 w-full h-full flex flex-col items-center justify-center p-8">
                                            <div className="w-40 h-72 bg-[#4e342e] border-8 border-gray-600 relative shadow-2xl rounded-t-lg">
                                                <div className="absolute right-4 top-1/2 w-4 h-4 bg-yellow-600 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] flex items-center justify-center">
                                                    <div className="w-1 h-2 bg-black/50 rounded-full"></div>
                                                </div>
                                                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-20 h-10 bg-black/20 rounded flex items-center justify-center text-xs text-white/30 font-serif">ROOM 101</div>
                                            </div>
                                            <p className="mt-8 font-bold text-white bg-red-500/80 px-6 py-2 rounded-full animate-pulse">カギ が かかっている！</p>
                                        </div>
                                    )}

                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Message Overlay */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        key={message}
                        className="absolute bottom-6 inset-x-4 md:inset-x-auto md:w-3/4 md:left-1/2 md:-translate-x-1/2 bg-black/80 text-white p-4 md:p-6 rounded-2xl text-center backdrop-blur-md border border-white/10 shadow-2xl z-30"
                    >
                        <p className={`text-lg md:text-xl font-bold ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>{message}</p>
                    </motion.div>

                </div>

                {/* Inventory Bar */}
                <div className="mt-6 w-full max-w-3xl bg-white/90 dark:bg-slate-800/90 p-3 rounded-2xl shadow-lg flex gap-3 items-center border-4 border-gray-200 dark:border-slate-700 backdrop-blur-sm overflow-x-auto">
                    <span className="font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap px-2">バッグ:</span>
                    <div className="flex gap-3">
                        {inventory.length === 0 && <span className="text-gray-400 text-sm py-3 px-2">からっぽ</span>}
                        {inventory.map(item => (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                key={item}
                                className="w-14 h-14 bg-blue-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-3xl shadow-inner border-2 border-blue-200 dark:border-slate-600 relative group cursor-help"
                                title={getItemName(item)}
                            >
                                {item === 'key' && '🔑'}
                                {item === 'flashlight' && '🔦'}
                                {item === 'paper' && '📄'}
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                    {getItemName(item)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            `}</style>
        </div>
    );
}
