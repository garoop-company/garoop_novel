import { ja } from './ja';
import { en } from './en';
import { zh } from './zh';
import { fr } from './fr';
import { id } from './id';
import { it } from './it';
import { ne } from './ne';

export const locales = ['ja', 'en', 'zh', 'fr', 'id', 'it', 'ne'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ja';

export const dictionaries = {
  ja,
  en,
  zh,
  fr,
  id,
  it,
  ne,
};

export const localeMeta: Record<Locale, { flag: string; label: string; ogLocale: string; i18nTag: string }> = {
  ja: { flag: '🇯🇵', label: '日本語', ogLocale: 'ja_JP', i18nTag: 'ja-JP' },
  en: { flag: '🇺🇸', label: 'English', ogLocale: 'en_US', i18nTag: 'en-US' },
  zh: { flag: '🇨🇳', label: '中文', ogLocale: 'zh_CN', i18nTag: 'zh-CN' },
  fr: { flag: '🇫🇷', label: 'Français', ogLocale: 'fr_FR', i18nTag: 'fr-FR' },
  id: { flag: '🇮🇩', label: 'Bahasa Indonesia', ogLocale: 'id_ID', i18nTag: 'id-ID' },
  it: { flag: '🇮🇹', label: 'Italiano', ogLocale: 'it_IT', i18nTag: 'it-IT' },
  ne: { flag: '🇳🇵', label: 'नेपाली', ogLocale: 'ne_NP', i18nTag: 'ne-NP' },
};

export const isLocale = (value: string): value is Locale => locales.includes(value as Locale);

export const getDictionary = (lang: Locale) => dictionaries[lang] || dictionaries.ja;
