"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// --- Constants ---
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 800;
const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const SPEED = 4;

interface Entity {
    x: number;
    y: number;
    width: number;
    height: number;
    vx: number;
    vy: number;
    type: 'player' | 'platform' | 'ladder' | 'barrel' | 'goal';
    isClimbing?: boolean;
}

export default function JungleGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'win'>('start');

    const playerRef = useRef<Entity>({ x: 50, y: 700, width: 30, height: 30, vx: 0, vy: 0, type: 'player' });
    const entitiesRef = useRef<Entity[]>([]);
    const keysRef = useRef<{ [key: string]: boolean }>({});
    const requestRef = useRef<number | null>(null);
    const frameRef = useRef(0);

    const initLevel = () => {
        const entities: Entity[] = [];

        // Platforms (Sloped/Flat)
        // Floor 1
        entities.push({ x: 0, y: 750, width: 600, height: 20, vx: 0, vy: 0, type: 'platform' });
        // Floor 2
        entities.push({ x: 0, y: 600, width: 500, height: 20, vx: 0, vy: 0, type: 'platform' });
        // Floor 3
        entities.push({ x: 100, y: 450, width: 500, height: 20, vx: 0, vy: 0, type: 'platform' });
        // Floor 4
        entities.push({ x: 0, y: 300, width: 500, height: 20, vx: 0, vy: 0, type: 'platform' });
        // Top Floor
        entities.push({ x: 200, y: 150, width: 200, height: 20, vx: 0, vy: 0, type: 'platform' });

        // Ladders
        entities.push({ x: 450, y: 600, width: 30, height: 150, vx: 0, vy: 0, type: 'ladder' });
        entities.push({ x: 150, y: 450, width: 30, height: 150, vx: 0, vy: 0, type: 'ladder' });
        entities.push({ x: 450, y: 300, width: 30, height: 150, vx: 0, vy: 0, type: 'ladder' });
        entities.push({ x: 250, y: 150, width: 30, height: 150, vx: 0, vy: 0, type: 'ladder' });

        // Goal (Lady)
        entities.push({ x: 280, y: 110, width: 40, height: 40, vx: 0, vy: 0, type: 'goal' });

        entitiesRef.current = entities;
        playerRef.current = { x: 50, y: 700, width: 30, height: 30, vx: 0, vy: 0, type: 'player' };
    };

    const startGame = () => {
        initLevel();
        setGameState('playing');
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => keysRef.current[e.code] = true;
        const handleKeyUp = (e: KeyboardEvent) => keysRef.current[e.code] = false;
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        if (gameState !== 'playing') return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const update = () => {
            frameRef.current++;
            const player = playerRef.current;

            // Spawn Barrels
            if (frameRef.current % 120 === 0) {
                entitiesRef.current.push({ x: 220, y: 120, width: 25, height: 25, vx: 3, vy: 0, type: 'barrel' });
            }

            // Player Movement
            if (keysRef.current['ArrowLeft']) player.vx = -SPEED;
            else if (keysRef.current['ArrowRight']) player.vx = SPEED;
            else player.vx = 0;

            // Ladder Logic
            let onLadder = false;
            entitiesRef.current.forEach(e => {
                if (e.type === 'ladder') {
                    if (
                        player.x + player.width / 2 > e.x &&
                        player.x + player.width / 2 < e.x + e.width &&
                        player.y + player.height > e.y &&
                        player.y < e.y + e.height
                    ) {
                        onLadder = true;
                    }
                }
            });

            if (onLadder) {
                if (keysRef.current['ArrowUp']) {
                    player.vy = -SPEED;
                    player.isClimbing = true;
                } else if (keysRef.current['ArrowDown']) {
                    player.vy = SPEED;
                    player.isClimbing = true;
                } else {
                    if (player.isClimbing) player.vy = 0;
                }
            } else {
                player.isClimbing = false;
            }

            // Jump
            if (!player.isClimbing && keysRef.current['Space'] && player.vy === 0) { // Simple ground check
                // Need better ground check, but for now assume vy=0 means grounded if not climbing
                // Actually gravity will make vy > 0 if falling.
                // Let's rely on collision to set vy=0.
                // We can add a 'grounded' flag.
            }

            // Apply Gravity
            if (!player.isClimbing) {
                player.vy += GRAVITY;
            }

            player.x += player.vx;
            player.y += player.vy;

            // Collision
            let grounded = false;
            entitiesRef.current.forEach((e, index) => {
                if (e.type === 'platform') {
                    // Simple Platform Collision (Top only)
                    if (
                        player.x + player.width > e.x &&
                        player.x < e.x + e.width &&
                        player.y + player.height > e.y &&
                        player.y + player.height < e.y + e.height + 10 && // Tolerance
                        player.vy >= 0
                    ) {
                        if (!player.isClimbing) {
                            player.y = e.y - player.height;
                            player.vy = 0;
                            grounded = true;
                        }
                    }
                } else if (e.type === 'barrel') {
                    // Barrel Physics
                    e.x += e.vx;
                    e.y += e.vy;
                    e.vy += GRAVITY;

                    // Barrel Platform Collision
                    entitiesRef.current.forEach(p => {
                        if (p.type === 'platform') {
                            if (
                                e.x + e.width > p.x &&
                                e.x < p.x + p.width &&
                                e.y + e.height > p.y &&
                                e.y + e.height < p.y + p.height + 10 &&
                                e.vy >= 0
                            ) {
                                e.y = p.y - e.height;
                                e.vy = 0;
                            }
                        }
                    });

                    // Barrel Turn at edges
                    if (e.x > CANVAS_WIDTH) { e.x = CANVAS_WIDTH - 10; e.vx = -3; e.y += 10; } // Drop down
                    if (e.x < 0) { e.x = 10; e.vx = 3; e.y += 10; }

                    // Player Hit
                    if (
                        player.x < e.x + e.width &&
                        player.x + player.width > e.x &&
                        player.y < e.y + e.height &&
                        player.y + player.height > e.y
                    ) {
                        setGameState('gameover');
                    }

                    // Remove off screen
                    if (e.y > CANVAS_HEIGHT) {
                        entitiesRef.current.splice(index, 1);
                    }
                } else if (e.type === 'goal') {
                    if (
                        player.x < e.x + e.width &&
                        player.x + player.width > e.x &&
                        player.y < e.y + e.height &&
                        player.y + player.height > e.y
                    ) {
                        setGameState('win');
                    }
                }
            });

            // Jump (Actual)
            if (grounded && keysRef.current['Space']) {
                player.vy = JUMP_FORCE;
            }

            // Draw
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Platforms
            ctx.fillStyle = '#b91c1c'; // Red girders
            entitiesRef.current.forEach(e => {
                if (e.type === 'platform') ctx.fillRect(e.x, e.y, e.width, e.height);
            });

            // Ladders
            ctx.fillStyle = '#3b82f6'; // Blue ladders
            entitiesRef.current.forEach(e => {
                if (e.type === 'ladder') {
                    ctx.fillRect(e.x, e.y, 5, e.height);
                    ctx.fillRect(e.x + e.width - 5, e.y, 5, e.height);
                    for (let i = 0; i < e.height; i += 20) {
                        ctx.fillRect(e.x, e.y + i, e.width, 5);
                    }
                }
            });

            // Goal
            const goal = entitiesRef.current.find(e => e.type === 'goal');
            if (goal) {
                ctx.fillStyle = 'pink';
                ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
                ctx.fillStyle = 'white';
                ctx.font = '20px Arial';
                ctx.fillText('HELP!', goal.x - 10, goal.y - 10);
            }

            // Barrels
            ctx.fillStyle = '#854d0e'; // Brown
            entitiesRef.current.forEach(e => {
                if (e.type === 'barrel') {
                    ctx.beginPath();
                    ctx.arc(e.x + e.width / 2, e.y + e.height / 2, e.width / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            // Player
            ctx.fillStyle = 'red';
            ctx.fillRect(player.x, player.y, player.width, player.height);

            requestRef.current = requestAnimationFrame(update);
        };

        requestRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(requestRef.current as number);
    }, [gameState]);

    return (
        <div className="min-h-screen bg-black font-sans text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Header */}
            <div className="absolute top-4 left-4 z-20">
                <Link href="/game" className="bg-white text-black px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-200 transition-colors">
                    ← もどる
                </Link>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-red-600 mb-4 z-10 drop-shadow-sm stroke-white stroke-2">
                ジャングル・ジャンプ
            </h1>

            <div className="relative border-4 border-red-800 rounded-xl overflow-hidden">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="block bg-black"
                />

                {/* Start Overlay */}
                {gameState === 'start' && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                        <p className="text-2xl font-bold mb-8">いわをよけて いただきをめざせ！</p>
                        <button
                            onClick={startGame}
                            className="bg-red-500 text-white px-8 py-4 rounded-full font-black text-2xl hover:bg-red-600 shadow-lg animate-bounce"
                        >
                            スタート！
                        </button>
                    </div>
                )}

                {/* Game Over Overlay */}
                {gameState === 'gameover' && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white">
                        <p className="text-4xl font-black text-gray-400 mb-4">ゲームオーバー</p>
                        <button
                            onClick={startGame}
                            className="bg-green-500 text-white px-8 py-4 rounded-full font-bold text-xl hover:bg-green-600 shadow-lg"
                        >
                            もういちど
                        </button>
                    </div>
                )}

                {/* Win Overlay */}
                {gameState === 'win' && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white">
                        <p className="text-4xl font-black text-yellow-400 mb-4">クリア！</p>
                        <button
                            onClick={startGame}
                            className="bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-xl hover:bg-blue-600 shadow-lg"
                        >
                            もういちど
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
}
