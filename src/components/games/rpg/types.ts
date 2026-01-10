export type Direction = 'up' | 'down' | 'left' | 'right';
export type GameMode = 'title' | 'map' | 'battle' | 'menu' | 'shop' | 'gameover' | 'victory';

export interface BaseStats {
    maxHp: number;
    maxMp: number;
    attack: number;    // ちから
    defense: number;   // みのまもり
    agility: number;   // すばやさ
    intelligence: number; // かしこさ
    luck: number;      // うんのよさ
}

export type JobType = 'warrior' | 'mage' | 'priest' | 'thief';

export interface Character extends BaseStats {
    id: string;
    name: string;
    job: JobType;
    level: number;
    hp: number;
    mp: number;
    exp: number;
    nextExp: number;
    isDead: boolean;
    equipment: {
        weapon: string | null;
        armor: string | null;
        shield: string | null;
        accessory: string | null;
    };
    spells: string[]; // Spell IDs
}

export interface Enemy {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number; // For damage calc
    agility: number; // For turn order
    exp: number;
    gold: number;
    dropItem?: string; // Item ID
    dropRate?: number; // 0.0 - 1.0
    image: string; // Emoji
    actions: EnemyAction[];
}

export interface EnemyAction {
    type: 'attack' | 'spell' | 'wait';
    spellId?: string;
    rate: number; // Weight for random selection
}

export type ItemType = 'consumable' | 'weapon' | 'armor' | 'shield' | 'accessory' | 'key';

export interface Item {
    id: string;
    name: string;
    type: ItemType;
    description: string;
    price: number;
    effectValue?: number; // Heal amount, Attack power, etc.
    effectType?: 'heal_hp' | 'heal_mp' | 'cure_status' | 'revive' | 'utility';
}

export interface Spell {
    id: string;
    name: string;
    description: string;
    mpCost: number;
    type: 'attack' | 'heal' | 'buff' | 'debuff' | 'utility';
    target: 'single' | 'all' | 'self';
    power: number; // Base damage/heal
}

export interface MapData {
    id: string;
    name: string;
    width: number;
    height: number;
    tiles: number[][]; // 0: Grass, 1: Tree, 2: Water, etc.
    encounters: string[]; // Enemy IDs
    encounterRate: number;
    events: MapEvent[];
    bgm?: string;
}

export interface MapEvent {
    x: number;
    y: number;
    type: 'warp' | 'shop' | 'inn' | 'chest' | 'npc' | 'battle';
    targetMapId?: string; // For warp
    targetX?: number;
    targetY?: number;
    message?: string[]; // For NPC/Chest
    data?: any; // Shop items, Chest contents, etc.
}
