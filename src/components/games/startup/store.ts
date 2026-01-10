import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { IndustryType, Worker, INDUSTRIES } from './constants';

interface GameState {
    // Game Status
    phase: 'industry_select' | 'dashboard' | 'battle' | 'result';
    turn: number;
    isGameOver: boolean;
    gameResult?: 'IPO' | 'M&A' | 'BANKRUPT';

    // Battle
    currentRival?: { name: string, power: number };
    battleLog?: string[];

    // Company Stats
    companyName: string;
    industry: IndustryType | null;
    capital: number;
    users: number; // Active Users
    productLevel: number; // Quality (0-100)
    brandAwareness: number; // Marketing (0-100)
    marketShare: number; // %

    // Team
    workers: Worker[];

    // Actions
    setIndustry: (industry: IndustryType) => void;
    nextTurn: () => void;
    performAction: (action: 'develop' | 'marketing' | 'hire', payload?: any) => void;
    resetGame: () => void;
    resolveBattle: () => void;
}

const INITIAL_CAPITAL = 100;
const COST_PER_TURN = 5; // burn rate

export const useStartupStore = create<GameState>()(
    immer((set, get) => ({
        phase: 'industry_select',
        turn: 1,
        isGameOver: false,

        companyName: 'GaroopAI',
        industry: null,
        capital: INITIAL_CAPITAL,
        users: 0,
        productLevel: 10,
        brandAwareness: 0,
        marketShare: 0,
        workers: [],

        setIndustry: (industry) => set((state) => {
            state.industry = industry;
            state.phase = 'dashboard';
        }),

        nextTurn: () => set((state) => {
            // Expenses
            const wageCost = state.workers.reduce((acc, w) => acc + w.cost, 0);
            const burn = COST_PER_TURN + (wageCost * 0.1); // Monthly burn
            state.capital -= burn;

            // Revenue (Simple Model: Users * 0.1)
            const revenue = Math.floor(state.users * 0.1);
            state.capital += revenue;

            // Growth
            const industry = INDUSTRIES.find(i => i.id === state.industry);
            const growthRate = (state.productLevel * 0.5 + state.brandAwareness * 0.5) * (industry?.marketSizeMultiplier || 1);

            // Random fluctuations
            const userGrowth = Math.floor(growthRate * (1 + Math.random()));
            state.users += userGrowth;

            state.turn += 1;

            // Random Battle Trigger (e.g., 20% chance after turn 4)
            if (state.turn > 4 && Math.random() < 0.2) {
                const rivalPower = Math.floor((state.productLevel + state.brandAwareness) * (0.8 + Math.random() * 0.4));
                state.currentRival = { name: 'Rival Corp', power: rivalPower };
                state.phase = 'battle';
                return; // Stop processing other end-game checks until battle resolved? No, just switch view.
            }

            // Game Over Checks
            if (state.capital < 0) {
                state.isGameOver = true;
                state.gameResult = 'BANKRUPT';
                state.phase = 'result';
            }

            // Win Checks (Valuation > 10000 approx)
            // Valuation ~ Users * 10
            const valuation = state.users * 10;
            if (valuation >= 100000) { // 1B equivalent
                state.isGameOver = true;
                state.gameResult = 'IPO';
                state.phase = 'result';
            }
        }),

        performAction: (action, payload) => set((state) => {
            if (action === 'develop') {
                const cost = 20;
                if (state.capital >= cost) {
                    state.capital -= cost;
                    // Skill impact
                    const engineerSkill = state.workers.filter(w => w.role === 'Engineer').reduce((acc, w) => acc + w.skill, 0);
                    state.productLevel += 5 + engineerSkill;
                }
            } else if (action === 'marketing') {
                const cost = 30;
                if (state.capital >= cost) {
                    state.capital -= cost;
                    const marketerSkill = state.workers.filter(w => w.role === 'Marketer').reduce((acc, w) => acc + w.skill, 0);
                    state.brandAwareness += 5 + marketerSkill;
                }
            } else if (action === 'hire') {
                const worker = payload as Worker;
                if (state.capital >= worker.cost) {
                    state.capital -= worker.cost; // Sign-on fee
                    state.workers.push(worker);
                }
            }

            // Action acts as 1 week? Or just instant action then End Turn manually? 
            // Let's make actions consume "Action Points" or just 1 action per turn for simplicity? 
            // For now, allow multiple actions, user clicks "Next Month"        }
        }),

        resolveBattle: () => set((state) => {
            if (!state.currentRival) return;

            const myPower = state.productLevel + state.brandAwareness;
            const rivalPower = state.currentRival.power;

            if (myPower >= rivalPower) {
                // Win
                state.marketShare += 5;
                state.users += 1000;
                state.brandAwareness += 5;
            } else {
                // Lose
                state.marketShare = Math.max(0, state.marketShare - 5);
                state.capital -= 10; // Penalty?
            }

            state.phase = 'dashboard';
            state.currentRival = undefined;
        }),

        resetGame: () => set((state) => {
            state.phase = 'industry_select';
            state.turn = 1;
            state.isGameOver = false;
            state.capital = INITIAL_CAPITAL;
            state.users = 0;
            state.productLevel = 10;
            state.brandAwareness = 0;
            state.marketShare = 0;
            state.workers = [];
            state.gameResult = undefined;
        })
    }))
);
