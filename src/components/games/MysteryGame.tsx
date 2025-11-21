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
            'きいろい ガルちゃんが キッチンに いたような...'
        ],
        clue: 'テレビは ついていた',
        isCulprit: false
    },
    {
        id: 'yellow',
        name: 'きいろい ガルちゃん',
        image: '/images/garoop_happy.png', // Placeholder
        color: 'bg-yellow-200',
        dialogue: [
            'えっ！？ プリン なくなったの？',
            'ぼくは おなかすいてたけど... 食べてないよ！',
            'くちのまわり？ これは... ただの クリームだよ！'
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
            'スプーンなら テーブルのうえに あったよ。'
        ],
        clue: 'あせを かいている',
        isCulprit: false
    }
];

const INITIAL_CLUES: Clue[] = [
    { id: 'spoon', name: 'よごれたスプーン', description: 'プリンがついた スプーンだ！', found: false, location: { x: 70, y: 60 } },
    { id: 'cup', name: 'からのカップ', description: 'プリンの カップが おちている...', found: false, location: { x: 30, y: 80 } },
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
        'たいへんだ！ れいぞうこの プリンが なくなっている！',
        'これは じけんだ！',
        'めいたんてい ガルちゃん、そうさ かいしだ！',
        'あやしい 3にんの ガルちゃんに はなしを きこう！'
    ];

    const handleIntroClick = () => {
        if (dialogueIndex < introLines.length - 1) {
            setDialogueIndex(dialogueIndex + 1);
        } else {
            setScene('investigation');
            setMessage('あやしい ところや ガルちゃんを タップしよう！');
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
            // Check if all clues found to enable deduction? (Optional)
        }
    };

    const handleClueClick = (clueId: string) => {
        const updatedClues = clues.map(c => {
            if (c.id === clueId && !c.found) {
                setFoundCluesCount(prev => prev + 1);
                setMessage(`「${c.name}」を みつけた！`);
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

    const resetGame = () => {
        setScene('intro');
        setDialogueIndex(0);
        setCurrentSuspect(null);
        setClues(INITIAL_CLUES);
        setFoundCluesCount(0);
        setMessage('だれが プリンを たべたのかな？');
    };

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-white relative overflow-hidden">
            {/* Background (Abstract Room) */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900">
                {/* Floor */}
                <div className="absolute bottom-0 w-full h-1/3 bg-[#4a3b32]"></div>
                {/* Table */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-3/4 h-40 bg-[#8b5a2b] rounded-lg perspective-1000 rotate-x-12 shadow-2xl"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 p-4 flex justify-between items-center bg-black/30 backdrop-blur-sm">
                <Link href="/game" className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold hover:bg-gray-200">
                    ← もどる
                </Link>
                <h1 className="text-2xl font-bold text-yellow-400">名探偵 ガルちゃん</h1>
                <div className="w-20"></div>
            </div>

            {/* Main Game Area */}
            <div className="relative z-10 container mx-auto h-[80vh] flex flex-col justify-center items-center">

                {/* INTRO SCENE */}
                {scene === 'intro' && (
                    <div
                        onClick={handleIntroClick}
                        className="bg-black/80 p-8 rounded-2xl border-4 border-yellow-500 max-w-2xl w-full text-center cursor-pointer hover:bg-black/90 transition-colors"
                    >
                        <div className="w-32 h-32 mx-auto mb-4 relative">
                            <Image src="/images/garoop_thinking.png" alt="Detective" fill className="object-contain" />
                        </div>
                        <p className="text-2xl font-bold leading-relaxed">{introLines[dialogueIndex]}</p>
                        <p className="text-sm text-gray-400 mt-4 animate-pulse">タップして すすむ ▶</p>
                    </div>
                )}

                {/* INVESTIGATION SCENE */}
                {scene === 'investigation' && (
                    <div className="w-full h-full relative">
                        {/* Message Bar */}
                        <div className="absolute top-0 left-0 w-full bg-black/60 p-2 text-center backdrop-blur-md z-20">
                            <p className="text-lg font-bold">{message}</p>
                        </div>

                        {/* Suspects */}
                        <div className="absolute top-1/4 w-full flex justify-center gap-4 md:gap-12 px-4">
                            {SUSPECTS.map((suspect) => (
                                <motion.button
                                    key={suspect.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSuspectClick(suspect)}
                                    className={`w-24 h-40 md:w-32 md:h-48 rounded-xl border-4 border-white shadow-lg flex flex-col items-center justify-end overflow-hidden ${suspect.color}`}
                                >
                                    <div className="w-full h-full relative">
                                        {/* Filter color for variety if using same image */}
                                        <div className={`absolute inset-0 mix-blend-overlay ${suspect.id === 'blue' ? 'bg-blue-500' : suspect.id === 'red' ? 'bg-red-500' : 'bg-yellow-500'} opacity-30`}></div>
                                        <Image src={suspect.image} alt={suspect.name} fill className="object-contain" />
                                    </div>
                                    <div className="w-full bg-black/50 text-white text-xs py-1 text-center font-bold">
                                        {suspect.name}
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Clues (Hidden in room) */}
                        {clues.map((clue) => !clue.found && (
                            <motion.button
                                key={clue.id}
                                initial={{ opacity: 0.8 }}
                                whileHover={{ scale: 1.2, opacity: 1 }}
                                onClick={() => handleClueClick(clue.id)}
                                className="absolute w-12 h-12 bg-white/20 rounded-full border-2 border-dashed border-yellow-400 flex items-center justify-center cursor-pointer animate-pulse"
                                style={{ left: `${clue.location.x}%`, top: `${clue.location.y}%` }}
                            >
                                <span className="text-2xl">✨</span>
                            </motion.button>
                        ))}

                        {/* Dialogue Overlay */}
                        <AnimatePresence>
                            {currentSuspect && (
                                <motion.div
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 100, opacity: 0 }}
                                    className="absolute bottom-0 left-0 w-full bg-white text-black p-6 rounded-t-3xl shadow-2xl z-30 border-t-4 border-blue-500"
                                    onClick={handleDialogueNext}
                                >
                                    <div className="flex items-center gap-4 max-w-4xl mx-auto">
                                        <div className={`w-20 h-20 rounded-full border-2 border-gray-300 overflow-hidden flex-shrink-0 ${currentSuspect.color}`}>
                                            <Image src={currentSuspect.image} alt={currentSuspect.name} width={80} height={80} className="object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-blue-600 mb-1">{currentSuspect.name}</h3>
                                            <p className="text-xl font-bold">{currentSuspect.dialogue[dialogueIndex]}</p>
                                        </div>
                                        <div className="text-gray-400 text-sm animate-bounce">▶</div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Deduction Button */}
                        <div className="absolute bottom-4 right-4 z-20">
                            <button
                                onClick={() => setScene('deduction')}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold shadow-lg border-2 border-white animate-bounce"
                            >
                                はんにんが わかった！ 👉
                            </button>
                        </div>
                    </div>
                )}

                {/* DEDUCTION SCENE */}
                {scene === 'deduction' && (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-8 text-yellow-400">はんにんは... だれだ！？</h2>
                        <div className="flex flex-wrap justify-center gap-6">
                            {SUSPECTS.map((suspect) => (
                                <button
                                    key={suspect.id}
                                    onClick={() => handleDeduction(suspect)}
                                    className="bg-white text-black p-4 rounded-xl hover:scale-105 transition-transform shadow-xl border-4 border-transparent hover:border-red-500"
                                >
                                    <div className={`w-32 h-32 rounded-lg mb-2 overflow-hidden ${suspect.color}`}>
                                        <Image src={suspect.image} alt={suspect.name} width={128} height={128} className="object-contain" />
                                    </div>
                                    <p className="font-bold">{suspect.name}</p>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setScene('investigation')}
                            className="mt-12 text-gray-400 underline hover:text-white"
                        >
                            まだ わからない (もどる)
                        </button>
                    </div>
                )}

                {/* ENDING SCENES */}
                {scene === 'ending_success' && (
                    <div className="text-center bg-white text-black p-8 rounded-3xl border-8 border-yellow-400 shadow-2xl max-w-lg">
                        <h2 className="text-4xl font-black text-red-500 mb-4">だいせいかい！🎉</h2>
                        <div className="w-40 h-40 mx-auto mb-4 relative">
                            <Image src="/images/garoop_happy.png" alt="Success" fill className="object-contain" />
                        </div>
                        <p className="text-xl font-bold mb-6">
                            きいろい ガルちゃんの くちのまわりに<br />
                            クリームが ついていたね！<br />
                            めいたんてい、ありがとう！
                        </p>
                        <Link href="/game" className="inline-block bg-blue-500 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-600">
                            ゲームいちらんへ
                        </Link>
                    </div>
                )}

                {scene === 'ending_fail' && (
                    <div className="text-center bg-gray-800 text-white p-8 rounded-3xl border-4 border-gray-600 shadow-2xl max-w-lg">
                        <h2 className="text-3xl font-bold text-gray-400 mb-4">ざんねん... 😓</h2>
                        <p className="text-xl mb-6">
                            ちがう ガルちゃん みたいだ...<br />
                            もういちど すいり してみよう！
                        </p>
                        <button
                            onClick={() => setScene('investigation')}
                            className="bg-yellow-500 text-black px-8 py-3 rounded-full font-bold hover:bg-yellow-600"
                        >
                            そうさを つづける
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
