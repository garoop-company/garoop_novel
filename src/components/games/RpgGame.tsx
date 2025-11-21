"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// --- Constants ---
const TILE_SIZE = 40;
const MAP_WIDTH = 15;
const MAP_HEIGHT = 10;
const ENCOUNTER_RATE = 0.15; // 15% chance per step

// --- Types ---
type GameState = 'map' | 'battle' | 'gameover' | 'victory';
type Direction = 'up' | 'down' | 'left' | 'right';

interface Player {
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    level: number;
    exp: number;
    direction: Direction;
}

interface Enemy {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    attack: number;
    exp: number;
    image: string; // Emoji or path
    message: string;
}

// --- Game Data ---
const ENEMIES: Enemy[] = [
    { id: 'zombie', name: 'いいねゾンビ', hp: 30, maxHp: 30, attack: 5, exp: 10, image: '🧟', message: 'いいね くれぇ... いいね...' },
    { id: 'ghost', name: '加工オバケ', hp: 40, maxHp: 40, attack: 8, exp: 15, image: '👻', message: 'わたしの すがおは みせないわ！' },
    { id: 'troll', name: '炎上トロール', hp: 60, maxHp: 60, attack: 12, exp: 25, image: '👹', message: 'もえろ！ もえあがれー！' },
    { id: 'boss', name: 'バズり魔王', hp: 150, maxHp: 150, attack: 20, exp: 100, image: '👿', message: 'この せかいは すべて わたしのものだ！' },
];

// 0: Grass, 1: Tree, 2: Water, 3: Boss Castle
const MAP_DATA = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 1],
    [1, 0, 0, 1, 2, 3, 3, 3, 3, 3, 2, 1, 0, 0, 1], // Boss area
    [1, 0, 0, 1, 2, 3, 3, 3, 3, 3, 2, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export default function RpgGame() {
    const [gameState, setGameState] = useState<GameState>('map');
    const [player, setPlayer] = useState<Player>({ x: 1, y: 1, hp: 50, maxHp: 50, mp: 20, maxMp: 20, level: 1, exp: 0, direction: 'down' });
    const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
    const [battleMessage, setBattleMessage] = useState('');
    const [turn, setTurn] = useState<'player' | 'enemy'>('player');
    const [isMoving, setIsMoving] = useState(false);

    // --- Map Logic ---
    const handleMove = (dx: number, dy: number) => {
        if (gameState !== 'map' || isMoving) return;

        const newX = player.x + dx;
        const newY = player.y + dy;

        // Collision Check
        if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) return;
        const tile = MAP_DATA[newY][newX];
        if (tile === 1 || tile === 2) return; // Wall or Water

        // Direction
        let newDirection: Direction = 'down';
        if (dx > 0) newDirection = 'right';
        if (dx < 0) newDirection = 'left';
        if (dy > 0) newDirection = 'down';
        if (dy < 0) newDirection = 'up';

        setPlayer(prev => ({ ...prev, x: newX, y: newY, direction: newDirection }));
        setIsMoving(true);
        setTimeout(() => setIsMoving(false), 200); // Movement cooldown

        // Encounter Check
        if (tile === 3) {
            // Boss Encounter
            startBattle(ENEMIES[3]);
        } else if (Math.random() < ENCOUNTER_RATE) {
            // Random Encounter
            const randomEnemy = ENEMIES[Math.floor(Math.random() * 3)]; // Exclude boss
            startBattle(randomEnemy);
        }
    };

    // --- Battle Logic ---
    const startBattle = (enemy: Enemy) => {
        setGameState('battle');
        setCurrentEnemy({ ...enemy }); // Clone enemy
        setTurn('player');
        setBattleMessage(`${enemy.name} が あらわれた！\n「${enemy.message}」`);
    };

    const handleAttack = () => {
        if (turn !== 'player' || !currentEnemy) return;

        const damage = Math.floor(Math.random() * 5) + 5 + player.level * 2;
        const newEnemyHp = Math.max(0, currentEnemy.hp - damage);

        setCurrentEnemy({ ...currentEnemy, hp: newEnemyHp });
        setBattleMessage(`ガルちゃんの こうげき！\n${damage} のダメージ！`);

        if (newEnemyHp <= 0) {
            setTimeout(winBattle, 1000);
        } else {
            setTurn('enemy');
            setTimeout(enemyTurn, 1500);
        }
    };

    const handleSkill = (skill: 'real' | 'dance') => {
        if (turn !== 'player' || !currentEnemy) return;

        let damage = 0;
        let cost = 0;
        let msg = '';

        if (skill === 'real') {
            cost = 5;
            if (player.mp < cost) {
                setBattleMessage('MPが たりない！');
                return;
            }
            damage = Math.floor(Math.random() * 10) + 15 + player.level * 3;
            msg = 'すっぴんビーム！\nしんじつを あばいた！';
        } else if (skill === 'dance') {
            cost = 3;
            if (player.mp < cost) {
                setBattleMessage('MPが たりない！');
                return;
            }
            damage = Math.floor(Math.random() * 5) + 8 + player.level * 2;
            msg = 'バズりダンス！\nてきを みりょうした！';
        }

        setPlayer(prev => ({ ...prev, mp: prev.mp - cost }));
        const newEnemyHp = Math.max(0, currentEnemy.hp - damage);
        setCurrentEnemy({ ...currentEnemy, hp: newEnemyHp });
        setBattleMessage(`${msg}\n${damage} のダメージ！`);

        if (newEnemyHp <= 0) {
            setTimeout(winBattle, 1000);
        } else {
            setTurn('enemy');
            setTimeout(enemyTurn, 1500);
        }
    };

    const handleRun = () => {
        if (currentEnemy?.id === 'boss') {
            setBattleMessage('まおう からは にげられない！');
            return;
        }
        if (Math.random() > 0.3) {
            setBattleMessage('うまく にげきれた！');
            setTimeout(() => {
                setGameState('map');
                setCurrentEnemy(null);
            }, 1000);
        } else {
            setBattleMessage('まわりこまれてしまった！');
            setTurn('enemy');
            setTimeout(enemyTurn, 1500);
        }
    };

    const enemyTurn = () => {
        if (!currentEnemy) return;

        const damage = Math.max(1, currentEnemy.attack - Math.floor(player.level / 2));
        const newHp = Math.max(0, player.hp - damage);

        setPlayer(prev => ({ ...prev, hp: newHp }));
        setBattleMessage(`${currentEnemy.name} の こうげき！\n${damage} のダメージ！`);
        setTurn('player');

        if (newHp <= 0) {
            setTimeout(() => setGameState('gameover'), 1000);
        }
    };

    const winBattle = () => {
        if (!currentEnemy) return;

        if (currentEnemy.id === 'boss') {
            setGameState('victory');
            return;
        }

        const expGain = currentEnemy.exp;
        let levelUp = false;
        let newLevel = player.level;
        let newMaxHp = player.maxHp;
        let newMaxMp = player.maxMp;

        if (player.exp + expGain >= player.level * 20) {
            levelUp = true;
            newLevel++;
            newMaxHp += 10;
            newMaxMp += 5;
        }

        setPlayer(prev => ({
            ...prev,
            exp: prev.exp + expGain,
            level: newLevel,
            maxHp: newMaxHp,
            maxMp: newMaxMp,
            hp: newMaxHp, // Full heal on win/levelup for kids
            mp: newMaxMp
        }));

        setBattleMessage(`かかった！\n${expGain} のけいけんち をえた！${levelUp ? '\nレベルがあがった！' : ''}`);
        setTimeout(() => {
            setGameState('map');
            setCurrentEnemy(null);
        }, 2000);
    };

    const restartGame = () => {
        setPlayer({ x: 1, y: 1, hp: 50, maxHp: 50, mp: 20, maxMp: 20, level: 1, exp: 0, direction: 'down' });
        setGameState('map');
        setCurrentEnemy(null);
    };

    // --- Render Helpers ---
    const getTileColor = (type: number) => {
        switch (type) {
            case 0: return 'bg-green-400'; // Grass
            case 1: return 'bg-green-800'; // Tree
            case 2: return 'bg-blue-400'; // Water
            case 3: return 'bg-purple-800'; // Boss
            default: return 'bg-black';
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-white flex flex-col items-center justify-center p-4">

            {/* Header */}
            <div className="w-full max-w-2xl flex justify-between items-center mb-4 bg-slate-800 p-2 rounded-lg border border-slate-600">
                <Link href="/game" className="bg-white text-slate-900 px-3 py-1 rounded-full font-bold text-sm hover:bg-gray-200">
                    ← もどる
                </Link>
                <div className="flex gap-4 text-sm font-bold">
                    <span className="text-yellow-400">LV: {player.level}</span>
                    <span className="text-green-400">HP: {player.hp}/{player.maxHp}</span>
                    <span className="text-blue-400">MP: {player.mp}/{player.maxMp}</span>
                </div>
            </div>

            {/* Game Container */}
            <div className="relative w-full max-w-2xl aspect-video bg-black rounded-xl overflow-hidden border-4 border-white shadow-2xl">

                {/* MAP VIEW */}
                {gameState === 'map' && (
                    <div className="w-full h-full relative flex items-center justify-center bg-black">
                        <div
                            className="grid gap-0"
                            style={{
                                gridTemplateColumns: `repeat(${MAP_WIDTH}, ${TILE_SIZE}px)`,
                                width: MAP_WIDTH * TILE_SIZE,
                                height: MAP_HEIGHT * TILE_SIZE
                            }}
                        >
                            {MAP_DATA.map((row, y) => (
                                row.map((tile, x) => (
                                    <div key={`${x}-${y}`} className={`w-full h-full ${getTileColor(tile)} border-[0.5px] border-black/10 relative`}>
                                        {tile === 1 && <span className="absolute inset-0 flex items-center justify-center text-xs opacity-50">🌲</span>}
                                        {tile === 3 && <span className="absolute inset-0 flex items-center justify-center text-xl">🏰</span>}
                                    </div>
                                ))
                            ))}
                        </div>

                        {/* Player */}
                        <motion.div
                            className="absolute w-10 h-10 flex items-center justify-center z-10"
                            animate={{
                                x: (player.x - MAP_WIDTH / 2 + 0.5) * TILE_SIZE,
                                y: (player.y - MAP_HEIGHT / 2 + 0.5) * TILE_SIZE
                            }}
                            transition={{ type: "tween", duration: 0.2 }}
                        >
                            <div className="w-8 h-8 bg-pink-500 rounded-full border-2 border-white shadow-lg relative">
                                {/* Face direction */}
                                <div className={`absolute w-2 h-2 bg-black rounded-full ${player.direction === 'up' ? 'top-1 left-1/2 -translate-x-1/2' :
                                        player.direction === 'down' ? 'bottom-2 left-1/2 -translate-x-1/2' :
                                            player.direction === 'left' ? 'left-1 top-1/2 -translate-y-1/2' :
                                                'right-1 top-1/2 -translate-y-1/2'
                                    }`}></div>
                            </div>
                        </motion.div>

                        {/* Controls Overlay (Mobile) */}
                        <div className="absolute bottom-4 right-4 grid grid-cols-3 gap-2 z-20 opacity-70">
                            <div></div>
                            <button onClick={() => handleMove(0, -1)} className="w-12 h-12 bg-white/20 rounded-full border border-white flex items-center justify-center text-2xl">⬆️</button>
                            <div></div>
                            <button onClick={() => handleMove(-1, 0)} className="w-12 h-12 bg-white/20 rounded-full border border-white flex items-center justify-center text-2xl">⬅️</button>
                            <div className="w-12 h-12"></div>
                            <button onClick={() => handleMove(1, 0)} className="w-12 h-12 bg-white/20 rounded-full border border-white flex items-center justify-center text-2xl">➡️</button>
                            <div></div>
                            <button onClick={() => handleMove(0, 1)} className="w-12 h-12 bg-white/20 rounded-full border border-white flex items-center justify-center text-2xl">⬇️</button>
                            <div></div>
                        </div>
                    </div>
                )}

                {/* BATTLE VIEW */}
                {gameState === 'battle' && currentEnemy && (
                    <div className="w-full h-full bg-gradient-to-b from-purple-900 to-black p-8 flex flex-col justify-between relative">
                        {/* Flash Effect */}
                        <motion.div
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 bg-white pointer-events-none"
                        />

                        {/* Enemy */}
                        <div className="flex flex-col items-center mt-8">
                            <motion.div
                                animate={turn === 'enemy' ? { x: [-10, 10, -10, 10, 0] } : {}}
                                className="text-9xl drop-shadow-2xl filter"
                            >
                                {currentEnemy.image}
                            </motion.div>
                            <div className="mt-4 bg-black/50 px-4 py-1 rounded-full border border-white/30">
                                <h2 className="text-2xl font-bold">{currentEnemy.name}</h2>
                                <div className="w-32 h-4 bg-gray-700 rounded-full mt-1 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-red-500"
                                        initial={{ width: '100%' }}
                                        animate={{ width: `${(currentEnemy.hp / currentEnemy.maxHp) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Message Window */}
                        <div className="bg-white/90 text-black p-4 rounded-xl border-4 border-blue-500 min-h-[100px] flex items-center justify-center text-center font-bold text-lg whitespace-pre-wrap">
                            {battleMessage}
                        </div>

                        {/* Command Menu */}
                        {turn === 'player' && (
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <button onClick={handleAttack} className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg">
                                    こうげき ⚔️
                                </button>
                                <button onClick={() => handleSkill('real')} className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg">
                                    すっぴんビーム (MP5) ✨
                                </button>
                                <button onClick={() => handleSkill('dance')} className="bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-bold shadow-lg">
                                    バズりダンス (MP3) 💃
                                </button>
                                <button onClick={handleRun} className="bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-xl font-bold shadow-lg">
                                    にげる 💨
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* VICTORY VIEW */}
                {gameState === 'victory' && (
                    <div className="w-full h-full bg-yellow-100 flex flex-col items-center justify-center text-center p-8">
                        <h2 className="text-5xl font-black text-orange-500 mb-4">クリア おめでとう！</h2>
                        <div className="text-8xl mb-4">🎉</div>
                        <p className="text-xl text-gray-700 font-bold mb-8">
                            バズり魔王を たおして<br />
                            せかいに 「リアル」が もどった！
                        </p>
                        <Link href="/game" className="bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-xl hover:bg-blue-600 shadow-lg">
                            ゲームいちらんへ
                        </Link>
                    </div>
                )}

                {/* GAME OVER VIEW */}
                {gameState === 'gameover' && (
                    <div className="w-full h-full bg-black flex flex-col items-center justify-center text-center p-8">
                        <h2 className="text-5xl font-black text-red-600 mb-4">GAME OVER</h2>
                        <p className="text-xl text-gray-400 font-bold mb-8">
                            ガルちゃんは ちからつきた...
                        </p>
                        <button onClick={restartGame} className="bg-green-500 text-white px-8 py-4 rounded-full font-bold text-xl hover:bg-green-600 shadow-lg">
                            もういちど やる
                        </button>
                    </div>
                )}

            </div>

            <div className="mt-4 text-gray-400 text-sm text-center">
                <p>PC: やじるしキー で いどう</p>
                <p>スマホ: がめんの ボタン で いどう</p>
            </div>
        </div>
    );
}
