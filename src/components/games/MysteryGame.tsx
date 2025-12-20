"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// --- Types ---
type Scene = 'intro' | 'investigation' | 'deduction' | 'ending_success' | 'ending_fail';

interface Suspect {
    id: string;
    name: string;
    image: string;
    color: string;
    dialogue: string[];
    clue: string;
    isCulprit: boolean;
}

interface Clue {
    id: string;
    name: string;
    description: string;
    found: boolean;
    location: { x: number; y: number }; // Percentage coordinates
}

// --- Game Data ---
const SUSPECTS: Suspect[] = [
    {
        id: 'blue',
        name: 'あおい ガルちゃん',
        image: '/images/garoop_thinking.png', // Placeholder
        color: 'bg-blue-200',
        dialogue: [
            'ぼくは ずっと テレビを みてたよ。',
            'プリン？ しらないなぁ。',
            'きいろい ガルちゃんが キッチンに いたような...',
            'テレビの ニュースが きになって...'
        ],
        clue: 'テレビは ついていた',
        isCulprit: false
    },
    {
        id: 'yellow',
        name: 'きいろい ガルちゃん',
        image: '/images/garoop_happy.png', // Placeholder - maybe this one looks guilty?
        color: 'bg-yellow-200',
        dialogue: [
            'えっ！？ プリン なくなったの？',
            'ぼくは おなかすいてたけど... 食べてないよ！',
            'くちのまわり？ これは... ただの クリームだよ！',
            'あ、いや！ シェービングクリーム... かな？'
        ],
        clue: 'くちのまわりに クリームがついている',
        isCulprit: true
    },
    {
        id: 'red',
        name: 'あかい ガルちゃん',
        image: '/images/garoop_battle.png', // Placeholder
        color: 'bg-red-200',
        dialogue: [
            'ぼくは トレーニング してたんだ！',
            'あまいものは たべない 主義さ！',
            'スプーンなら テーブルのうえに あったよ。',
            'キンニクは うらぎらない！'
        ],
        clue: 'あせを かいている',
        isCulprit: false
    }
];

const INITIAL_CLUES: Clue[] = [
    { id: 'spoon', name: 'よごれたスプーン', description: 'プリンがついた スプーンだ！ まだ ぬれている...', found: false, location: { x: 75, y: 65 } },
    { id: 'cup', name: 'からのカップ', description: 'プリンの カップが おちている... 「GARU-PRIN」と かいてある。', found: false, location: { x: 25, y: 85 } },
    { id: 'footprint', name: 'きいろい あしあと', description: 'キッチンの ゆかに きいろい ペンキのような あしあとが...', found: false, location: { x: 50, y: 90 } },
];

export default function MysteryGame() {
    const [scene, setScene] = useState<Scene>('intro');
    const [dialogueIndex, setDialogueIndex] = useState(0);
    const [currentSuspect, setCurrentSuspect] = useState<Suspect | null>(null);
    const [clues, setClues] = useState<Clue[]>(INITIAL_CLUES);
    const [foundCluesCount, setFoundCluesCount] = useState(0);
    const [message, setMessage] = useState('だれが プリンを たべたのかな？');

    // Intro Dialogue
    const introLines = [
        '事件発生！ 事件発生！',
        '冷蔵庫の 限定特選「ガル・プリン」が 消えた！',
        'これは 重大な事件だ...',
        '名探偵 ガルちゃん、出動せよ！',
        '現場にいる 3人の 容疑者から 話を聞こう！'
    ];

    const handleIntroClick = () => {
        if (dialogueIndex < introLines.length - 1) {
            setDialogueIndex(dialogueIndex + 1);
        } else {
            setScene('investigation');
            setMessage('タップして 調査を開始せよ！');
        }
    };

    const handleSuspectClick = (suspect: Suspect) => {
        setCurrentSuspect(suspect);
        setDialogueIndex(0);
    };

    const handleDialogueNext = () => {
        if (!currentSuspect) return;
        if (dialogueIndex < currentSuspect.dialogue.length - 1) {
            setDialogueIndex(dialogueIndex + 1);
        } else {
            setCurrentSuspect(null); // Close dialogue
        }
    };

    const handleClueClick = (clueId: string) => {
        const updatedClues = clues.map(c => {
            if (c.id === clueId && !c.found) {
                setFoundCluesCount(prev => prev + 1);
                setMessage(`証拠発見！ 「${c.name}」だ！`);
                return { ...c, found: true };
            }
            return c;
        });
        setClues(updatedClues);
    };

    const handleDeduction = (suspect: Suspect) => {
        if (suspect.isCulprit) {
            setScene('ending_success');
        } else {
            setScene('ending_fail');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-white relative overflow-hidden select-none">

            {/* Background Texture/Gradient */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, #ffffff 25%, #ffffff 26%, transparent 27%, transparent 74%, #ffffff 75%, #ffffff 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #ffffff 25%, #ffffff 26%, transparent 27%, transparent 74%, #ffffff 75%, #ffffff 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}></div>
            </div>

            {/* Header */}
            <div className="relative z-10 p-4 flex justify-between items-center bg-black/60 backdrop-blur-md border-b border-white/10 sticky top-0">
                <Link href="/game" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full font-bold transition-colors flex items-center gap-2">
                    <span>↩</span> もどる
                </Link>
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🕵️‍♂️</span>
                    <h1 className="text-xl md:text-2xl font-black text-yellow-400 tracking-wider">名探偵 ガルちゃん</h1>
                </div>
                <div className="w-20"></div>
            </div>

            {/* Main Game Area */}
            <div className="relative z-10 container mx-auto h-[calc(100vh-80px)] flex flex-col justify-center items-center p-4">

                {/* INTRO SCENE */}
                {scene === 'intro' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={handleIntroClick}
                        className="bg-black/80 p-8 rounded-3xl border-4 border-yellow-500 max-w-2xl w-full text-center cursor-pointer hover:bg-black/90 transition-colors shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-yellow-500 animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-full h-2 bg-yellow-500 animate-pulse"></div>

                        <div className="w-40 h-40 md:w-56 md:h-56 mx-auto mb-6 relative rounded-full border-4 border-yellow-500/50 bg-slate-800 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                            <Image
                                src="/images/garuchan_detective.png"
                                alt="Detective Garuchan"
                                fill
                                className="object-contain transform group-hover:scale-105 transition-transform duration-500"
                                priority
                            />
                        </div>
                        <h2 className="text-yellow-400 font-bold mb-4 tracking-widest text-sm md:text-base">EPISODE 1: 消えたプリン</h2>
                        <p className="text-xl md:text-3xl font-bold leading-relaxed whitespace-pre-line">{introLines[dialogueIndex]}</p>
                        <div className="mt-8 text-sm text-gray-500 animate-pulse">画面をタップして次へ ▶</div>
                    </motion.div>
                )}

                {/* INVESTIGATION SCENE */}
                {scene === 'investigation' && (
                    <div className="w-full h-full relative flex flex-col">

                        {/* Investigation HUD */}
                        <div className="bg-black/70 p-3 backdrop-blur-sm rounded-xl mb-4 flex justify-between items-center border border-white/20">
                            <p className="text-lg font-bold text-yellow-300 drop-shadow-md">Hint: {message}</p>
                            <div className="text-sm font-bold bg-white/10 px-3 py-1 rounded-full">証拠: {foundCluesCount}/{clues.length}</div>
                        </div>

                        {/* Scene Container */}
                        <div className="flex-grow relative bg-slate-800 rounded-3xl overflow-hidden shadow-inner border-4 border-slate-700 group cursor-[url('/images/cursor_magnify.png'),_auto]">

                            {/* Room Background Elements (CSS Art) */}
                            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[#3d2e24]"></div> {/* Floor */}
                            <div className="absolute left-10 top-20 w-32 h-40 bg-gray-900 border-4 border-gray-700 rounded-lg"></div> {/* TV */}
                            <div className="absolute right-20 bottom-32 w-48 h-24 bg-[#5c4033] rounded-t-lg shadow-lg"></div> {/* Table */}

                            {/* Clickable Clues */}
                            {clues.map((clue) => !clue.found && (
                                <motion.button
                                    key={clue.id}
                                    initial={{ opacity: 0.6 }}
                                    whileHover={{ scale: 1.2, opacity: 1, rotate: 10 }}
                                    onClick={() => handleClueClick(clue.id)}
                                    className="absolute w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-yellow-400/20 hover:bg-yellow-400/40 border-2 border-yellow-400 border-dashed animate-pulse transition-all shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                                    style={{ left: `${clue.location.x}%`, top: `${clue.location.y}%` }}
                                >
                                    <span className="text-2xl md:text-3xl">✨</span>
                                </motion.button>
                            ))}

                            {/* Suspects Standing in Room */}
                            <div className="absolute bottom-[10%] w-full flex justify-center gap-4 md:gap-16 px-4 items-end pointer-events-none">
                                {SUSPECTS.map((suspect, idx) => (
                                    <motion.button
                                        key={suspect.id}
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: idx * 0.2 }}
                                        onClick={() => handleSuspectClick(suspect)}
                                        className={`pointer-events-auto relative w-24 h-48 md:w-40 md:h-64 filter drop-shadow-2xl transition-transform hover:-translate-y-2 hover:brightness-110 active:scale-95 group-hover:grayscale-[0.3] hover:!grayscale-0`}
                                    >
                                        <Image src={suspect.image} alt={suspect.name} fill className="object-contain" />
                                        {/* Name Tag */}
                                        <div className="absolute -bottom-6 inset-x-0 bg-black/80 text-white text-xs md:text-sm py-1 rounded-full text-center border border-white/20 whitespace-nowrap">
                                            {suspect.name}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                        </div>

                        {/* Dialogue Overlay */}
                        <AnimatePresence>
                            {currentSuspect && (
                                <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/20 backdrop-blur-[2px]">
                                    <motion.div
                                        initial={{ y: 100, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 100, opacity: 0 }}
                                        className="bg-slate-900 border-t-4 border-yellow-500 p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] cursor-pointer"
                                        onClick={handleDialogueNext}
                                    >
                                        <div className="container mx-auto max-w-4xl flex items-start gap-6">
                                            {/* Speaker Portrait */}
                                            <div className={`w-24 h-24 md:w-32 md:h-32 rounded-xl border-4 border-white/20 overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-700 to-gray-900 shadow-inner translate-y-[-2rem]`}>
                                                <Image src={currentSuspect.image} alt={currentSuspect.name} width={128} height={128} className="object-cover w-full h-full" />
                                            </div>

                                            {/* Text */}
                                            <div className="flex-1 pt-2">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h3 className="text-lg md:text-xl font-black text-yellow-400">{currentSuspect.name}</h3>
                                                    <span className="text-xs text-gray-500 uppercase tracking-widest">Interrogation</span>
                                                </div>
                                                <p className="text-xl md:text-2xl font-medium leading-relaxed drop-shadow-md">
                                                    {currentSuspect.dialogue[dialogueIndex]}
                                                </p>
                                                <div className="mt-4 flex justify-end">
                                                    <span className="animate-bounce text-yellow-500 text-2xl">▼</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </AnimatePresence>

                        {/* Action Buttons */}
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setScene('deduction')}
                                className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white px-8 py-4 rounded-full font-black text-lg md:text-xl shadow-[0_0_20px_rgba(220,38,38,0.6)] border-2 border-red-400 transform hover:scale-105 transition-all flex items-center gap-3"
                            >
                                <span className="text-2xl">👉</span> 犯人を指名する！
                            </button>
                        </div>
                    </div>
                )}

                {/* DEDUCTION SCENE */}
                {scene === 'deduction' && (
                    <div className="text-center w-full max-w-4xl">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-black/40 backdrop-blur-md p-8 rounded-3xl border border-white/10"
                        >
                            <h2 className="text-3xl md:text-5xl font-black mb-12 text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_5px_5px_rgba(0,0,0,1)]">
                                犯人は... お前だ！
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                                {SUSPECTS.map((suspect) => (
                                    <button
                                        key={suspect.id}
                                        onClick={() => handleDeduction(suspect)}
                                        className="group bg-slate-800 p-4 rounded-2xl hover:bg-slate-700 transition-all border-4 border-transparent hover:border-red-500 shadow-xl flex flex-col items-center relative overflow-hidden"
                                    >
                                        {/* Spotlight effect on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-900/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full bg-slate-900 mb-4 overflow-hidden border-4 border-slate-600 group-hover:border-red-400 transition-colors shadow-lg z-10`}>
                                            <Image src={suspect.image} alt={suspect.name} width={160} height={160} className="object-cover" />
                                        </div>
                                        <p className="font-black text-lg md:text-xl relative z-10">{suspect.name}</p>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setScene('investigation')}
                                className="mt-12 text-gray-400 hover:text-white underline decoration-dashed underline-offset-4"
                            >
                                ← まだ 証拠が足りない (調査に戻る)
                            </button>
                        </motion.div>
                    </div>
                )}

                {/* ENDING SCENES */}
                {scene === 'ending_success' && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center bg-white text-black p-8 md:p-12 rounded-[3rem] border-8 border-yellow-400 shadow-[0_0_100px_rgba(250,204,21,0.5)] max-w-lg w-full relative"
                    >
                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center border-8 border-white shadow-xl">
                            <span className="text-6xl">🏆</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-red-600 mb-6 mt-10">大正解！</h2>
                        <div className="w-48 h-48 mx-auto mb-6 relative">
                            <Image src="/images/garuchan_detective.png" alt="Success" fill className="object-contain" />
                        </div>
                        <p className="text-xl font-bold mb-8 leading-relaxed">
                            <span className="bg-yellow-200 px-2 rounded-sm">きいろい ガルちゃん</span> の<br />
                            口元のクリームが 決定的な証拠だね！<br />
                            さすが 名探偵 ガルちゃんだ！
                        </p>
                        <Link href="/game" className="inline-block w-full bg-black text-white px-8 py-4 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-xl">
                            事件解決 (ゲーム一覧へ)
                        </Link>
                    </motion.div>
                )}

                {scene === 'ending_fail' && (
                    <motion.div
                        initial={{ x: 0 }}
                        animate={{ x: [0, -10, 10, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                        className="text-center bg-gray-900 text-white p-8 md:p-12 rounded-[3rem] border-4 border-gray-600 shadow-2xl max-w-lg w-full"
                    >
                        <h2 className="text-3xl md:text-5xl font-black text-gray-400 mb-6">推理失敗...</h2>
                        <div className="text-6xl mb-6 opacity-50">😓</div>
                        <p className="text-lg md:text-xl mb-8 font-medium">
                            うーん、彼じゃないみたいだ。<br />
                            もう一度 よーく 調査してみよう...
                        </p>
                        <button
                            onClick={() => setScene('investigation')}
                            className="w-full bg-yellow-500 text-black px-8 py-4 rounded-full font-black text-xl hover:bg-yellow-400 transition-colors shadow-lg"
                        >
                            再調査する 🔍
                        </button>
                    </motion.div>
                )}

            </div>
        </div>
    );
}
