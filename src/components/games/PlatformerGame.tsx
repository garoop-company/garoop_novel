"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// --- Constants ---
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const SPEED = 5;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;

// --- Types ---
interface Entity {
    x: number;
    y: number;
    width: number;
    height: number;
    vx: number;
    vy: number;
    type: 'player' | 'block' | 'enemy' | 'flag' | 'ground';
    isDead?: boolean;
}

export default function PlatformerGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'win'>('start');
    const [score, setScore] = useState(0);

    // Game State Refs
    const playerRef = useRef<Entity>({ x: 50, y: 200, width: 40, height: 40, vx: 0, vy: 0, type: 'player' });
    const keysRef = useRef<{ [key: string]: boolean }>({});
    const cameraXRef = useRef(0);
    const entitiesRef = useRef<Entity[]>([]);
    const requestRef = useRef<number | null>(null);

    // Initialize Level
    const initLevel = () => {
        const entities: Entity[] = [];

        // Ground
        for (let i = 0; i < 50; i++) {
            if (i === 10 || i === 11 || i === 25) continue; // Pits
            entities.push({ x: i * 50, y: 400, width: 50, height: 50, vx: 0, vy: 0, type: 'ground' });
        }

        // Blocks
        entities.push({ x: 300, y: 250, width: 50, height: 50, vx: 0, vy: 0, type: 'block' });
        entities.push({ x: 350, y: 250, width: 50, height: 50, vx: 0, vy: 0, type: 'block' });
        entities.push({ x: 400, y: 250, width: 50, height: 50, vx: 0, vy: 0, type: 'block' });
        entities.push({ x: 350, y: 100, width: 50, height: 50, vx: 0, vy: 0, type: 'block' });

        entities.push({ x: 600, y: 300, width: 50, height: 50, vx: 0, vy: 0, type: 'block' });
        entities.push({ x: 800, y: 200, width: 50, height: 50, vx: 0, vy: 0, type: 'block' });

        // Enemies
        entities.push({ x: 500, y: 360, width: 40, height: 40, vx: -2, vy: 0, type: 'enemy' });
        entities.push({ x: 900, y: 360, width: 40, height: 40, vx: -2, vy: 0, type: 'enemy' });
        entities.push({ x: 1400, y: 360, width: 40, height: 40, vx: -2, vy: 0, type: 'enemy' });

        // Flag
        entities.push({ x: 2200, y: 200, width: 20, height: 200, vx: 0, vy: 0, type: 'flag' });

        entitiesRef.current = entities;
        playerRef.current = { x: 50, y: 200, width: 40, height: 40, vx: 0, vy: 0, type: 'player' };
        cameraXRef.current = 0;
        setScore(0);
    };

    const startGame = () => {
        initLevel();
        setGameState('playing');
    };

    // Input Handling
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

    // Game Loop
    useEffect(() => {
        if (gameState !== 'playing') return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const update = () => {
            const player = playerRef.current;

            // Player Movement
            if (keysRef.current['ArrowLeft']) player.vx = -SPEED;
            else if (keysRef.current['ArrowRight']) player.vx = SPEED;
            else player.vx = 0;

            if (keysRef.current['Space'] && player.vy === 0) { // Simple ground check (improved below)
                // Only jump if on ground (checked in collision)
            }

            // Apply Gravity
            player.vy += GRAVITY;
            player.x += player.vx;
            player.y += player.vy;

            // Camera Follow
            if (player.x > cameraXRef.current + 300) {
                cameraXRef.current = player.x - 300;
            }

            // Collision Detection
            let onGround = false;
            entitiesRef.current.forEach(entity => {
                if (entity.type === 'ground' || entity.type === 'block') {
                    // AABB Collision
                    if (
                        player.x < entity.x + entity.width &&
                        player.x + player.width > entity.x &&
                        player.y < entity.y + entity.height &&
                        player.y + player.height > entity.y
                    ) {
                        // Resolve Collision
                        const dx = (player.x + player.width / 2) - (entity.x + entity.width / 2);
                        const dy = (player.y + player.height / 2) - (entity.y + entity.height / 2);
                        const width = (player.width + entity.width) / 2;
                        const height = (player.height + entity.height) / 2;
                        const crossWidth = width * dy;
                        const crossHeight = height * dx;

                        if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
                            if (crossWidth > crossHeight) {
                                if (crossWidth > -crossHeight) {
                                    // Bottom
                                    player.y = entity.y + entity.height;
                                    player.vy = 0;
                                } else {
                                    // Left
                                    player.x = entity.x - player.width;
                                    player.vx = 0;
                                }
                            } else {
                                if (crossWidth > -crossHeight) {
                                    // Right
                                    player.x = entity.x + entity.width;
                                    player.vx = 0;
                                } else {
                                    // Top
                                    player.y = entity.y - player.height;
                                    player.vy = 0;
                                    onGround = true;
                                }
                            }
                        }
                    }
                } else if (entity.type === 'enemy' && !entity.isDead) {
                    // Enemy Collision
                    if (
                        player.x < entity.x + entity.width &&
                        player.x + player.width > entity.x &&
                        player.y < entity.y + entity.height &&
                        player.y + player.height > entity.y
                    ) {
                        // Check if jumping on top
                        if (player.vy > 0 && player.y + player.height < entity.y + entity.height / 2) {
                            entity.isDead = true;
                            player.vy = -8; // Bounce
                            setScore(prev => prev + 100);
                        } else {
                            setGameState('gameover');
                        }
                    }
                } else if (entity.type === 'flag') {
                    if (player.x > entity.x) {
                        setGameState('win');
                    }
                }
            });

            // Jump Input (with ground check)
            if (onGround && keysRef.current['Space']) {
                player.vy = JUMP_FORCE;
            }

            // Fall off map
            if (player.y > CANVAS_HEIGHT) {
                setGameState('gameover');
            }

            // Update Enemies
            entitiesRef.current.forEach(entity => {
                if (entity.type === 'enemy') {
                    entity.x += entity.vx;
                    // Simple patrol (turn around at walls/edges would be better, but simple timer/distance for now)
                    // Actually let's just make them bounce off walls if we had wall collision for them.
                    // For simplicity, just oscillate based on time or distance?
                    // Let's just make them move left forever for now, or bounce if hitting something?
                    // Too complex for this snippet. Let's just make them move left.
                }
            });

            // Draw
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Sky
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.save();
            ctx.translate(-cameraXRef.current, 0);

            // Draw Entities
            entitiesRef.current.forEach(entity => {
                if (entity.isDead) return;
                if (entity.type === 'ground') {
                    ctx.fillStyle = '#8B4513'; // Brown
                    ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
                    ctx.fillStyle = '#00FF00'; // Grass top
                    ctx.fillRect(entity.x, entity.y, entity.width, 10);
                } else if (entity.type === 'block') {
                    ctx.fillStyle = '#B8860B'; // Gold/Brick
                    ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
                    ctx.strokeStyle = 'black';
                    ctx.strokeRect(entity.x, entity.y, entity.width, entity.height);
                } else if (entity.type === 'enemy') {
                    ctx.fillStyle = '#8B0000'; // Red Goomba
                    ctx.beginPath();
                    ctx.arc(entity.x + entity.width / 2, entity.y + entity.height / 2, entity.width / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else if (entity.type === 'flag') {
                    ctx.fillStyle = 'green';
                    ctx.fillRect(entity.x, entity.y, entity.width, entity.height); // Pole
                    ctx.fillStyle = 'red';
                    ctx.fillRect(entity.x + entity.width, entity.y, 40, 30); // Flag
                }
            });

            // Draw Player
            ctx.fillStyle = 'red';
            ctx.fillRect(player.x, player.y, player.width, player.height);
            // Eyes
            ctx.fillStyle = 'white';
            ctx.fillRect(player.x + (player.vx >= 0 ? 25 : 5), player.y + 5, 10, 10);
            ctx.fillStyle = 'black';
            ctx.fillRect(player.x + (player.vx >= 0 ? 28 : 8), player.y + 8, 4, 4);

            ctx.restore();

            requestRef.current = requestAnimationFrame(update);
        };

        requestRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(requestRef.current as number);
    }, [gameState]);

    return (
        <div className="min-h-screen bg-blue-200 font-sans text-gray-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Header */}
            <div className="absolute top-4 left-4 z-20">
                <Link href="/game" className="bg-white text-blue-600 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-blue-50 transition-colors">
                    ← もどる
                </Link>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-red-600 mb-4 z-10 drop-shadow-sm stroke-white stroke-2">
                スーパー ガルちゃん ブラザーズ
            </h1>

            {/* Score */}
            <div className="absolute top-4 right-4 bg-white px-6 py-2 rounded-full shadow-lg border-2 border-yellow-500 z-20">
                <span className="font-bold text-gray-500">SCORE:</span>
                <span className="text-2xl font-black text-yellow-600 ml-2">{score}</span>
            </div>

            {/* Game Area */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-white bg-black">
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className="block"
                />

                {/* Start Overlay */}
                {gameState === 'start' && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                        <p className="text-2xl font-bold mb-8">ゴールを めざして すすめ！</p>
                        <p className="mb-8">← → : いどう, スペース : ジャンプ</p>
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
                        <p className="text-4xl font-black text-yellow-400 mb-4">ゴール！！</p>
                        <p className="text-2xl font-bold mb-8">スコア: {score}</p>
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
