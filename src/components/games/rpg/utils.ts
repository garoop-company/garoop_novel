import { Character } from './types';
import { JOB_GROWTH, EXP_TABLE } from './constants';

export const generateCharacter = (name: string, job: Character['job']): Character => {
    const growth = JOB_GROWTH[job];
    return {
        id: crypto.randomUUID(),
        name,
        job,
        level: 1,
        exp: 0,
        nextExp: EXP_TABLE[1],
        isDead: false,
        hp: Math.floor(20 * growth.hp),
        maxHp: Math.floor(20 * growth.hp),
        mp: Math.floor(10 * growth.mp),
        maxMp: Math.floor(10 * growth.mp),
        attack: Math.floor(10 * growth.str),
        defense: Math.floor(10 * growth.def),
        agility: Math.floor(10 * growth.agi),
        intelligence: Math.floor(10 * growth.int),
        luck: Math.floor(10 * growth.luk),
        equipment: { weapon: null, armor: null, shield: null, accessory: null },
        spells: [],
    };
};
