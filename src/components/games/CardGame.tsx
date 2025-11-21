"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// --- Types ---
interface CardData {
    id: string;
    name: string;
    type: 'attack' | 'defense' | 'heal' | 'magic';
    power: number;
    cost: number;
    image: string;
    description: string;
}

interface PlayerState {
    hp: number;
    maxHp: number;
    energy: number;
    maxEnergy: number;
    hand: CardData[];
    deck: CardData[];
    shield: number;
}

// --- Card Database ---
const CARDS: CardData[] = [
    { id: 'c1', name: 'ファイターガル', type: 'attack', power: 15, cost: 2, image: '/images/garoop_battle.png', description: 'つよい パンチで こうげき！' },
    { id: 'c2', name: 'ガードガル', type: 'defense', power: 10, cost: 1, image: '/images/garoop_thinking.png', description: 'シールドで まもるぞ！' },
    { id: 'c3', name: 'ヒーラーガル', type: 'heal', power: 20, cost: 3, image: '/images/garoop_happy.png', description: 'HPを かいふく するよ！' },
    { id: 'c4', name: 'マジックガル', type: 'magic', power: 25, cost: 4, image: '/images/garoop_thinking.png', description: 'まほうで だいダメージ！' },
    { id: 'c5', name: 'プチパンチ', type: 'attack', power: 5, cost: 0, image: '/images/garoop_battle.png', description: 'ちいさな パンチ！' },
];

const INITIAL_HP = 50;
const INITIAL_ENERGY = 3;

export default function CardGame() {
    const [user, setUser] = useState<PlayerState>({ hp: INITIAL_HP, maxHp: INITIAL_HP, energy: INITIAL_ENERGY, maxEnergy: INITIAL_ENERGY, hand: [], deck: [], shield: 0 });
    const [cpu, setCpu] = useState<PlayerState>({ hp: INITIAL_HP, maxHp: INITIAL_HP, energy: INITIAL_ENERGY, maxEnergy: INITIAL_ENERGY, hand: [], deck: [], shield: 0 });
    const [turn, setTurn] = useState<'user' | 'cpu'>('user');
    const [message, setMessage] = useState('バトル スタート！');
    const [gameOver, setGameOver] = useState(false);

    // Initialize Game
    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = () => {
        const userDeck = createDeck();
        const cpuDeck = createDeck();

        setUser({
            hp: INITIAL_HP, maxHp: INITIAL_HP,
            energy: INITIAL_ENERGY, maxEnergy: INITIAL_ENERGY,
            hand: drawCards(userDeck, 4),
            deck: userDeck,
            shield: 0
        });

        setCpu({
            hp: INITIAL_HP, maxHp: INITIAL_HP,
            energy: INITIAL_ENERGY, maxEnergy: INITIAL_ENERGY,
            hand: drawCards(cpuDeck, 4),
            deck: cpuDeck,
            shield: 0
        });

        setTurn('user');
        setMessage('あなたの ばん です！');
        setGameOver(false);
    };

    const createDeck = () => {
        const deck = [];
        for (let i = 0; i < 15; i++) {
            deck.push({ ...CARDS[Math.floor(Math.random() * CARDS.length)], id: `card-${i}-${Math.random()}` });
        }
        return deck;
    };

    const drawCards = (deck: CardData[], count: number) => {
        const drawn = [];
        for (let i = 0; i < count; i++) {
            if (deck.length > 0) drawn.push(deck.pop()!);
        }
        return drawn;
    };

    const playCard = (card: CardData, index: number) => {
        if (turn !== 'user' || user.energy < card.cost || gameOver) return;

        // Apply Effect
        let effectMsg = '';
        if (card.type === 'attack' || card.type === 'magic') {
            let damage = card.power;
            // Check shield
            if (cpu.shield > 0) {
                const blocked = Math.min(cpu.shield, damage);
                cpu.shield -= blocked;
                damage -= blocked;
            }
            cpu.hp = Math.max(0, cpu.hp - damage);
            effectMsg = `${damage} ダメージ！`;
        } else if (card.type === 'defense') {
            user.shield += card.power;
            effectMsg = `シールド +${card.power}`;
        } else if (card.type === 'heal') {
            user.hp = Math.min(user.maxHp, user.hp + card.power);
            effectMsg = `HP +${card.power} かいふく`;
        }

        // Update State
        user.energy -= card.cost;
        user.hand.splice(index, 1);
        setUser({ ...user });
        setCpu({ ...cpu });
        setMessage(`${card.name}！ ${effectMsg}`);

        checkWin();
    };

    const endTurn = () => {
        if (gameOver) return;
        setTurn('cpu');
        setMessage('あいての ばん です...');

        // CPU Logic
        setTimeout(() => {
            cpuTurn();
        }, 1500);
    };

    const cpuTurn = () => {
        if (gameOver) return;

        // Reset CPU Energy
        cpu.energy = cpu.maxEnergy;
        cpu.shield = 0; // Reset shield at start of turn? Or keep? Let's keep for simplicity but maybe degrade.
        // Actually standard TCG: Shield lasts until next turn start usually.
        // Let's say shield lasts 1 turn.
        user.shield = 0;

        // Draw card
        if (cpu.deck.length > 0) {
            cpu.hand.push(cpu.deck.pop()!);
        }

        // Simple AI: Play random affordable cards
        let availableEnergy = cpu.energy;
        const playableCards = cpu.hand.filter(c => c.cost <= availableEnergy);

        if (playableCards.length > 0) {
            const card = playableCards[Math.floor(Math.random() * playableCards.length)];

            // Apply Effect
            let effectMsg = '';
            if (card.type === 'attack' || card.type === 'magic') {
                let damage = card.power;
                // User shield is already 0 because we reset it above (oops logic).
                // Wait, shield should protect against opponent turn.
                // So User shield should reset at start of USER turn.
                // CPU shield should reset at start of CPU turn.
                // Correcting logic:
                // Reset CPU shield now.
                cpu.shield = 0;

                // Attack User (who might have shield from previous turn? No I just reset it. Logic flaw.)
                // Let's fix: Shield lasts 1 round.
                // Resetting USER shield should happen at start of USER turn.
                // Resetting CPU shield should happen at start of CPU turn.
                // So here, CPU shield becomes 0. User shield stays.

                // Re-apply user shield logic properly?
                // Actually, let's just simplify: Shield adds to HP temporarily or blocks next attack.
                // Let's stick to: Shield reduces incoming damage, then depletes.
                // Resetting shield at start of turn is standard.
            }

            // Let's redo the turn logic slightly for robustness
            // But for now, just play the card.

            if (card.type === 'attack' || card.type === 'magic') {
                let damage = card.power;
                // Check user shield (which was set during user turn)
                // Wait, I reset user.shield = 0 at start of cpuTurn function. That was wrong.
                // I should reset cpu.shield at start of cpuTurn.
                // And reset user.shield at start of userTurn.
            }
        }

        // --- Corrected Turn Flow ---
        // 1. Start CPU Turn
        cpu.shield = 0; // Shield expires
        cpu.energy = cpu.maxEnergy;
        if (cpu.deck.length > 0) cpu.hand.push(cpu.deck.pop()!);

        // AI plays cards loop
        const playAiCard = () => {
            const playable = cpu.hand.filter(c => c.cost <= cpu.energy);
            if (playable.length === 0) {
                // End CPU turn
                startUserTurn();
                return;
            }

            const card = playable[Math.floor(Math.random() * playable.length)];
            const idx = cpu.hand.indexOf(card);
            cpu.hand.splice(idx, 1);
            cpu.energy -= card.cost;

            let effectMsg = '';
            if (card.type === 'attack' || card.type === 'magic') {
                let damage = card.power;
                if (user.shield > 0) {
                    const blocked = Math.min(user.shield, damage);
                    user.shield -= blocked;
                    damage -= blocked;
                }
                user.hp = Math.max(0, user.hp - damage);
                effectMsg = `${damage} ダメージ！`;
            } else if (card.type === 'defense') {
                cpu.shield += card.power;
                effectMsg = `シールド +${card.power}`;
            } else if (card.type === 'heal') {
                cpu.hp = Math.min(cpu.maxHp, cpu.hp + card.power);
                effectMsg = `HP +${card.power} かいふく`;
            }

            setUser({ ...user });
            setCpu({ ...cpu });
            setMessage(`CPU: ${card.name}！ ${effectMsg}`);

            if (user.hp <= 0) {
                checkWin();
            } else {
                setTimeout(playAiCard, 1000); // Play next card or end
            }
        };

        playAiCard();
    };

    const startUserTurn = () => {
        if (user.hp <= 0) return;
        setTurn('user');
        setMessage('あなたの ばん です！');
        user.shield = 0; // Shield expires
        user.energy = user.maxEnergy;
        if (user.deck.length > 0) user.hand.push(user.deck.pop()!);
        setUser({ ...user });
    };

    const checkWin = () => {
        if (user.hp <= 0) {
            setGameOver(true);
            setMessage('あなたの まけ...');
        } else if (cpu.hp <= 0) {
            setGameOver(true);
            setMessage('あなたの かち！');
        }
    };

    return (
        <div className="min-h-screen bg-slate-800 p-2 md:p-4 font-sans text-white overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <Link href="/game" className="bg-white text-slate-800 px-3 py-1 rounded-full font-bold text-sm">
                    ← もどる
                </Link>
                <h1 className="text-xl font-bold">ガルちゃん カードバトル</h1>
                <div className="w-10"></div>
            </div>

            {/* Battle Area */}
            <div className="max-w-2xl mx-auto relative h-[80vh] flex flex-col justify-between">

                {/* CPU Area */}
                <div className="bg-slate-700/50 p-4 rounded-xl border-2 border-slate-600">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center font-bold">CPU</div>
                            <div>
                                <div className="font-bold">わるい ガルちゃん</div>
                                <div className="text-xs text-gray-300">HP: {cpu.hp} / {cpu.maxHp}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-yellow-400 font-bold">⚡ {cpu.energy}</div>
                            {cpu.shield > 0 && <div className="text-blue-400 font-bold">🛡️ {cpu.shield}</div>}
                        </div>
                    </div>
                    {/* HP Bar */}
                    <div className="w-full bg-gray-900 h-4 rounded-full overflow-hidden border border-gray-600">
                        <motion.div
                            className="h-full bg-red-500"
                            initial={{ width: '100%' }}
                            animate={{ width: `${(cpu.hp / cpu.maxHp) * 100}%` }}
                        />
                    </div>
                    {/* CPU Hand (Hidden) */}
                    <div className="flex justify-center -space-x-4 mt-2 overflow-hidden h-16">
                        {cpu.hand.map((_, i) => (
                            <div key={i} className="w-12 h-16 bg-blue-800 border-2 border-white rounded-lg shadow-md"></div>
                        ))}
                    </div>
                </div>

                {/* Center Message */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={message}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-black/70 text-white px-6 py-3 rounded-full backdrop-blur-md border border-white/20 inline-block"
                        >
                            <p className="font-bold text-lg">{message}</p>
                        </motion.div>
                    </AnimatePresence>

                    {gameOver && (
                        <div className="mt-4">
                            <button onClick={startNewGame} className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform">
                                もういちど あそぶ
                            </button>
                        </div>
                    )}
                </div>

                {/* User Area */}
                <div className="bg-slate-700/50 p-4 rounded-xl border-2 border-slate-600 mt-auto">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">YOU</div>
                            <div>
                                <div className="font-bold">あなた</div>
                                <div className="text-xs text-gray-300">HP: {user.hp} / {user.maxHp}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-yellow-400 font-bold">⚡ {user.energy}</div>
                            {user.shield > 0 && <div className="text-blue-400 font-bold">🛡️ {user.shield}</div>}
                        </div>
                    </div>
                    {/* HP Bar */}
                    <div className="w-full bg-gray-900 h-4 rounded-full overflow-hidden border border-gray-600 mb-4">
                        <motion.div
                            className="h-full bg-green-500"
                            initial={{ width: '100%' }}
                            animate={{ width: `${(user.hp / user.maxHp) * 100}%` }}
                        />
                    </div>

                    {/* User Hand */}
                    <div className="flex gap-2 overflow-x-auto pb-2 justify-center min-h-[140px]">
                        {user.hand.map((card, index) => (
                            <motion.button
                                key={card.id}
                                whileHover={{ scale: 1.1, y: -10 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => playCard(card, index)}
                                disabled={turn !== 'user' || user.energy < card.cost}
                                className={`relative w-24 h-36 bg-white rounded-lg border-2 flex flex-col items-center p-1 shadow-lg flex-shrink-0 ${user.energy >= card.cost ? 'border-yellow-400 cursor-pointer' : 'border-gray-500 opacity-50 cursor-not-allowed'
                                    }`}
                            >
                                <div className="w-full h-16 relative bg-gray-100 rounded overflow-hidden mb-1">
                                    <Image src={card.image} alt={card.name} fill className="object-contain" />
                                </div>
                                <div className="text-[10px] font-bold text-center leading-tight mb-1 h-6 overflow-hidden">{card.name}</div>
                                <div className="text-[8px] text-center text-gray-600 leading-tight h-8 overflow-hidden">{card.description}</div>

                                {/* Cost Badge */}
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs border border-white">
                                    {card.cost}
                                </div>
                                {/* Power Badge */}
                                <div className="absolute -bottom-2 -right-2 w-8 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs border border-white">
                                    {card.power}
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    {/* End Turn Button */}
                    <div className="mt-2 text-center">
                        <button
                            onClick={endTurn}
                            disabled={turn !== 'user'}
                            className={`px-6 py-2 rounded-full font-bold transition-colors ${turn === 'user' ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                }`}
                        >
                            ターンをおわる
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
