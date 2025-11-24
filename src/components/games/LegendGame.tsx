"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// --- Types ---
interface Entity {
    name: string;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    attack: number;
    defense: number;
}

export default function LegendGame() {
    const [player, setPlayer] = useState<Entity>({ name: 'ゆうしゃ', hp: 50, maxHp: 50, mp: 20, maxMp: 20, attack: 10, defense: 5 });
    const [enemy, setEnemy] = useState<Entity>({ name: 'ぷるぷる', hp: 30, maxHp: 30, mp: 0, maxMp: 0, attack: 8, defense: 2 });
    const [messages, setMessages] = useState<string[]>(['ぷるぷるが あらわれた！']);
    const [turn, setTurn] = useState<'player' | 'enemy' | 'win' | 'lose'>('player');
    const [shake, setShake] = useState(false);
    const [flash, setFlash] = useState(false);

    const addMessage = (msg: string) => {
        setMessages(prev => [...prev.slice(-3), msg]);
    };

    const handleAttack = () => {
        if (turn !== 'player') return;

        const damage = Math.max(1, Math.floor(player.attack - enemy.defense / 2 + Math.random() * 3));
        setEnemy(prev => ({ ...prev, hp: Math.max(0, prev.hp - damage) }));
        addMessage(`${player.name}の こうげき！`);
        addMessage(`${enemy.name}に ${damage}の ダメージ！`);

        setFlash(true);
        setTimeout(() => setFlash(false), 200);

        if (enemy.hp - damage <= 0) {
            setTurn('win');
            addMessage(`${enemy.name}を たおした！`);
        } else {
            setTurn('enemy');
            setTimeout(enemyTurn, 1500);
        }
    };

    const handleMagic = () => {
        if (turn !== 'player') return;
        if (player.mp < 5) {
            addMessage('MPが たりない！');
            return;
        }

        setPlayer(prev => ({ ...prev, mp: prev.mp - 5 }));
        const damage = Math.floor(15 + Math.random() * 5);
        setEnemy(prev => ({ ...prev, hp: Math.max(0, prev.hp - damage) }));
        addMessage(`${player.name}は メラを となえた！`);
        addMessage(`${enemy.name}に ${damage}の ダメージ！`);

        setFlash(true);
        setTimeout(() => setFlash(false), 200);

        if (enemy.hp - damage <= 0) {
            setTurn('win');
            addMessage(`${enemy.name}を たおした！`);
        } else {
            setTurn('enemy');
            setTimeout(enemyTurn, 1500);
        }
    };

    const handleRun = () => {
        addMessage(`${player.name}は にげだした！`);
        addMessage('しかし まわりこまれてしまった！');
        setTurn('enemy');
        setTimeout(enemyTurn, 1500);
    };

    const enemyTurn = () => {
        const damage = Math.max(1, Math.floor(enemy.attack - player.defense / 2 + Math.random() * 3));
        setPlayer(prev => ({ ...prev, hp: Math.max(0, prev.hp - damage) }));
        addMessage(`${enemy.name}の こうげき！`);
        addMessage(`${player.name}は ${damage}の ダメージをうけた！`);

        setShake(true);
        setTimeout(() => setShake(false), 500);

        if (player.hp - damage <= 0) {
            setTurn('lose');
            addMessage(`${player.name}は しんでしまった...`);
        } else {
            setTurn('player');
        }
    };

    const resetGame = () => {
        setPlayer({ name: 'ゆうしゃ', hp: 50, maxHp: 50, mp: 20, maxMp: 20, attack: 10, defense: 5 });
        setEnemy({ name: 'ぷるぷる', hp: 30, maxHp: 30, mp: 0, maxMp: 0, attack: 8, defense: 2 });
        setMessages(['ぷるぷるが あらわれた！']);
        setTurn('player');
    };

    return (
        <div className="min-h-screen bg-black font-mono text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Header */}
            <div className="absolute top-4 left-4 z-20">
                <Link href="/game" className="bg-white text-black px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-200 transition-colors">
                    ← もどる
                </Link>
            </div>

            {/* Main Screen */}
            <div className="w-full max-w-2xl border-4 border-white rounded-xl p-4 bg-black relative">

                {/* Enemy View */}
                <div className="h-64 flex items-center justify-center relative border-b-4 border-white mb-4 bg-[url('/images/dq_bg.png')] bg-cover bg-center">
                    <motion.div
                        animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                        transition={{ duration: 0.5 }}
                        className={`relative w-40 h-40 ${flash ? 'opacity-0' : 'opacity-100'} transition-opacity duration-100`}
                    >
                        {/* Simple CSS Slime or Image */}
                        <div className="w-full h-full bg-blue-500 rounded-t-full rounded-b-3xl relative shadow-[0_0_20px_blue]">
                            <div className="absolute top-10 left-8 w-8 h-8 bg-white rounded-full">
                                <div className="absolute top-3 left-3 w-2 h-2 bg-black rounded-full"></div>
                            </div>
                            <div className="absolute top-10 right-8 w-8 h-8 bg-white rounded-full">
                                <div className="absolute top-3 left-3 w-2 h-2 bg-black rounded-full"></div>
                            </div>
                            <div className="absolute bottom-8 left-14 w-12 h-4 bg-red-500 rounded-full"></div>
                        </div>
                    </motion.div>
                </div>

                {/* Status Window */}
                <div className="border-4 border-white rounded-xl p-4 mb-4 flex justify-between items-center">
                    <div>
                        <p className="text-xl font-bold">{player.name}</p>
                        <p>HP: {player.hp} / {player.maxHp}</p>
                        <p>MP: {player.mp} / {player.maxMp}</p>
                    </div>
                    <div className="text-right">
                        <p>Lv: 1</p>
                        <p>G: 0</p>
                    </div>
                </div>

                {/* Message & Command */}
                <div className="flex gap-4 h-40">
                    {/* Message Window */}
                    <div className="flex-1 border-4 border-white rounded-xl p-4 overflow-hidden">
                        {messages.map((msg, i) => (
                            <p key={i} className="mb-2">{msg}</p>
                        ))}
                        {turn === 'win' && (
                            <button onClick={resetGame} className="mt-2 text-yellow-400 animate-pulse">▶ つぎの たたかいへ</button>
                        )}
                        {turn === 'lose' && (
                            <button onClick={resetGame} className="mt-2 text-red-400 animate-pulse">▶ もういちど やりなおす</button>
                        )}
                    </div>

                    {/* Command Window */}
                    {turn === 'player' && (
                        <div className="w-40 border-4 border-white rounded-xl p-4 flex flex-col gap-2">
                            <button onClick={handleAttack} className="text-left hover:text-yellow-400">▶ たたかう</button>
                            <button onClick={handleMagic} className="text-left hover:text-yellow-400">▶ じゅもん</button>
                            <button className="text-left text-gray-500 cursor-not-allowed">▶ どうぐ</button>
                            <button onClick={handleRun} className="text-left hover:text-yellow-400">▶ にげる</button>
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
}
