"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// Puzzle themes
const THEMES = [
    { id: 'shipbuilding', name: 'ぞうせんじょ', image: '/images/games/puzzle/shipbuilding.png' },
    { id: 'soccer', name: 'サッカー', image: '/images/games/puzzle/soccer.png' },
    // Fallbacks for missing assets
    { id: 'stadium', name: 'スタジアム', image: '/images/games/puzzle/soccer.png' }, // Reuse soccer for now
    { id: 'nagasaki', name: 'ながさき', image: '/images/games/puzzle/shipbuilding.png' }, // Reuse shipbuilding for now
];

const GRID_SIZE = 3; // 3x3 puzzle

export default function PuzzleGame() {
    const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
    const [tiles, setTiles] = useState<number[]>([]);
    const [isSolved, setIsSolved] = useState(false);
    const [moves, setMoves] = useState(0);

    // Initialize puzzle
    useEffect(() => {
        startNewGame();
    }, [selectedTheme]);

    const startNewGame = () => {
        const solvedState = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);
        let shuffled = [...solvedState];

        // Simple shuffle: random valid moves from solved state
        // (To ensure solvability, we simulate random moves instead of random shuffle)
        let emptyIdx = GRID_SIZE * GRID_SIZE - 1;
        for (let i = 0; i < 100; i++) {
            const neighbors = getNeighbors(emptyIdx);
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            [shuffled[emptyIdx], shuffled[randomNeighbor]] = [shuffled[randomNeighbor], shuffled[emptyIdx]];
            emptyIdx = randomNeighbor;
        }

        setTiles(shuffled);
        setIsSolved(false);
        setMoves(0);
    };

    const getNeighbors = (index: number) => {
        const neighbors = [];
        const row = Math.floor(index / GRID_SIZE);
        const col = index % GRID_SIZE;

        if (row > 0) neighbors.push(index - GRID_SIZE); // Up
        if (row < GRID_SIZE - 1) neighbors.push(index + GRID_SIZE); // Down
        if (col > 0) neighbors.push(index - 1); // Left
        if (col < GRID_SIZE - 1) neighbors.push(index + 1); // Right

        return neighbors;
    };

    const handleTileClick = (index: number) => {
        if (isSolved) return;

        const emptyIndex = tiles.indexOf(GRID_SIZE * GRID_SIZE - 1);
        const neighbors = getNeighbors(emptyIndex);

        if (neighbors.includes(index)) {
            const newTiles = [...tiles];
            [newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]];
            setTiles(newTiles);
            setMoves(moves + 1);
            checkWin(newTiles);
        }
    };

    const checkWin = (currentTiles: number[]) => {
        const isWin = currentTiles.every((tile, index) => tile === index);
        if (isWin) {
            setIsSolved(true);
        }
    };

    return (
        <div className="min-h-screen bg-blue-100 p-4 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <Link href="/game" className="bg-white text-blue-500 px-4 py-2 rounded-full font-bold border-2 border-blue-500 hover:bg-blue-50">
                        ← もどる
                    </Link>
                    <h1 className="text-3xl font-black text-blue-600">パズルゲーム</h1>
                    <div className="w-24"></div> {/* Spacer */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar: Theme Selection */}
                    <div className="bg-white p-6 rounded-3xl shadow-lg border-4 border-blue-300">
                        <h2 className="text-xl font-bold mb-4 text-gray-700">えらんでね</h2>
                        <div className="space-y-3">
                            {THEMES.map((theme) => (
                                <button
                                    key={theme.id}
                                    onClick={() => setSelectedTheme(theme)}
                                    className={`w-full p-3 rounded-xl text-left font-bold transition-all flex items-center gap-3 ${selectedTheme.id === theme.id
                                            ? 'bg-blue-500 text-white shadow-md scale-105'
                                            : 'bg-gray-100 text-gray-600 hover:bg-blue-100'
                                        }`}
                                >
                                    <div className="w-10 h-10 relative rounded-lg overflow-hidden border-2 border-white">
                                        <Image src={theme.image} alt={theme.name} fill className="object-cover" />
                                    </div>
                                    {theme.name}
                                </button>
                            ))}
                        </div>

                        <div className="mt-8">
                            <div className="bg-yellow-100 p-4 rounded-xl border-2 border-yellow-400 text-center">
                                <p className="text-yellow-800 font-bold text-lg">てかず: {moves}</p>
                            </div>
                            <button
                                onClick={startNewGame}
                                className="w-full mt-4 bg-green-500 text-white py-3 rounded-xl font-bold shadow-md hover:bg-green-600 transition-colors"
                            >
                                もういちど やる
                            </button>
                        </div>
                    </div>

                    {/* Game Area */}
                    <div className="md:col-span-2 flex flex-col items-center">
                        <div
                            className="relative bg-white p-2 rounded-xl shadow-2xl border-4 border-blue-500"
                            style={{ width: 'min(100%, 500px)', aspectRatio: '1/1' }}
                        >
                            {isSolved && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center rounded-lg backdrop-blur-sm"
                                >
                                    <div className="bg-white p-8 rounded-3xl text-center border-8 border-yellow-400 shadow-2xl transform rotate-3">
                                        <h2 className="text-4xl font-black text-orange-500 mb-2">すごい！</h2>
                                        <p className="text-2xl font-bold text-gray-700">クリア おめでとう！</p>
                                        <div className="mt-4 text-6xl">🎉</div>
                                    </div>
                                </motion.div>
                            )}

                            <div
                                className="grid gap-1 w-full h-full bg-gray-200"
                                style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
                            >
                                {tiles.map((tileIndex, positionIndex) => {
                                    // The last tile (GRID_SIZE*GRID_SIZE - 1) is the empty space
                                    const isEmpty = tileIndex === GRID_SIZE * GRID_SIZE - 1;
                                    if (isEmpty) return <div key={`empty-${positionIndex}`} className="bg-gray-200/50" />;

                                    // Calculate background position
                                    const row = Math.floor(tileIndex / GRID_SIZE);
                                    const col = tileIndex % GRID_SIZE;
                                    const percentX = (col / (GRID_SIZE - 1)) * 100;
                                    const percentY = (row / (GRID_SIZE - 1)) * 100;

                                    return (
                                        <motion.button
                                            key={tileIndex}
                                            layout
                                            onClick={() => handleTileClick(positionIndex)}
                                            className="relative overflow-hidden rounded-md shadow-sm hover:brightness-110 transition-all"
                                            style={{
                                                backgroundImage: `url(${selectedTheme.image})`,
                                                backgroundSize: `${GRID_SIZE * 100}%`,
                                                backgroundPosition: `${percentX}% ${percentY}%`
                                            }}
                                        >
                                            {/* Optional: Number overlay for easier debugging/playing for kids */}
                                            {/* <span className="absolute top-1 left-1 bg-white/70 px-1 rounded text-xs font-bold">{tileIndex + 1}</span> */}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
