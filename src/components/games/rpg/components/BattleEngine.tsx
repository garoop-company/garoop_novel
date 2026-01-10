import React, { useState, useEffect, useCallback } from 'react';
import { useRpgStore } from '../store';
import { ENEMIES } from '../data/enemies';
import { ITEMS } from '../data/items';
import { Character, EnemyAction } from '../types';
import { AnimatePresence, motion } from 'framer-motion';

type BattlePhase = 'start' | 'input' | 'processing' | 'victory' | 'defeat';

interface BattleLog {
    text: string;
    color?: string;
}

// Temporary enemy state wrapper
interface BattleEnemy {
    uid: string; // Unique ID for battle instance
    def: any; // Original definition
    hp: number;
    maxHp: number;
    name: string;
}

const BattleEngine = () => {
    const { setMode, addGold, party, updateCharacter, gainExp } = useRpgStore();

    const [phase, setPhase] = useState<BattlePhase>('start');
    const [logs, setLogs] = useState<BattleLog[]>([]);
    const [enemies, setEnemies] = useState<BattleEnemy[]>([]);
    const [turnQueue, setTurnQueue] = useState<any[]>([]); // Who's turn is it?

    // Initialize Battle
    useEffect(() => {
        // Generate enemies (Random 1-3)
        const count = Math.floor(Math.random() * 3) + 1;
        const newEnemies: BattleEnemy[] = [];
        const enemyKeys = Object.keys(ENEMIES);

        for (let i = 0; i < count; i++) {
            const key = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
            const def = ENEMIES[key];
            newEnemies.push({
                uid: `enemy-${i}`,
                def: def,
                hp: def.hp,
                maxHp: def.maxHp,
                name: `${def.name} ${String.fromCharCode(65 + i)}`,
            });
        }
        setEnemies(newEnemies);
        addLog(`モンスターがあらわれた！`);
        setPhase('input');
    }, []);

    const addLog = (text: string, color: string = 'text-white') => {
        setLogs(prev => [...prev.slice(-4), { text, color }]); // Keep last 5 logs
    };

    const attackEnemy = async (targetIndex: number) => {
        if (phase !== 'input') return;
        setPhase('processing');

        // Player Turn (First alive character for MVP - later handle full party turns)
        const attacker = party.find(p => !p.isDead);
        if (!attacker) {
            setPhase('defeat');
            return;
        }

        await performPlayerAttack(attacker, targetIndex);

        // Check Win
        if (enemies.every(e => e.hp <= 0)) {
            setTimeout(handleVictory, 1000);
            return;
        }

        // Enemy Turn
        await performEnemyTurn();

        // Check Defeat
        if (party.every(p => p.isDead)) {
            setTimeout(handleDefeat, 1000);
            return;
        }

        setPhase('input');
    };

    const performPlayerAttack = async (attacker: Character, targetIndex: number) => {
        const target = enemies[targetIndex];
        if (!target || target.hp <= 0) return;

        addLog(`${attacker.name}のこうげき！`);
        await new Promise(r => setTimeout(r, 600));

        const damage = Math.max(1, attacker.attack - Math.floor(target.def.defense / 2));
        const newHp = Math.max(0, target.hp - damage);

        // Update Enemy State locally
        setEnemies(prev => prev.map((e, i) => i === targetIndex ? { ...e, hp: newHp } : e));

        addLog(`${target.name}に ${damage} のダメージ！`, 'text-yellow-400');
        await new Promise(r => setTimeout(r, 600));

        if (newHp === 0) {
            addLog(`${target.name}をたおした！`, 'text-orange-400');
            await new Promise(r => setTimeout(r, 600));
        }
    };

    const performEnemyTurn = async () => {
        const aliveEnemies = enemies.filter(e => e.hp > 0);
        for (const enemy of aliveEnemies) {
            addLog(`${enemy.name}の行動！`);
            await new Promise(r => setTimeout(r, 600));

            // Simple AI: Attack random alive player
            const alivePlayers = party.filter(p => !p.isDead);
            if (alivePlayers.length === 0) break;

            const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
            const damage = Math.max(1, enemy.def.attack - Math.floor(target.defense / 2));

            updateCharacter(target.id, { hp: target.hp - damage });
            addLog(`${target.name}は ${damage} のダメージを受けた！`, 'text-red-400');
            await new Promise(r => setTimeout(r, 600));
        }
    };

    const handleVictory = () => {
        setPhase('victory');
        const totalExp = enemies.reduce((sum, e) => sum + e.def.exp, 0);
        const totalGold = enemies.reduce((sum, e) => sum + e.def.gold, 0);

        addLog(`戦いに勝利した！`, 'text-yellow-300');
        addLog(`${totalExp} の経験値を獲得！`, 'text-yellow-300');
        addLog(`${totalGold} ゴールドを獲得！`, 'text-yellow-300');

        gainExp(totalExp);
        addGold(totalGold);
    };

    const handleDefeat = () => {
        setPhase('defeat');
        addLog(`全滅してしまった...`, 'text-red-600');
    };

    const exitBattle = () => {
        if (phase === 'defeat') {
            // Send to Title or Church? For MVP -> Map (Revived) or Title
            // Let's support immediate retry for MVP
            updateCharacter(party[0].id, { hp: party[0].maxHp, isDead: false }); // Revive hero
            setMode('title');
        } else {
            setMode('map');
        }
    };

    return (
        <div className="w-full h-full bg-slate-800 flex flex-col justify-between p-4 font-mono text-white select-none">

            {/* Background / Effect Layer could go here */}

            {/* Top Status Bar (Party) */}
            <div className="flex gap-4 p-2 bg-slate-900/80 rounded border border-slate-600">
                {party.map(char => (
                    <div key={char.id} className={`flex-1 p-2 rounded ${char.isDead ? 'bg-red-900/50 grayscale' : 'bg-slate-800'}`}>
                        <div className="font-bold flex justify-between">
                            <span>{char.name}</span>
                            <span className="text-yellow-500">Lv.{char.level}</span>
                        </div>
                        <div className="text-sm">
                            HP: <span className={char.hp < char.maxHp / 3 ? 'text-red-400' : 'text-green-400'}>{char.hp}</span>/{char.maxHp}
                        </div>
                        <div className="text-sm text-blue-300">
                            MP: {char.mp}/{char.maxMp}
                        </div>
                    </div>
                ))}
            </div>

            {/* Mid Field (Enemies) */}
            <div className="flex-1 flex items-center justify-center gap-8 py-8">
                {enemies.map((enemy, idx) => (
                    enemy.hp > 0 && (
                        <motion.div
                            key={enemy.uid}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform"
                            onClick={() => phase === 'input' && attackEnemy(idx)}
                        >
                            <div className="text-8xl filter drop-shadow-2xl">{enemy.def.image}</div>
                            <div className="mt-2 bg-black/50 px-2 rounded text-sm">{enemy.name}</div>
                            {/* HP Bar (Debug/Easy Mode) */}
                            <div className="w-16 h-1 bg-gray-700 mt-1 rounded">
                                <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}></div>
                            </div>
                        </motion.div>
                    )
                ))}
            </div>

            {/* Bottom UI (Logs & Command) */}
            <div className="h-40 flex gap-2">
                {/* Message Log */}
                <div className="flex-[2] bg-slate-900/90 border-2 border-white rounded p-4 text-lg overflow-y-auto font-bold leading-relaxed">
                    {logs.map((log, i) => (
                        <div key={i} className={log.color}>{log.text}</div>
                    ))}
                    {phase === 'input' && <div className="animate-pulse">コマンドを入力してください ▼</div>}
                    {(phase === 'victory' || phase === 'defeat') && (
                        <button onClick={exitBattle} className="mt-2 text-blue-300 hover:text-blue-100 underline">
                            ➔ 次へ進む
                        </button>
                    )}
                </div>

                {/* Command Menu */}
                {phase === 'input' && (
                    <div className="flex-1 bg-slate-900/90 border-2 border-white rounded p-2 grid grid-cols-2 gap-2">
                        <button className="bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center font-bold text-xl border border-slate-500">
                            たたかう
                        </button>
                        <button className="bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center font-bold text-xl border border-slate-500">
                            じゅもん
                        </button>
                        <button className="bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center font-bold text-xl border border-slate-500">
                            どうぐ
                        </button>
                        <button onClick={() => { addLog('逃げ出した！'); setTimeout(() => setMode('map'), 1000); }} className="bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center font-bold text-xl border border-slate-500">
                            にげる
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BattleEngine;
