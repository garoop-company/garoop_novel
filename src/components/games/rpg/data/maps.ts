import { MapData } from '../types';

// Simple map generator for MVP
const generateGrassMap = (w: number, h: number): number[][] => {
    return Array(h).fill(0).map(() => Array(w).fill(0));
};

export const MAPS: Record<string, MapData> = {
    field_01: {
        id: 'field_01',
        name: '始まりの草原',
        width: 20,
        height: 15,
        tiles: [
            ...Array(15).fill(0).map((_, y) =>
                Array(20).fill(0).map((_, x) => {
                    if (x === 0 || x === 19 || y === 0 || y === 14) return 2; // Water border
                    if (x === 10 && y === 7) return 3; // Town
                    if (Math.random() < 0.1) return 1; // Trees
                    return 0; // Grass
                })
            )
        ],
        encounters: ['slime', 'bat', 'ghost'],
        encounterRate: 0.1,
        events: [
            {
                x: 10,
                y: 7,
                type: 'warp',
                targetMapId: 'town_01',
                targetX: 5,
                targetY: 9,
            }
        ]
    },
    town_01: {
        id: 'town_01',
        name: '始まりの村',
        width: 10,
        height: 10,
        tiles: [
            ...Array(10).fill(0).map((_, y) =>
                Array(10).fill(0).map((_, x) => {
                    if (x === 0 || x === 9 || y === 0 || y === 9) return 1; // Trees/Wall
                    if (y === 9 && x === 5) return 0; // Exit
                    if (y === 3 && x === 2) return 4; // Inn
                    if (y === 3 && x === 7) return 5; // Shop
                    return 6; // Pavement
                })
            )
        ],
        encounters: [],
        encounterRate: 0,
        events: [
            {
                x: 5,
                y: 9,
                type: 'warp',
                targetMapId: 'field_01',
                targetX: 10,
                targetY: 8,
            },
            {
                x: 2,
                y: 3,
                type: 'inn',
                message: ['宿屋へようこそ！', '全回復しました。'],
            },
            {
                x: 7,
                y: 3,
                type: 'shop',
                message: ['いらっしゃいませ！'],
            }
        ]
    },
};
