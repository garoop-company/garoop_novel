"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import PlayingCard, { CardProps } from './poker/PlayingCard';

// --- Types & Constants ---
type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface Card {
    suit: Suit;
    rank: Rank;
    value: number;
}

interface Player {
    id: number;
    name: string;
    avatar: string;
    chips: number;
    hand: Card[];
    isFolded: boolean;
    currentBet: number;
    isUser: boolean;
    action?: string;
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const INITIAL_CHIPS = 1000;
const BLIND = 10;
const TURN_TIME = 20;

const createDeck = (): Card[] => {
    const deck: Card[] = [];
    SUITS.forEach(suit => {
        RANKS.forEach((rank, index) => {
            deck.push({ suit, rank, value: index + 2 });
        });
    });
    return deck.sort(() => Math.random() - 0.5);
};

const getHandRank = (hand: Card[], community: Card[]): number => {
    const allCards = [...hand, ...community];
    let score = 0;
    score += Math.max(...hand.map(c => c.value));
    const counts: { [key: number]: number } = {};
    allCards.forEach(c => counts[c.value] = (counts[c.value] || 0) + 1);
    Object.values(counts).forEach(count => {
        if (count === 2) score += 20;
        if (count === 3) score += 50;
        if (count === 4) score += 100;
    });
    const suitCounts: { [key: string]: number } = {};
    allCards.forEach(c => suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1);
    if (Object.values(suitCounts).some(c => c >= 5)) score += 60;
    return score;
};

export default function PokerGame() {
    const [deck, setDeck] = useState<Card[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [communityCards, setCommunityCards] = useState<Card[]>([]);
    const [pot, setPot] = useState(0);
    const [currentTurn, setCurrentTurn] = useState(0);
    const [phase, setPhase] = useState<'preflop' | 'flop' | 'turn' | 'river' | 'showdown'>('preflop');
    const [timeLeft, setTimeLeft] = useState(TURN_TIME);
    const [gameMessage, setGameMessage] = useState("GAME START!");
    const [winnerId, setWinnerId] = useState<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Initial Setup
    useEffect(() => {
        startNewRound();
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => {
            stopTimer();
            window.removeEventListener('resize', checkMobile);
        }
    }, []);

    // Timer & Turn Logic
    useEffect(() => {
        if (phase === 'showdown') return;
        if (players.length === 0) return;

        const currentPlayer = players[currentTurn];
        if (currentPlayer.isUser) {
            startTimer();
        } else {
            stopTimer(); // Stop timer for AI
            const timer = setTimeout(() => {
                handleAiTurn();
            }, 1000 + Math.random() * 1500); // 1-2.5s delay
            return () => clearTimeout(timer);
        }
    }, [currentTurn, phase, players]);

    const startTimer = () => {
        stopTimer();
        setTimeLeft(TURN_TIME);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleUserAction('fold');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const startNewRound = () => {
        const newDeck = createDeck();
        const newPlayers: Player[] = Array.from({ length: 5 }, (_, i) => ({
            id: i,
            name: i === 0 ? 'あなた' : i === 2 ? 'BOSS・ガル' : `CPU ${i}`,
            avatar: i === 0 ? '/images/garoop_thinking.png' : i === 2 ? '/images/garuchan_poker.png' : '/images/garoop_happy.png',
            chips: players[i]?.chips || INITIAL_CHIPS,
            hand: [newDeck.pop()!, newDeck.pop()!],
            isFolded: false,
            currentBet: 0,
            isUser: i === 0,
            action: ''
        }));

        setDeck(newDeck);
        setPlayers(newPlayers);
        setCommunityCards([]);
        setPot(BLIND * 1.5);
        setPhase('preflop');
        setCurrentTurn(0);
        setGameMessage("あなたの番です！");
        setWinnerId(null);
    };

    const nextPhase = () => {
        const newDeck = [...deck];
        let newCommunity = [...communityCards];
        let next = phase;

        if (phase === 'preflop') {
            newCommunity.push(newDeck.pop()!, newDeck.pop()!, newDeck.pop()!);
            next = 'flop';
        } else if (phase === 'flop') {
            newCommunity.push(newDeck.pop()!);
            next = 'turn';
        } else if (phase === 'turn') {
            newCommunity.push(newDeck.pop()!);
            next = 'river';
        } else if (phase === 'river') {
            next = 'showdown';
            determineWinner(newCommunity);
            return;
        }

        setDeck(newDeck);
        setCommunityCards(newCommunity);
        setPhase(next as any);
        setCurrentTurn(0);
        setPlayers(prev => prev.map(p => ({ ...p, currentBet: 0, action: '' })));
        setGameMessage(`${next.toUpperCase()}!`);
    };

    const nextTurn = () => {
        let next = (currentTurn + 1) % 5;
        let loopCount = 0;
        while (players[next].isFolded && loopCount < 5) {
            next = (next + 1) % 5;
            loopCount++;
        }

        const activePlayers = players.filter(p => !p.isFolded);
        if (activePlayers.length === 1) {
            setPhase('showdown');
            givePotToWinner(activePlayers[0].id);
            return;
        }

        if (next === 0 && players[0].action) {
            nextPhase();
        } else {
            setCurrentTurn(next);
        }
    };

    const handleUserAction = (action: 'check' | 'call' | 'raise' | 'fold') => {
        const player = players[0];
        let betAmount = 0;

        if (action === 'fold') {
            updatePlayer(0, { isFolded: true, action: 'FOLD' });
        } else if (action === 'call') {
            betAmount = 20;
            updatePlayer(0, { chips: player.chips - betAmount, currentBet: betAmount, action: 'CALL' });
            setPot(prev => prev + betAmount);
        } else if (action === 'raise') {
            betAmount = 50;
            updatePlayer(0, { chips: player.chips - betAmount, currentBet: betAmount, action: 'RAISE' });
            setPot(prev => prev + betAmount);
        } else {
            updatePlayer(0, { action: 'CHECK' });
        }
        nextTurn();
    };

    const handleAiTurn = () => {
        const player = players[currentTurn];
        const rank = getHandRank(player.hand, communityCards);
        const random = Math.random();
        let action = 'CHECK';
        let bet = 0;

        if (rank > 40 && random > 0.4) {
            action = 'RAISE';
            bet = 50;
        } else if (rank > 15 || random > 0.6) {
            action = 'CALL';
            bet = 20;
        } else if (random < 0.15) {
            action = 'FOLD';
        }

        if (action === 'FOLD') {
            updatePlayer(currentTurn, { isFolded: true, action });
        } else {
            updatePlayer(currentTurn, { chips: player.chips - bet, currentBet: bet, action });
            setPot(prev => prev + bet);
        }
        nextTurn();
    };

    const updatePlayer = (id: number, updates: Partial<Player>) => {
        setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const determineWinner = (finalCommunity: Card[]) => {
        const activePlayers = players.filter(p => !p.isFolded);
        let bestScore = -1;
        let wId = -1;

        // Simple eval
        activePlayers.forEach(p => {
            const score = getHandRank(p.hand, finalCommunity);
            if (score > bestScore) {
                bestScore = score;
                wId = p.id;
            }
        });

        givePotToWinner(wId);
    };

    const givePotToWinner = (wId: number) => {
        setWinnerId(wId);
        setGameMessage(`${players[wId].name} WIN!!`);
        setPlayers(prev => prev.map(p => p.id === wId ? { ...p, chips: p.chips + pot } : p));
        setPot(0);
        setTimeout(() => startNewRound(), 6000);
    };

    // --- UI Helpers ---
    const getPosStyle = (index: number) => {
        // Mobile Positioning (Portrait-ish)
        if (isMobile) {
            const styles = [
                "bottom-32 left-1/2 -translate-x-1/2", // User (Above controls)
                "bottom-[180px] left-2 scale-90", // CPU 1
                "top-24 left-1/2 -translate-x-1/2 scale-110 z-30", // BOSS (CPU 2) Top Center
                "top-24 right-4 scale-90", // CPU 3
                "bottom-[180px] right-2 scale-90", // CPU 4
            ];
            return styles[index];
        }

        // Desktop Positioning (Landscape)
        const styles = [
            "bottom-10 left-1/2 -translate-x-1/2", // User
            "bottom-40 left-10", // CPU 1
            "top-16 left-1/2 -translate-x-1/2 scale-125 z-30", // BOSS (CPU 2) Top Center
            "top-24 right-20", // CPU 3
            "bottom-40 right-10", // CPU 4
            // Re-arrange CPU 1, 3, 4 to sides
        ];

        // Custom adjustment for the 5 player layout
        if (index === 0) return "bottom-10 left-1/2 -translate-x-1/2";
        if (index === 2) return "top-10 left-1/2 -translate-x-1/2 scale-110"; // Boss
        if (index === 1) return "left-10 top-1/2 -translate-y-1/2";
        if (index === 3) return "right-10 top-1/2 -translate-y-1/2"; // Right
        if (index === 4) return "bottom-32 right-32 hidden"; // Hide 5th player for check or put somewhere else? Let's just stack 

        // Revert to circle for now but highlight Boss
        const circular = [
            "bottom-10 left-1/2 -translate-x-1/2",
            "bottom-32 left-10",
            "top-10 left-1/2 -translate-x-1/2 scale-125 origin-top", // BOSS
            "bottom-32 right-10",
            "top-32 right-10 hidden" // Let's reduce to 4 enemies? Or just keep 5.
        ];

        // Let's stick to the previous layout but Boss at Top Center
        const standard = [
            "bottom-10 left-1/2 -translate-x-1/2", // User
            "bottom-40 left-10", // CPU 1
            "top-12 left-1/2 -translate-x-1/2 scale-110", // CPU 2 (BOSS)
            "top-24 right-20", // CPU 3
            "bottom-40 right-10", // CPU 4
        ];
        return standard[index];
    };

    return (
        <div className="min-h-screen w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-800 via-green-900 to-black overflow-hidden font-sans relative flex flex-col items-center">

            {/* Background Texture */}
            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] pointer-events-none"></div>

            {/* Header / Nav */}
            <div className="absolute top-0 w-full p-2 md:p-4 flex justify-between items-start z-30 pointer-events-none">
                <Link href="/game" className="bg-black/40 text-white text-xs md:text-base px-4 py-2 rounded-full font-bold backdrop-blur-md border border-white/20 transition-all pointer-events-auto hover:bg-black/60">
                    ← 戻る
                </Link>
                <div className="text-right text-white bg-black/50 px-4 py-2 rounded-lg backdrop-blur-md border border-yellow-500/50">
                    <div className="text-[10px] opacity-70 tracking-widest text-yellow-200">TOTAL CHIPS</div>
                    <div className="text-xl md:text-3xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                        ${players[0]?.chips.toLocaleString() || 0}
                    </div>
                </div>
            </div>

            {/* Poker Table Container */}
            <div className={`relative w-[95%] max-w-6xl transition-all duration-300 mt-16 md:mt-0 md:top-1/2 md:-translate-y-1/2 ${isMobile ? 'h-[60vh]' : 'aspect-[2.2/1]'} bg-[#1e3a2f] rounded-[50px] md:rounded-[200px] border-[8px] md:border-[20px] border-[#3e2723] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-center ring-1 ring-white/10`}>

                {/* Table Inner Felt */}
                <div className="absolute inset-4 md:inset-8 rounded-[40px] md:rounded-[180px] border-2 md:border-4 border-[#ffffff10] shadow-inner pointer-events-none"></div>

                {/* Logo on Table */}
                <div className="absolute top-[20%] md:top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] opacity-10 pointer-events-none text-center w-full">
                    <h1 className="text-3xl md:text-6xl font-black text-black tracking-widest font-serif">GAROOP CASINO</h1>
                </div>

                {/* Pot */}
                <div className="absolute top-[30%] md:top-[35%] left-1/2 -translate-x-1/2 text-center z-10">
                    <div className="text-[10px] md:text-xs text-yellow-200 font-bold tracking-widest mb-1">TOTAL POT</div>
                    <div className="text-2xl md:text-5xl font-black text-white drop-shadow-md bg-black/40 px-6 py-2 rounded-full border border-yellow-500/30 backdrop-blur-sm flex items-center gap-2">
                        <span className="text-yellow-500 text-xl md:text-3xl">🪙</span>
                        ${pot.toLocaleString()}
                    </div>
                </div>

                {/* Community Cards */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[20%] md:translate-y-[30%] flex gap-2 md:gap-4 perspective-1000 scale-75 md:scale-100 origin-center z-20">
                    <AnimatePresence>
                        {communityCards.map((card, i) => (
                            <PlayingCard key={`${card.suit}-${card.rank}`} suit={card.suit} rank={card.rank} index={i} />
                        ))}
                    </AnimatePresence>
                    {/* Placeholders */}
                    {Array.from({ length: 5 - communityCards.length }).map((_, i) => (
                        <div key={`empty-${i}`} className="w-16 h-24 md:w-24 md:h-36 rounded-lg border-2 border-dashed border-white/20 bg-black/10"></div>
                    ))}
                </div>

                {/* Players */}
                {players.map((player, index) => {
                    const isWinning = winnerId === player.id;
                    const isThinking = currentTurn === index && !player.isFolded && !winnerId;
                    const isBoss = index === 2; // Boss is CPU 2

                    return (
                        <div key={player.id} className={`absolute ${getPosStyle(index)} flex flex-col items-center transition-all duration-500 z-20 ${player.isFolded ? 'opacity-40 grayscale scale-90' : ''}`}>

                            {/* Player Card UI */}
                            <div className={`relative bg-black/60 backdrop-blur-md rounded-xl p-2 md:p-3 border-2 transition-all duration-300 ${isThinking ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)] scale-105' : 'border-white/10'} ${isWinning ? 'border-pink-500 shadow-[0_0_50px_rgba(236,72,153,0.8)] scale-110 !z-50' : ''}`}>

                                {/* Avatar */}
                                <div className={`absolute -top-8 md:-top-12 left-1/2 -translate-x-1/2 w-14 h-14 md:w-20 md:h-20 rounded-full border-4 ${isBoss ? 'border-purple-500 shadow-[0_0_20px_purple]' : 'border-gray-700'} bg-gray-800 overflow-hidden z-20`}>
                                    <Image
                                        src={player.avatar}
                                        alt={player.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                {isBoss && <div className="absolute -top-12 md:-top-16 left-1/2 -translate-x-1/2 text-2xl md:text-4xl z-30 drop-shadow-lg">👑</div>}

                                {/* Name & Bet */}
                                <div className="mt-6 md:mt-8 text-center min-w-[90px] md:min-w-[130px]">
                                    <div className={`font-bold text-[10px] md:text-sm truncate ${isBoss ? 'text-purple-300' : 'text-gray-300'}`}>{player.name}</div>
                                    <div className="text-yellow-400 font-mono font-bold text-xs md:text-lg flex items-center justify-center gap-1">
                                        <span className="text-[10px]">🪙</span>{player.currentBet}
                                    </div>
                                </div>

                                {/* Hand Cards */}
                                <div className="flex gap-1 justify-center mt-2">
                                    {player.hand.map((card, cIndex) => (
                                        <div key={cIndex} className={`w-10 h-14 md:w-14 md:h-20 bg-white rounded border border-gray-300 relative overflow-hidden shadow-sm ${!player.isUser && phase !== 'showdown' ? 'bg-red-700' : ''}`}>
                                            {(!player.isUser && phase !== 'showdown') ? (
                                                <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#00000010_5px,#00000010_10px)] flex items-center justify-center">
                                                    <div className="text-yellow-500 opacity-50 text-2xl">⚜️</div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-xs md:text-base font-bold leading-tight">
                                                    <span className={['♥', '♦'].includes(card.suit) ? 'text-red-600' : 'text-black'}>{card.suit}</span>
                                                    <span className={['♥', '♦'].includes(card.suit) ? 'text-red-600' : 'text-black'}>{card.rank}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Action Bubble */}
                                <AnimatePresence>
                                    {player.action && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.5, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute -right-4 -top-4 md:-right-6 md:-top-6 bg-white text-black font-black px-2 py-1 md:px-4 md:py-1 rounded-full shadow-xl border-2 border-black z-30 text-xs md:text-base"
                                        >
                                            {player.action}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    );
                })}

            </div>

            {/* Game Controls (Bottom Bar) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent z-40 pb-safe">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-end justify-between gap-4">

                    {/* Game Status Text */}
                    <div className="mb-0 md:mb-4 w-full md:w-auto text-center md:text-left">
                        <h2 className="text-xl md:text-3xl font-black text-white drop-shadow-lg italic tracking-wider whitespace-nowrap">
                            {gameMessage}
                        </h2>
                        {players[0]?.isUser && currentTurn === 0 && !winnerId && (
                            <div className="text-red-400 font-bold animate-pulse text-sm">
                                ⏳ のこり {timeLeft} びょう
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className={`grid grid-cols-2 gap-2 md:flex md:gap-4 w-full md:w-auto ${players[0]?.isUser && currentTurn === 0 && !players[0].isFolded && !winnerId ? '' : 'pointer-events-none opacity-50 grayscale'}`}>
                        {/* Buttons */}
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleUserAction('fold')} className="h-16 md:w-24 md:h-24 rounded-2xl md:rounded-full bg-slate-700 border-b-4 md:border-4 border-slate-900 shadow-xl text-white font-black text-sm md:text-lg flex md:flex-col items-center justify-center gap-2 hover:bg-slate-600 transition-colors">
                            <span className="text-xl">🏳️</span>
                            <span>FOLD</span>
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleUserAction('check')} className="h-16 md:w-24 md:h-24 rounded-2xl md:rounded-full bg-blue-600 border-b-4 md:border-4 border-blue-800 shadow-xl text-white font-black text-sm md:text-lg flex md:flex-col items-center justify-center gap-2 hover:bg-blue-500 transition-colors">
                            <span className="text-xl">👀</span>
                            <span>CHECK</span>
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleUserAction('call')} className="h-16 md:w-24 md:h-24 rounded-2xl md:rounded-full bg-green-600 border-b-4 md:border-4 border-green-800 shadow-xl text-white font-black text-sm md:text-lg flex md:flex-col items-center justify-center gap-2 hover:bg-green-500 transition-colors">
                            <span className="text-xl">👍</span>
                            <span>CALL</span>
                            <span className="text-[10px] md:text-xs opacity-80">$20</span>
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleUserAction('raise')} className="h-16 md:w-24 md:h-24 rounded-2xl md:rounded-full bg-red-600 border-b-4 md:border-4 border-red-800 shadow-xl text-white font-black text-sm md:text-lg flex md:flex-col items-center justify-center gap-2 hover:bg-red-500 transition-colors">
                            <span className="text-xl">🔥</span>
                            <span>RAISE</span>
                            <span className="text-[10px] md:text-xs opacity-80">$50</span>
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Winner Overlay (Visual Flair) */}
            <AnimatePresence>
                {winnerId !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                        <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1.5, rotate: 0 }}
                            className="relative text-center"
                        >
                            <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] stroke-white stroke-2">
                                {players[winnerId].name === 'あなた' ? 'YOU WIN!' : 'WINNER!'}
                            </h1>
                            <div className="text-4xl md:text-6xl mt-4 font-bold text-white drop-shadow-lg">
                                {players[winnerId].name}
                            </div>
                            {players[winnerId].name === 'あなた' && (
                                <div className="absolute -top-20 -right-20 text-6xl md:text-9xl animate-bounce">
                                    💰
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
