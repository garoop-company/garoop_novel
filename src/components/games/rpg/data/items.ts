import { Item } from '../types';

export const ITEMS: Record<string, Item> = {
    herb: {
        id: 'herb',
        name: 'やくそう',
        type: 'consumable',
        description: '仲間のHPを約30回復する',
        price: 8,
        effectType: 'heal_hp',
        effectValue: 30,
    },
    magic_water: {
        id: 'magic_water',
        name: 'まほうのせいすい',
        type: 'consumable',
        description: '仲間のMPを約10回復する',
        price: 40,
        effectType: 'heal_mp',
        effectValue: 10,
    },
    antidote: {
        id: 'antidote',
        name: 'どくけしそう',
        type: 'consumable',
        description: '毒状態を治す',
        price: 10,
        effectType: 'cure_status',
    },
    warp_wing: {
        id: 'warp_wing',
        name: 'キメラのつばさ',
        type: 'consumable',
        description: '最後に訪れた街に戻る',
        price: 25,
        effectType: 'utility', // Special handling
    },
};
