export type IndustryType = 'AI_ART' | 'AI_CHAT' | 'AI_AUTO';

export interface Industry {
    id: IndustryType;
    name: string;
    description: string;
    difficulty: 'Easy' | 'Normal' | 'Hard';
    marketSizeMultiplier: number; // Higher = Higher Potential Valuation
}

export const INDUSTRIES: Industry[] = [
    {
        id: 'AI_ART',
        name: 'AI Art Generator',
        description: 'Create beautiful art with AI. Popular with creators!',
        difficulty: 'Easy',
        marketSizeMultiplier: 1.0,
    },
    {
        id: 'AI_CHAT',
        name: 'AI Chat Assistant',
        description: 'Smart assistant for productivity. High retention.',
        difficulty: 'Normal',
        marketSizeMultiplier: 1.5,
    },
    {
        id: 'AI_AUTO',
        name: 'AI Autonomous Agent',
        description: 'Agents that do work for you. Hard tech, huge payout.',
        difficulty: 'Hard',
        marketSizeMultiplier: 2.5,
    },
];

export interface Worker {
    id: string;
    name: string;
    role: 'Engineer' | 'Designer' | 'Marketer';
    cost: number;
    skill: number; // Adds to dev speed or quality
    avatar: string;
}

export const WORKERS: Worker[] = [
    { id: 'w1', name: 'Mike (Cat)', role: 'Engineer', cost: 10, skill: 5, avatar: '🐱' },
    { id: 'w2', name: 'Pochi (Dog)', role: 'Marketer', cost: 10, skill: 5, avatar: '🐶' },
    { id: 'w3', name: 'Koko (Parrot)', role: 'Designer', cost: 10, skill: 5, avatar: '🦜' },
    { id: 'w4', name: 'Leo (Lion)', role: 'Engineer', cost: 30, skill: 15, avatar: '🦁' },
    { id: 'w5', name: 'Fox (Fox)', role: 'Marketer', cost: 30, skill: 15, avatar: '🦊' },
    // Advanced
    { id: 'w6', name: 'Owl (Owl)', role: 'Engineer', cost: 100, skill: 50, avatar: '🦉' },
];

export const RIVALS = [
    { name: 'OpeAI', valuation: 10000, marketShare: 40 },
    { name: 'Goggle', valuation: 50000, marketShare: 30 },
    { name: 'Anthropic', valuation: 5000, marketShare: 10 },
];
