import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import AnimalCard, { Suit, Rank } from './AnimalCard';

interface Card {
    suit: Suit;
    rank: Rank;
    value: number;
}

interface Player {
    id: number;
    name: string;
    chips: number;
    hand: Card[];
    isFolded: boolean;
    currentBet: number;
    isUser: boolean;
    action?: string;
    avatar: string;
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const INITIAL_CHIPS = 1000;
const BLIND = 10;

const createDeck = (): Card[] => {
    const deck: Card[] = [];
    SUITS.forEach(suit => {
        RANKS.forEach((rank, index) => {
            deck.push({ suit, rank, value: index + 2 });
        });
    });
    return deck.sort(() => Math.random() - 0.5);
};

// Simplified Hand Rank (High Card < Pair < Two Pair < Trips < Straight < Flush < Full House < Quads < Straight Flush)
// Returning score for comparison
const getHandScore = (hand: Card[], community: Card[]): number => {
    const all = [...hand, ...community];
    // Very basic score for MVP: Value + Pairs bonuses
    let score = 0;

    // High card
    const values = all.map(c => c.value).sort((a, b) => b - a);
    score += values[0];

    // Pairs
    const counts: Record<number, number> = {};
    all.forEach(c => counts[c.value] = (counts[c.value] || 0) + 1);

    let pairScore = 0;
    Object.entries(counts).forEach(([val, count]) => {
        if (count === 2) pairScore += 20 + Number(val);
        if (count === 3) pairScore += 50 + Number(val);
        if (count === 4) pairScore += 100 + Number(val);
    });
    score += pairScore;

    // Flush
    const suits: Record<string, number> = {};
    all.forEach(c => suits[c.suit] = (suits[c.suit] || 0) + 1);
    if (Object.values(suits).some(c => c >= 5)) score += 60;

    return score;
};

const PokerEngine = () => {
    const [deck, setDeck] = useState<Card[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [community, setCommunity] = useState<Card[]>([]);
    const [pot, setPot] = useState(0);
    const [phase, setPhase] = useState<'preflop' | 'flop' | 'turn' | 'river' | 'showdown'>('preflop');
    const [turnIndex, setTurnIndex] = useState(0);
    const [message, setMessage] = useState('');
    const [winnerId, setWinnerId] = useState<number | null>(null);

    // Initial Setup
    useEffect(() => {
        startRound();
    }, []);

    const startRound = () => {
        const newDeck = createDeck();
        const p1: Player = {
            id: 0,
            name: 'あなた',
            chips: players[0]?.chips || INITIAL_CHIPS,
            hand: [newDeck.pop()!, newDeck.pop()!],
            isFolded: false,
            currentBet: 0,
            isUser: true,
            action: '',
            avatar: '/images/garoop_happy.png'
        };
        const p2: Player = { // Rival
            id: 1,
            name: 'ライバル',
            chips: players[1]?.chips || INITIAL_CHIPS,
            hand: [newDeck.pop()!, newDeck.pop()!],
            isFolded: false,
            currentBet: 0,
            isUser: false,
            action: '',
            avatar: '/images/garoop_thinking.png'
        };

        setDeck(newDeck);
        setPlayers([p1, p2]);
        setCommunity([]);
        setPot(BLIND * 3); // Blind + Ante
        setPhase('preflop');
        setTurnIndex(0); // Player starts for MVP simplicity
        setMessage('あなたの番です');
        setWinnerId(null);
    };

    // Game Loop / AI Loop
    useEffect(() => {
        if (winnerId !== null) return;

        const currentPlayer = players[turnIndex];
        if (!currentPlayer.isUser) {
            // AI Turn
            const timer = setTimeout(() => {
                handleAiAction();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [turnIndex, players, winnerId]);

    const handleAiAction = () => {
        const ai = players[1];
        const rank = getHandScore(ai.hand, community);
        const rand = Math.random();

        let action = 'CHECK';
        let amount = 0;

        // Simple AI Logic
        if (rank > 30 && rand > 0.3) {
            action = 'RAISE';
            amount = 50;
        } else if (rand > 0.2) {
            action = 'CALL';
            amount = 20;
        } else {
            // Rarely fold for fun
            if (rand < 0.1) action = 'FOLD';
        }

        performAction(1, action, amount);
    };

    const performAction = (pId: number, action: string, amount: number = 0) => {
        const pIndex = players.findIndex(p => p.id === pId);
        const player = players[pIndex];

        let newPot = pot;
        let newPlayers = [...players];

        if (action === 'FOLD') {
            newPlayers[pIndex].isFolded = true;
            newPlayers[pIndex].action = 'FOLD';
            setPlayers(newPlayers);
            handleShowdown(true); // Fold = Immediate end
            return;
        } else if (action === 'CALL' || action === 'CHECK') { // Treat Check as 0 Call
            newPlayers[pIndex].chips -= amount;
            newPlayers[pIndex].currentBet += amount;
            newPlayers[pIndex].action = action;
            newPot += amount;
        } else if (action === 'RAISE') {
            newPlayers[pIndex].chips -= amount;
            newPlayers[pIndex].currentBet += amount;
            newPlayers[pIndex].action = 'RAISE';
            newPot += amount;
        }

        setPlayers(newPlayers);
        setPot(newPot);

        // Turn Management Logic (Simplified for Head-up)
        // If P1 acted, then P2 acts. If P2 acted, check if phase end.
        if (pId === 0) {
            setTurnIndex(1); // Pass to AI
            setMessage('ライバルの番です...');
        } else {
            // AI acted. Move to next phase.
            advancePhase();
        }
    };

    const advancePhase = () => {
        const newDeck = [...deck];
        const newCommunity = [...community];
        let nextPhase = phase;

        if (phase === 'preflop') {
            newCommunity.push(newDeck.pop()!, newDeck.pop()!, newDeck.pop()!); // Flop
            nextPhase = 'flop';
        } else if (phase === 'flop') {
            newCommunity.push(newDeck.pop()!); // Turn
            nextPhase = 'turn';
        } else if (phase === 'turn') {
            newCommunity.push(newDeck.pop()!); // River
            nextPhase = 'river';
        } else if (phase === 'river') {
            handleShowdown(false);
            return;
        }

        setDeck(newDeck);
        setCommunity(newCommunity);
        setPhase(nextPhase as any);
        setTurnIndex(0); // Back to player
        setMessage('あなたの番です');
        // Reset betting status for visual clarity (optional)
        setPlayers(prev => prev.map(p => ({ ...p, action: '' })));
    };

    const handleShowdown = (foldWin: boolean) => {
        const p1 = players[0];
        const p2 = players[1];
        let winner = -1;

        if (foldWin) {
            winner = p1.isFolded ? 1 : 0;
        } else {
            const s1 = getHandScore(p1.hand, community);
            const s2 = getHandScore(p2.hand, community);
            winner = s1 >= s2 ? 0 : 1;
        }

        setWinnerId(winner);
        setMessage(`${players[winner].name}の勝ち！`);

        // Award Pot
        setPlayers(prev => prev.map(p => p.id === winner ? { ...p, chips: p.chips + pot } : p));
        setPot(0);

        setTimeout(() => {
            if (window.confirm('もう一度戦いますか？')) {
                startRound();
            }
        }, 4000);
    };

    // UI Helpers
    const getCardPos = (who: 'player' | 'rival', index: number) => {
        // Just standard static class
        return "";
    };

    return (
        <div className="relative w-full h-full flex flex-col justify-between p-4 overflow-hidden">

            {/* Top: Rival Area */}
            <div className="flex justify-center items-start relative h-1/3">
                <div className={`relative flex flex-col items-center transition-all ${turnIndex === 1 ? 'scale-110' : 'scale-100'}`}>
                    {/* Avatar */}
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-red-500 overflow-hidden bg-black shadow-lg z-10">
                        <Image src={players[1]?.avatar || '/images/garoop_thinking.png'} alt="Riv" fill className="object-cover" />
                    </div>
                    {/* Bubble */}
                    <AnimatePresence>
                        {players[1]?.action && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -right-16 top-0 bg-white text-black font-bold px-4 py-2 rounded-full border-2 border-red-500 shadow-xl z-20">
                                {players[1].action}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* Cards */}
                    <div className="flex -mt-4 z-0 gap-2">
                        {players[1]?.hand.map((card, i) => (
                            <AnimalCard
                                key={i}
                                suit={card.suit}
                                rank={card.rank}
                                hidden={winnerId === null} // Hidden until showdown
                            />
                        ))}
                    </div>
                    <div className="bg-black/50 text-white px-2 rounded-full mt-2 font-mono">
                        ${players[1]?.chips}
                    </div>
                </div>
            </div>

            {/* Center: Table & Community */}
            <div className="flex-1 flex flex-col items-center justify-center relative">
                {/* Table Graphic */}
                <div className="absolute inset-x-4 inset-y-2 bg-[#1a4731] rounded-[100px] border-8 border-[#2d2018] shadow-2xl skew-x-6 transform opacity-90"></div>

                {/* Pot */}
                <div className="relative z-10 bg-black/40 px-6 py-2 rounded-full text-yellow-400 font-bold text-xl mb-4 border border-yellow-500/30 backdrop-blur-sm">
                    POT: ${pot}
                </div>

                {/* Community Cards */}
                <div className="flex gap-2 z-10 h-24 md:h-36">
                    <AnimatePresence>
                        {community.map((card, i) => (
                            <AnimalCard key={`${card.suit}-${card.rank}`} suit={card.suit} rank={card.rank} index={i} />
                        ))}
                    </AnimatePresence>
                    {Array.from({ length: 5 - community.length }).map((_, i) => (
                        <div key={i} className="w-16 h-24 md:w-24 md:h-36 rounded-lg border-2 border-dashed border-white/20 bg-white/5"></div>
                    ))}
                </div>

                {/* Message Bubble */}
                <div className="absolute top-1/2 -translate-y-1/2 right-4 md:right-20 z-20 w-48 text-center pointer-events-none">
                    <h3 className="text-white font-bold drop-shadow-md text-xl italic bg-black/20 p-2 rounded">{message}</h3>
                </div>
            </div>

            {/* Bottom: Player Area */}
            <div className="flex justify-center items-end relative h-1/3 pb-safe">
                <div className={`relative flex flex-col items-center transition-all ${turnIndex === 0 ? 'scale-105' : 'scale-100'}`}>

                    {/* Action Controls (Overlay on cards or below) */}
                    {players[0]?.isUser && turnIndex === 0 && winnerId === null && (
                        <div className="absolute -top-24 flex gap-2 z-30">
                            <button onClick={() => performAction(0, 'FOLD')} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-full shadow-lg border-b-4 border-slate-900 active:border-b-0 active:translate-y-1">
                                FOLD
                            </button>
                            <button onClick={() => performAction(0, 'CALL', 20)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-full shadow-lg border-b-4 border-blue-900 active:border-b-0 active:translate-y-1">
                                CALL $20
                            </button>
                            <button onClick={() => performAction(0, 'RAISE', 50)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-full shadow-lg border-b-4 border-red-900 active:border-b-0 active:translate-y-1">
                                RAISE $50
                            </button>
                        </div>
                    )}

                    {/* Cards */}
                    <div className="flex -mb-4 z-10 gap-2 hover:-translate-y-4 transition-transform duration-300">
                        {players[0]?.hand.map((card, i) => (
                            <AnimalCard key={i} suit={card.suit} rank={card.rank} />
                        ))}
                    </div>

                    {/* Avatar & Chips */}
                    <div className="flex items-center gap-4 mt-8 bg-black/60 p-2 pr-8 rounded-full border border-white/20 backdrop-blur-md z-20">
                        <div className="w-16 h-16 rounded-full border-2 border-blue-500 overflow-hidden bg-gray-800">
                            <Image src={players[0]?.avatar || '/images/garoop_thinking.png'} alt="You" fill className="object-cover" />
                        </div>
                        <div>
                            <div className="font-bold text-white">あなた</div>
                            <div className="text-yellow-400 font-mono text-xl">${players[0]?.chips}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Winner Overlay */}
            <AnimatePresence>
                {winnerId !== null && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1.2 }} className="text-center">
                            <h2 className="text-6xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] border-text">
                                {players[winnerId].name} WIN!!
                            </h2>
                            <div className="text-4xl mt-4">🎉</div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PokerEngine;
