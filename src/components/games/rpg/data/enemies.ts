import { Enemy } from '../types';

export const ENEMIES: Record<string, Enemy> = {
    slime: {
        id: 'slime',
        name: 'スライム',
        hp: 8,
        maxHp: 8,
        attack: 4,
        defense: 3,
        agility: 3,
        exp: 2,
        gold: 3,
        image: '💧',
        actions: [{ type: 'attack', rate: 1.0 }],
    },
    bat: {
        id: 'bat',
        name: 'ドラキー',
        hp: 12,
        maxHp: 12,
        attack: 6,
        defense: 4,
        agility: 6,
        exp: 4,
        gold: 5,
        image: '🦇',
        actions: [{ type: 'attack', rate: 1.0 }],
    },
    ghost: {
        id: 'ghost',
        name: 'ゴースト',
        hp: 15,
        maxHp: 15,
        attack: 4,
        defense: 7,
        agility: 2,
        exp: 5,
        gold: 6,
        image: '👻',
        actions: [
            { type: 'attack', rate: 0.7 },
            { type: 'spell', spellId: 'lick', rate: 0.3 } // spellId needs to be implemented
        ],
    },
    boss: {
        id: 'boss',
        name: 'ドラゴン',
        hp: 150,
        maxHp: 150,
        attack: 20,
        defense: 20,
        agility: 10,
        exp: 500,
        gold: 200,
        image: '🐲',
        actions: [
            { type: 'attack', rate: 0.8 },
            { type: 'spell', spellId: 'fire', rate: 0.2 }
        ],
    },
};
