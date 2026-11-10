import type { Localized } from '@/lib/types';

export type TopicId = 'vocabulary' | 'characters' | 'pinyin' | 'idioms' | 'sentences';

export const TOPICS: Record<TopicId, { label: Localized; emoji: string }> = {
  vocabulary: { label: { en: 'Vocabulary', zh: '词汇' }, emoji: '📚' },
  characters: { label: { en: 'Characters', zh: '汉字' }, emoji: '✍️' },
  pinyin: { label: { en: 'Pinyin', zh: '拼音' }, emoji: '🔤' },
  idioms: { label: { en: 'Idioms', zh: '成语' }, emoji: '🐉' },
  sentences: { label: { en: 'Sentences', zh: '句子' }, emoji: '💬' },
};

export interface GameMeta {
  /** URL id: /games/<slug>. Must match the key in loaders.ts if playable. */
  slug: string;
  title: Localized;
  description: Localized;
  howTo: Localized;
  /** Toneless pinyin of the title, so players can search by typing pinyin. */
  pinyin: string;
  emoji: string;
  /** Tailwind gradient classes for the card artwork. */
  gradient: string;
  topics: TopicId[];
  /** Inclusive Standard range covered by the questions. */
  standards: [number, number];
  /** Monday the game goes live (YYYY-MM-DD). Future dates stay hidden. */
  releaseDate: string;
  tags: string[];
  /** The classic game it is inspired by. */
  inspiredBy?: string;
  /** false = sample entry, game not built yet. */
  playable: boolean;
}

/**
 * ADD A NEW WEEKLY GAME HERE (and in loaders.ts if it is playable).
 * Newest release date = "This week's game" on the home page.
 */
export const GAMES: GameMeta[] = [
  {
    slug: 'word-pop',
    title: { en: 'Word Pop', zh: '汉字泡泡' },
    description: {
      en: 'Race the clock! Match pictures to the right Chinese words, and Chinese words to the right pictures, before time runs out.',
      zh: '和时间赛跑！在时间用完之前，把图片和正确的中文词语配对。',
    },
    howTo: {
      en: 'Tap the correct answer. Build a streak of right answers for bonus points. You have 45 seconds!',
      zh: '点击正确的答案。连续答对可获得额外加分。你有 45 秒！',
    },
    pinyin: 'han zi pao pao',
    emoji: '🫧',
    gradient: 'from-sky-400 to-indigo-500',
    topics: ['vocabulary', 'characters'],
    standards: [1, 6],
    releaseDate: '2026-11-09',
    tags: ['quiz', 'timed', 'matching'],
    inspiredBy: 'Bubble Pop',
    playable: true,
  },
  {
    slug: 'fruit-slash',
    title: { en: 'Fruit Slash', zh: '切水果' },
    description: {
      en: 'Slice the fruits whose names match the Chinese word, and dodge the bombs!',
      zh: '切开与中文词语相符的水果，小心避开炸弹！',
    },
    howTo: {
      en: 'Swipe across the correct fruit. Avoid the wrong ones.',
      zh: '滑动手指切开正确的水果，避开错误的水果。',
    },
    pinyin: 'qie shui guo',
    emoji: '🍉',
    gradient: 'from-rose-400 to-orange-400',
    topics: ['vocabulary'],
    standards: [1, 6],
    releaseDate: '2026-11-02',
    tags: ['swipe', 'fruit', 'reflex'],
    inspiredBy: 'Fruit Ninja',
    playable: false,
  },
  {
    slug: 'hanzi-snake',
    title: { en: 'Hanzi Snake', zh: '汉字贪吃蛇' },
    description: {
      en: 'Guide the snake to eat the characters in the correct order to build words.',
      zh: '操控小蛇，按正确顺序吃掉汉字，拼成词语。',
    },
    howTo: {
      en: 'Steer with arrow keys or swipe. Eat the right character next.',
      zh: '用方向键或滑动来控制方向，依序吃下正确的汉字。',
    },
    pinyin: 'han zi tan chi she',
    emoji: '🐍',
    gradient: 'from-emerald-400 to-teal-600',
    topics: ['characters', 'vocabulary'],
    standards: [1, 6],
    releaseDate: '2026-10-26',
    tags: ['snake', 'classic', 'arcade'],
    inspiredBy: 'Snake',
    playable: false,
  },
  {
    slug: 'pinyin-launcher',
    title: { en: 'Pinyin Launcher', zh: '拼音弹弓' },
    description: {
      en: 'Launch birds at the towers that hold the matching pinyin and knock them down.',
      zh: '用弹弓发射小鸟，击倒写着对应拼音的高塔。',
    },
    howTo: {
      en: 'Drag back, aim and release to launch the bird.',
      zh: '向后拉动、瞄准，然后松手发射小鸟。',
    },
    pinyin: 'pin yin dan gong',
    emoji: '🐦',
    gradient: 'from-amber-400 to-red-500',
    topics: ['pinyin'],
    standards: [1, 6],
    releaseDate: '2026-10-19',
    tags: ['physics', 'aim', 'birds'],
    inspiredBy: 'Angry Birds',
    playable: false,
  },
  {
    // Future release date: proves that scheduled games stay hidden until their week.
    slug: 'star-defenders',
    title: { en: 'Star Defenders', zh: '汉字保卫战' },
    description: {
      en: 'Defend your ship by shooting falling characters that match the word.',
      zh: '射击与词语相符的坠落汉字，保卫你的飞船。',
    },
    howTo: { en: 'Move and shoot.', zh: '移动并射击。' },
    pinyin: 'han zi bao wei zhan',
    emoji: '🚀',
    gradient: 'from-violet-500 to-fuchsia-600',
    topics: ['characters'],
    standards: [1, 6],
    releaseDate: '2099-01-04',
    tags: ['shooter', 'space'],
    inspiredBy: 'Space Invaders',
    playable: false,
  },
];

export const getGame = (slug: string): GameMeta | undefined => GAMES.find((g) => g.slug === slug);
