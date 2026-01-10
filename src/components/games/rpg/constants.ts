export const TILE_SIZE = 40;
export const VIEWPORT_WIDTH = 15;
export const VIEWPORT_HEIGHT = 10;

export const EXP_TABLE = [
    0, 10, 30, 60, 100, 150, 220, 300, 400, 520, // Lv 1-10
    650, 800, 1000, 1250, 1550, 1900, 2300, 2750, 3250, 3800, // Lv 11-20
    4400, 5100, 5900, 6800, 7800, 8900, 10100, 11400, 12800, 15000 // Lv 21-30
];

export const JOB_GROWTH = {
    warrior: { hp: 1.2, mp: 0.5, str: 1.2, def: 1.1, agi: 0.8, int: 0.5, luk: 0.8 },
    mage: { hp: 0.7, mp: 1.3, str: 0.6, def: 0.7, agi: 1.0, int: 1.3, luk: 0.9 },
    priest: { hp: 0.9, mp: 1.2, str: 0.8, def: 0.9, agi: 0.9, int: 1.1, luk: 1.0 },
    thief: { hp: 1.0, mp: 0.8, str: 1.0, def: 0.8, agi: 1.3, int: 0.8, luk: 1.3 },
};
