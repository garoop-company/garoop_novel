import type { BlogPost } from '../types';
import readerBecomesTheHeroByus from './reader-becomes-the-hero-byus';
import sayHowAiHelped from './say-how-ai-helped';
import storyToScreenTools from './story-to-screen-tools';
import charactersWithTaste from './characters-with-taste';
import aiFilmHumanStory from './ai-film-human-story';

/** 記事を足すときは、ここに import を1行と配列に1つ足す（並び順は lib/blog/index.ts で日付順にする） */
export const POSTS: BlogPost[] = [readerBecomesTheHeroByus, sayHowAiHelped, storyToScreenTools, charactersWithTaste, aiFilmHumanStory];
