import { ja } from './ja';
import { en } from './en';
import { zh } from './zh';

export const locales = ['ja', 'en', 'zh'] as const;
export type Locale = (typeof locales)[number];

export const dictionaries = {
    ja,
    en,
    zh,
};

export const getDictionary = (lang: Locale) => dictionaries[lang] || dictionaries.ja;
