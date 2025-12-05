"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// --- Constants ---
const GRID_SIZE = 15;
const CELL_SIZE = 40;
const WALL = 1;
const BLOCK = 2;
const BOMB = 3;
const EXPLOSION = 4;
const EMPTY = 0;

export default function BomberGame() {
    const [grid, setGrid] = useState<number[][]>([]);
    const [player, setPlayer] = useState({ x: 1, y: 1 });
    const [enemies, setEnemies] = useState([{ id: 1, x: 13, y: 13 }]);
    const [gameOver, setGameOver] = useState(false);
    const [win, setWin] = useState(false);

    // Initialize Grid
    useEffect(() => {
        const newGrid = Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0));

        // Walls
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (x === 0 || x === GRID_SIZE - 1 || y === 0 || y === GRID_SIZE - 1 || (x % 2 === 0 && y % 2 === 0)) {
                    newGrid[y][x] = WALL;
                } else if (Math.random() > 0.7 && !(x === 1 && y === 1) && !(x === 2 && y === 1) && !(x === 1 && y === 2)) {
                    newGrid[y][x] = BLOCK;
                }
            }
        }
        setGrid(newGrid);
    }, []);

    // Input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameOver || win) return;

            let dx = 0;
            let dy = 0;

            if (e.key === 'ArrowUp') dy = -1;
            if (e.key === 'ArrowDown') dy = 1;
            if (e.key === 'ArrowLeft') dx = -1;
            if (e.key === 'ArrowRight') dx = 1;
            if (e.key === ' ') placeBomb();

            if (dx !== 0 || dy !== 0) {
                const nx = player.x + dx;
                const ny = player.y + dy;
                if (grid[ny][nx] === EMPTY || grid[ny][nx] === EXPLOSION) { // Can walk into explosion (and die)
                    setPlayer({ x: nx, y: ny });
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [player, grid, gameOver, win]);

    // Game Loop (Enemies & Explosions check)
    useEffect(() => {
        if (gameOver || win) return;

        const interval = setInterval(() => {
            // Move Enemies
            setEnemies(prev => prev.map(enemy => {
                const moves = [
                    { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }
                ];
                const validMoves = moves.filter(m => {
                    const nx = enemy.x + m.x;
                    const ny = enemy.y + m.y;
                    return grid[ny] && grid[ny][nx] === EMPTY;
                });

                if (validMoves.length > 0) {
                    const move = validMoves[Math.floor(Math.random() * validMoves.length)];
                    return { ...enemy, x: enemy.x + move.x, y: enemy.y + move.y };
                }
                return enemy;
            }));

            // Check Collision
            if (grid[player.y][player.x] === EXPLOSION) {
                setGameOver(true);
            }
            enemies.forEach(e => {
                if (e.x === player.x && e.y === player.y) setGameOver(true);
                if (grid[e.y][e.x] === EXPLOSION) {
                    setEnemies(prev => prev.filter(en => en.id !== e.id));
                    if (enemies.length <= 1) setWin(true); // Last enemy died
                }
            });

        }, 500);

        return () => clearInterval(interval);
    }, [player, grid, enemies, gameOver, win]);

    const placeBomb = () => {
        if (grid[player.y][player.x] === BOMB) return;

        const bx = player.x;
        const by = player.y;

        setGrid(prev => {
            const next = [...prev.map(row => [...row])];
            next[by][bx] = BOMB;
            return next;
        });

        setTimeout(() => explode(bx, by), 3000);
    };

    const explode = (bx: number, by: number) => {
        setGrid(prev => {
            const next = [...prev.map(row => [...row])];
            next[by][bx] = EXPLOSION;

            const directions = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
            directions.forEach(d => {
                for (let i = 1; i <= 2; i++) { // Range 2
                    const nx = bx + d.x * i;
                    const ny = by + d.y * i;
                    if (next[ny][nx] === WALL) break;
                    if (next[ny][nx] === BLOCK) {
                        next[ny][nx] = EXPLOSION;
                        break; // Stop at block
                    }
                    next[ny][nx] = EXPLOSION;
                }
            });
            return next;
        });

        setTimeout(() => clearExplosion(bx, by), 500);
    };

    const clearExplosion = (bx: number, by: number) => {
        setGrid(prev => {
            const next = [...prev.map(row => [...row])];
            // Simple clear (might clear overlapping explosions, but acceptable for mini-game)
            for (let y = 0; y < GRID_SIZE; y++) {
                for (let x = 0; x < GRID_SIZE; x++) {
                    if (next[y][x] === EXPLOSION) next[y][x] = EMPTY;
                }
            }
            return next;
        });
    };

    // Touch Controls
    const handleMove = (dx: number, dy: number) => {
        if (gameOver || win) return;
        const nx = player.x + dx;
        const ny = player.y + dy;
        if (grid[ny] && (grid[ny][nx] === EMPTY || grid[ny][nx] === EXPLOSION)) {
            setPlayer({ x: nx, y: ny });
        }
    };

    return (
        <div className="min-h-screen bg-green-800 font-sans text-white flex flex-col items-center justify-center p-4 relative overflow-hidden touch-none">

            {/* Header */}
            <div className="absolute top-4 left-4 z-20">
                <Link href="/game" className="bg-white text-green-800 px-4 py-2 md:px-6 md:py-3 rounded-full font-bold shadow-lg hover:bg-green-100 transition-colors text-sm md:text-base">
                    ← もどる
                </Link>
            </div>

            <h1 className="text-2xl md:text-4xl font-black text-white mb-4 z-10 drop-shadow-sm mt-12 md:mt-0">
                ガルちゃん ボンバー
            </h1>

            {/* Game Container - Scaled for mobile */}
            <div className="relative w-full max-w-[600px] aspect-square flex items-center justify-center">
                <div className="relative bg-green-600 p-2 md:p-4 rounded-xl shadow-2xl border-4 border-white transform scale-75 md:scale-100 origin-center">
                    <div
                        className="grid gap-0"
                        style={{
                            gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                            gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`
                        }}
                    >
                        {grid.map((row, y) => row.map((cell, x) => (
                            <div key={`${x}-${y}`} className="w-full h-full flex items-center justify-center relative">
                                {/* Floor */}
                                <div className="absolute inset-0 bg-green-500 border border-green-600"></div>

                                {/* Objects */}
                                {cell === WALL && <div className="w-full h-full bg-gray-400 border-4 border-gray-500 shadow-inner"></div>}
                                {cell === BLOCK && <div className="w-full h-full bg-orange-400 border-4 border-orange-500"></div>}
                                {cell === BOMB && <div className="w-3/4 h-3/4 bg-black rounded-full animate-pulse relative z-10"></div>}
                                {cell === EXPLOSION && <div className="w-full h-full bg-yellow-400 opacity-80 animate-pulse z-10"></div>}

                                {/* Player */}
                                {player.x === x && player.y === y && (
                                    <div className="w-3/4 h-3/4 bg-white rounded-full border-2 border-black z-20 relative">
                                        <div className="absolute top-1 left-1 w-2 h-2 bg-black rounded-full"></div>
                                        <div className="absolute top-1 right-1 w-2 h-2 bg-black rounded-full"></div>
                                    </div>
                                )}

                                {/* Enemies */}
                                {enemies.map(e => e.x === x && e.y === y && (
                                    <div key={e.id} className="w-3/4 h-3/4 bg-red-500 rounded-full border-2 border-black z-20"></div>
                                ))}
                            </div>
                        )))}
                    </div>

                    {/* Overlays */}
                    {gameOver && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-30 rounded-lg">
                            <p className="text-3xl md:text-4xl font-black text-gray-400 mb-4">ゲームオーバー</p>
                            <button onClick={() => window.location.reload()} className="bg-green-500 px-6 py-3 rounded-full font-bold">リトライ</button>
                        </div>
                    )}
                    {win && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-30 rounded-lg">
                            <p className="text-3xl md:text-4xl font-black text-yellow-400 mb-4">YOU WIN!</p>
                            <button onClick={() => window.location.reload()} className="bg-blue-500 px-6 py-3 rounded-full font-bold">もういちど</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Controls */}
            <div className="flex w-full max-w-md justify-between items-center px-8 mt-4 md:hidden pb-8">
                {/* D-Pad */}
                <div className="relative w-32 h-32">
                    <button
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-200/50 rounded-lg active:bg-gray-400"
                        onClick={() => handleMove(0, -1)}
                    >
                        ⬆️
                    </button>
                    <button
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-200/50 rounded-lg active:bg-gray-400"
                        onClick={() => handleMove(0, 1)}
                    >
                        ⬇️
                    </button>
                    <button
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-200/50 rounded-lg active:bg-gray-400"
                        onClick={() => handleMove(-1, 0)}
                    >
                        ⬅️
                    </button>
                    <button
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-200/50 rounded-lg active:bg-gray-400"
                        onClick={() => handleMove(1, 0)}
                    >
                        ➡️
                    </button>
                </div>

                {/* Action Button */}
                <button
                    className="w-20 h-20 bg-red-500 rounded-full border-4 border-red-700 shadow-lg active:scale-95 flex items-center justify-center font-bold text-xl"
                    onClick={placeBomb}
                >
                    💣
                </button>
            </div>

            <p className="mt-4 text-white font-bold hidden md:block">
                矢印キー: 移動 / スペース: 爆弾
            </p>

        </div>
    );
}
