import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Character, Direction, GameMode, Item } from './types';

interface RpgState {
    mode: GameMode;

    // Party State
    party: Character[];
    gold: number;
    inventory: { item: Item, count: number }[];

    // Map State
    currentMapId: string;
    playerPos: { x: number; y: number; direction: Direction };

    // Actions
    setMode: (mode: GameMode) => void;
    movePlayer: (dx: number, dy: number, mapWidth: number, mapHeight: number, collisionParams: any) => void; // Simplified for now
    setPlayerPos: (x: number, y: number, direction?: Direction) => void;
    addGold: (amount: number) => void;
    addItem: (item: Item, count?: number) => void;
    healParty: () => void;
    updateCharacter: (id: string, updates: Partial<Character>) => void;
    gainExp: (amount: number) => void;
}

import { generateCharacter } from './utils';

export const useRpgStore = create<RpgState>()(
    immer((set) => ({
        mode: 'title',
        party: [generateCharacter('Hero', 'warrior')], // Default Hero
        gold: 0,
        inventory: [],
        currentMapId: 'field_01',
        playerPos: { x: 5, y: 5, direction: 'down' },

        setMode: (mode) => set((state) => { state.mode = mode }),

        setPlayerPos: (x, y, direction) => set((state) => {
            state.playerPos.x = x;
            state.playerPos.y = y;
            if (direction) state.playerPos.direction = direction;
        }),

        movePlayer: (dx, dy) => set((state) => {
            // Simple update, collision logic will be in the component or a helper
            state.playerPos.x += dx;
            state.playerPos.y += dy;
        }),

        addGold: (amount) => set((state) => {
            state.gold += amount;
        }),

        addItem: (item, count = 1) => set((state) => {
            const existing = state.inventory.find(i => i.item.id === item.id);
            if (existing) {
                existing.count += count;
            } else {
                state.inventory.push({ item, count });
            }
        }),

        healParty: () => set((state) => {
            state.party.forEach(char => {
                char.hp = char.maxHp;
                char.mp = char.maxMp;
                char.isDead = false;
            });
        }),

        updateCharacter: (id, updates) => set((state) => {
            const char = state.party.find(c => c.id === id);
            if (char) {
                Object.assign(char, updates);
                if (char.hp <= 0) {
                    char.hp = 0;
                    char.isDead = true;
                }
            }
        }),

        gainExp: (amount) => set((state) => {
            state.party.forEach(char => {
                if (char.isDead) return;
                char.exp += amount;
                if (char.exp >= char.nextExp) {
                    char.level++;
                    char.maxHp += 10;
                    char.maxMp += 5;
                    char.attack += 2;
                    char.defense += 2;
                    char.hp = char.maxHp;
                    char.mp = char.maxMp;
                    char.nextExp = Math.floor(char.nextExp * 1.5);
                }
            });
        }),
    }))
);
