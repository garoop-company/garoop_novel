"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// --- Types ---
interface Character {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    atb: number; // 0-100
    speed: number;
    isEnemy: boolean;
    status?: 'ready' | 'acting' | 'dead';
}

export default function CrystalGame() {
    const [characters, setCharacters] = useState<Character[]>([
        { id: 'p1', name: 'ガル', hp: 100, maxHp: 100, atb: 0, speed: 1.5, isEnemy: false },
        { id: 'p2', name: 'フレンド', hp: 80, maxHp: 80, atb: 0, speed: 1.2, isEnemy: false },
        { id: 'e1', name: 'ボス', hp: 500, maxHp: 500, atb: 0, speed: 0.8, isEnemy: true },
    ]);
    const [activeCharId, setActiveCharId] = useState<string | null>(null);
    const [log, setLog] = useState<string[]>([]);

    // ATB Loop
    useEffect(() => {
        const interval = setInterval(() => {
            setCharacters(prev => {
                let hasActive = false;
                const next = prev.map(c => {
                    if (c.hp <= 0) return { ...c, status: 'dead' as const, atb: 0 };
                    if (c.status === 'acting' || c.status === 'ready') {
                        hasActive = true;
                        return c;
                    }

                    const newAtb = Math.min(100, c.atb + c.speed);
                    if (newAtb >= 100) {
                        return { ...c, atb: 100, status: 'ready' as const };
                    }
                    return { ...c, atb: newAtb };
                });

                // Check for ready characters
                if (!activeCharId) {
                    const readyChar = next.find(c => c.status === 'ready');
                    if (readyChar) {
                        if (readyChar.isEnemy) {
                            // Enemy Auto Attack
                            // We need to handle this outside the state update to avoid loops or complex logic here
                            // But for simplicity, let's trigger a side effect via a separate useEffect or just handle it here?
                            // Handling side effects in state update is bad.
                            // Let's just mark it.
                        } else {
                            // Player waits for input
                        }
                    }
                }

                return next;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [activeCharId]);

    // Enemy Logic & Turn Handling
    useEffect(() => {
        const readyEnemy = characters.find(c => c.isEnemy && c.status === 'ready');
        if (readyEnemy) {
            handleAction(readyEnemy.id, 'attack');
        }

        // Check if player is ready to set active UI
        const readyPlayer = characters.find(c => !c.isEnemy && c.status === 'ready');
        if (readyPlayer) {
            setActiveCharId(readyPlayer.id);
        } else {
            setActiveCharId(null);
        }

    }, [characters]);

    const handleAction = (actorId: string, action: 'attack' | 'heal') => {
        setCharacters(prev => {
            const actor = prev.find(c => c.id === actorId);
            if (!actor) return prev;

            let targets = prev.filter(c => c.hp > 0 && c.isEnemy !== actor.isEnemy);
            if (action === 'heal') targets = prev.filter(c => c.hp > 0 && c.isEnemy === actor.isEnemy);

            if (targets.length === 0) return prev; // Battle over?

            const target = targets[Math.floor(Math.random() * targets.length)];

            // Calculate
            let damage = 0;
            if (action === 'attack') damage = 20 + Math.floor(Math.random() * 10);
            if (action === 'heal') damage = -30;

            const newHp = Math.min(target.maxHp, Math.max(0, target.hp - damage));

            // Log
            const msg = action === 'heal'
                ? `${actor.name}は ${target.name}を かいふくした！`
                : `${actor.name}の こうげき！ ${target.name}に ${damage}ダメージ！`;
            setLog(l => [...l.slice(-4), msg]);

            return prev.map(c => {
                if (c.id === actor.id) return { ...c, atb: 0, status: undefined };
                if (c.id === target.id) return { ...c, hp: newHp };
                return c;
            });
        });
    };

    return (
        <div className="min-h-screen bg-blue-900 font-sans text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Header */}
            <div className="absolute top-4 left-4 z-20">
                <Link href="/game" className="bg-white text-blue-900 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-blue-100 transition-colors">
                    ← もどる
                </Link>
            </div>

            {/* Battle Scene */}
            <div className="w-full max-w-4xl h-[500px] bg-[url('/images/ff_bg.png')] bg-cover bg-center rounded-xl shadow-2xl relative overflow-hidden border-4 border-gray-400">

                {/* Enemies (Left) */}
                <div className="absolute top-20 left-20">
                    {characters.filter(c => c.isEnemy).map(c => (
                        <div key={c.id} className="relative">
                            <motion.div
                                animate={c.status === 'acting' ? { x: 50 } : { x: 0 }}
                                className={`w-32 h-32 bg-red-500 rounded-full border-4 border-black ${c.hp <= 0 ? 'opacity-0' : ''}`}
                            ></motion.div>
                            {c.hp > 0 && (
                                <div className="absolute -top-8 left-0 w-full text-center font-bold text-shadow">
                                    {c.name}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Players (Right) */}
                <div className="absolute top-40 right-20 flex flex-col gap-8">
                    {characters.filter(c => !c.isEnemy).map(c => (
                        <div key={c.id} className="relative">
                            <motion.div
                                animate={c.status === 'acting' ? { x: -50 } : { x: 0 }}
                                className={`w-20 h-20 bg-blue-500 rounded-full border-4 border-white ${c.hp <= 0 ? 'grayscale' : ''}`}
                            >
                                {c.status === 'ready' && <div className="absolute -top-4 -right-4 text-2xl">✨</div>}
                            </motion.div>
                        </div>
                    ))}
                </div>

                {/* Damage Numbers (Simplified, just log for now) */}

            </div>

            {/* UI Panel */}
            <div className="w-full max-w-4xl mt-4 bg-gradient-to-b from-blue-800 to-blue-950 border-4 border-gray-400 rounded-xl p-4 flex gap-4 text-sm md:text-base shadow-lg">

                {/* Character Stats */}
                <div className="flex-1 bg-black/30 p-2 rounded border border-blue-500">
                    {characters.filter(c => !c.isEnemy).map(c => (
                        <div key={c.id} className="mb-2 flex items-center justify-between">
                            <span className="w-20 font-bold">{c.name}</span>
                            <span className={`w-20 ${c.hp < c.maxHp / 4 ? 'text-yellow-400' : 'text-white'}`}>HP {c.hp}</span>
                            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 transition-all duration-100"
                                    style={{ width: `${c.atb}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Command Menu */}
                <div className="w-48 bg-black/30 p-2 rounded border border-blue-500 relative">
                    {activeCharId ? (
                        <div className="flex flex-col gap-2">
                            <div className="font-bold text-yellow-400 mb-1">{characters.find(c => c.id === activeCharId)?.name}</div>
                            <button onClick={() => handleAction(activeCharId, 'attack')} className="text-left hover:bg-white/20 px-2 rounded">⚔️ たたかう</button>
                            <button onClick={() => handleAction(activeCharId, 'heal')} className="text-left hover:bg-white/20 px-2 rounded">💊 かいふく</button>
                            <button className="text-left text-gray-500 px-2">🛡️ ぼうぎょ</button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            ウェイト...
                        </div>
                    )}
                </div>

                {/* Log */}
                <div className="flex-1 bg-black/30 p-2 rounded border border-blue-500 font-mono text-xs md:text-sm overflow-hidden">
                    {log.map((l, i) => (
                        <div key={i}>{l}</div>
                    ))}
                </div>

            </div>

        </div>
    );
}
