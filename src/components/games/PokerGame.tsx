"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// --- Types & Constants ---
type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

interface Card {
    suit: Suit;
    rank: Rank;
    value: number; // 2-14 for comparison
}

interface Player {
    id: number;
    name: string;
    chips: number;
    hand: Card[];
    isFolded: boolean;
    currentBet: number;
    isUser: boolean;
    action?: string; // "Check", "Call", "Raise", "Fold"
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const INITIAL_CHIPS = 1000;
const BLIND = 10;
const TURN_TIME = 30; // seconds

// --- Helper Functions ---
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
    // Simplified rank strength for AI logic (0-100 scale roughly)
    // This is a placeholder for a real evaluator. 
    // For this kid version, we'll just sum values + bonus for pairs.
    const allCards = [...hand, ...community];
    let score = 0;

    // High card
    score += Math.max(...hand.map(c => c.value));

    // Pairs
    const counts: { [key: number]: number } = {};
    allCards.forEach(c => counts[c.value] = (counts[c.value] || 0) + 1);

    Object.values(counts).forEach(count => {
        if (count === 2) score += 20;
        if (count === 3) score += 50;
        if (count === 4) score += 100;
    });

    // Flush check (simplified)
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
    const [gameMessage, setGameMessage] = useState("ゲーム スタート！");
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize Game
    useEffect(() => {
        startNewRound();
        return () => stopTimer();
    }, []);

    // Timer Logic
    useEffect(() => {
        if (phase === 'showdown') return;

        if (players[currentTurn]?.isUser) {
            startTimer();
        } else {
            stopTimer();
            // AI Turn
            const timer = setTimeout(() => {
                handleAiTurn();
            }, 1000 + Math.random() * 1000); // 1-2s delay
            return () => clearTimeout(timer);
        }
    }, [currentTurn, phase, players]);

    const startTimer = () => {
        stopTimer();
        setTimeLeft(TURN_TIME);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleUserAction('fold'); // Auto fold on timeout
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
        const newPlayers = Array.from({ length: 5 }, (_, i) => ({
            id: i,
            name: i === 0 ? 'あなた' : `CPU ${i}`,
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
        setPot(BLIND * 1.5); // Small + Big blind simplified
        setPhase('preflop');
        setCurrentTurn(0); // User starts for simplicity
        setGameMessage("あなたの ばん です！");
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
            determineWinner();
            return;
        }

        setDeck(newDeck);
        setCommunityCards(newCommunity);
        setPhase(next as any);
        setCurrentTurn(0); // Reset turn to user

        // Reset bets for new round
        setPlayers(prev => prev.map(p => ({ ...p, currentBet: 0, action: '' })));
        setGameMessage(`${next.toUpperCase()}！`);
    };

    const nextTurn = () => {
        let next = (currentTurn + 1) % 5;
        let loopCount = 0;

        // Find next active player
        while (players[next].isFolded && loopCount < 5) {
            next = (next + 1) % 5;
            loopCount++;
        }

        // If back to start or all folded
        const activePlayers = players.filter(p => !p.isFolded);
        if (activePlayers.length === 1) {
            // Winner by fold
            setPhase('showdown');
            setGameMessage(`${activePlayers[0].name} の かち！`);
            givePotToWinner(activePlayers[0].id);
            return;
        }

        // Check if round is complete (simplified: everyone acted once)
        // In real poker, betting continues until matched. Here, we do 1 round per phase for simplicity.
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
            updatePlayer(0, { isFolded: true, action: 'Fold' });
        } else if (action === 'call') {
            betAmount = 20; // Fixed bet for simplicity
            updatePlayer(0, { chips: player.chips - betAmount, currentBet: betAmount, action: 'Call' });
            setPot(prev => prev + betAmount);
        } else if (action === 'raise') {
            betAmount = 50;
            updatePlayer(0, { chips: player.chips - betAmount, currentBet: betAmount, action: 'Raise' });
            setPot(prev => prev + betAmount);
        } else {
            updatePlayer(0, { action: 'Check' });
        }

        nextTurn();
    };

    const handleAiTurn = () => {
        const player = players[currentTurn];
        const rank = getHandRank(player.hand, communityCards);
        const random = Math.random();

        // Simple AI Logic
        let action = 'Check';
        let bet = 0;

        if (rank > 50 && random > 0.3) {
            action = 'Raise';
            bet = 50;
        } else if (rank > 20 || random > 0.5) {
            action = 'Call';
            bet = 20;
        } else if (random < 0.1) {
            action = 'Fold';
        }

        if (action === 'Fold') {
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

    const determineWinner = () => {
        const activePlayers = players.filter(p => !p.isFolded);
        let bestScore = -1;
        let winnerId = -1;

        activePlayers.forEach(p => {
            const score = getHandRank(p.hand, communityCards);
            if (score > bestScore) {
                bestScore = score;
                winnerId = p.id;
            }
        });

        setGameMessage(`${players[winnerId].name} の かち！`);
        givePotToWinner(winnerId);
    };

    const givePotToWinner = (winnerId: number) => {
        setPlayers(prev => prev.map(p => p.id === winnerId ? { ...p, chips: p.chips + pot } : p));
        setPot(0);
        setTimeout(() => {
            // Auto restart after 5s
            startNewRound();
        }, 5000);
    };

    // --- Render Helpers ---
    const getSuitColor = (suit: Suit) => (suit === '♥' || suit === '♦') ? 'text-red-500' : 'text-black';

    const CardView = ({ card, hidden = false }: { card?: Card, hidden?: boolean }) => {
        if (!card) return <div className="w-12 h-16 bg-gray-200 rounded border border-gray-300"></div>;
        if (hidden) return (
            <div className="w-12 h-16 bg-blue-600 rounded border-2 border-white shadow-sm flex items-center justify-center">
                <span className="text-white text-xl">★</span>
            </div>
        );

        return (
            <div className="w-12 h-16 bg-white rounded border border-gray-300 shadow-sm flex flex-col items-center justify-center text-lg font-bold">
                <span className={getSuitColor(card.suit)}>{card.suit}</span>
                <span className={getSuitColor(card.suit)}>{card.rank}</span>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-green-800 p-4 font-sans text-white">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <Link href="/game" className="bg-white text-green-800 px-4 py-2 rounded-full font-bold hover:bg-green-100">
                    ← もどる
                </Link>
                <div className="text-center">
                    <h1 className="text-2xl font-bold">テキサス ポーカー</h1>
                    <p className="text-yellow-300 font-bold text-xl">POT: ${pot}</p>
                </div>
                <div className="w-20"></div>
            </div>

            {/* Game Table */}
            <div className="relative w-full max-w-4xl mx-auto aspect-video bg-green-700 rounded-full border-8 border-green-900 shadow-2xl flex items-center justify-center">

                {/* Community Cards */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-2">
                    {communityCards.map((card, i) => (
                        <CardView key={i} card={card} />
                    ))}
                    {Array.from({ length: 5 - communityCards.length }).map((_, i) => (
                        <div key={`empty-${i}`} className="w-12 h-16 bg-green-900/50 rounded border border-green-800"></div>
                    ))}
                </div>

                {/* Message Overlay */}
                <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 px-6 py-2 rounded-full backdrop-blur-sm z-10">
                    <p className="text-xl font-bold text-yellow-300 animate-pulse">{gameMessage}</p>
                </div>

                {/* Players */}
                {players.map((player, index) => {
                    // Positioning logic for 5 players (User at bottom)
                    const positions = [
                        'bottom-4 left-1/2 transform -translate-x-1/2', // User
                        'bottom-1/4 left-4', // CPU 1
                        'top-1/4 left-4', // CPU 2
                        'top-1/4 right-4', // CPU 3
                        'bottom-1/4 right-4', // CPU 4
                    ];

                    const isCurrent = currentTurn === index;

                    return (
                        <div key={player.id} className={`absolute ${positions[index]} flex flex-col items-center transition-all ${player.isFolded ? 'opacity-50 grayscale' : ''}`}>
                            <div className={`relative p-2 rounded-xl bg-black/40 backdrop-blur-md border-2 ${isCurrent ? 'border-yellow-400 scale-110 shadow-[0_0_20px_rgba(250,204,21,0.5)]' : 'border-white/20'}`}>
                                {/* Avatar */}
                                <div className="w-12 h-12 bg-gray-300 rounded-full mb-2 mx-auto overflow-hidden border-2 border-white">
                                    {/* Placeholder avatar */}
                                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold">
                                        {player.isUser ? 'YOU' : 'CPU'}
                                    </div>
                                </div>

                                {/* Name & Chips */}
                                <div className="text-center text-xs mb-1">
                                    <div className="font-bold">{player.name}</div>
                                    <div className="text-yellow-300">${player.chips}</div>
                                </div>

                                {/* Hand */}
                                <div className="flex gap-1 justify-center">
                                    <CardView card={player.hand[0]} hidden={!player.isUser && phase !== 'showdown'} />
                                    <CardView card={player.hand[1]} hidden={!player.isUser && phase !== 'showdown'} />
                                </div>

                                {/* Action Bubble */}
                                {player.action && (
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-black px-2 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                                        {player.action}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* User Controls */}
            <div className="fixed bottom-0 left-0 w-full bg-black/80 p-4 backdrop-blur-md border-t border-white/10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="text-white font-bold">
                        のこりじかん: <span className={`text-2xl ${timeLeft < 10 ? 'text-red-500' : 'text-white'}`}>{timeLeft}</span> びょう
                    </div>

                    <div className="flex gap-4">
                        {players[0]?.isUser && currentTurn === 0 && !players[0].isFolded ? (
                            <>
                                <button onClick={() => handleUserAction('fold')} className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transform active:scale-95 transition-all">
                                    おりる (FOLD)
                                </button>
                                <button onClick={() => handleUserAction('check')} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transform active:scale-95 transition-all">
                                    チェック (CHECK)
                                </button>
                                <button onClick={() => handleUserAction('call')} className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-xl font-bold shadow-lg transform active:scale-95 transition-all">
                                    のる (CALL $20)
                                </button>
                                <button onClick={() => handleUserAction('raise')} className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg transform active:scale-95 transition-all">
                                    あげる (RAISE $50)
                                </button>
                            </>
                        ) : (
                            <div className="text-gray-400 font-bold text-lg">あいての ばん です...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
