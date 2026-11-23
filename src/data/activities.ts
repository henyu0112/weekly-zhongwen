import { WORDS, WORD_BY_ID, type Word } from './words';

/**
 * Which words each game or activity uses. An entry only stores word ids; the
 * word itself lives once in words.ts. To reuse a word in a new activity, add
 * its id to that activity's list.
 */
export const ACTIVITY_WORDS: Record<string, string[]> = {
  // Hanzi Slash builds its rules from word type, topic and antonyms, so it can use every word.
  'hanzi-slash': WORDS.map((w) => w.id),
  // Word Pop needs a picture for each word.
  'word-pop': [
    '人', '大', '小', '山', '水', '火', '日', '月', '口', '手',
    '苹果', '猫', '狗', '鱼', '鸟', '花', '书', '学校', '老师', '朋友',
    '医生', '汽车', '飞机', '电话', '面包', '牛奶', '图书馆', '医院', '彩虹', '星星',
    '雨伞', '地球', '火车', '电脑', '蝴蝶', '西瓜', '望远镜', '火山', '钥匙', '宇航员',
  ],
};

export function wordsFor(activity: string): Word[] {
  return (ACTIVITY_WORDS[activity] ?? []).map((id) => {
    const word = WORD_BY_ID[id];
    if (!word) throw new Error(`Activity "${activity}" uses unknown word "${id}"`);
    return word;
  });
}

/** The activities a word appears in, for the dictionary. */
export const activitiesForWord = (id: string): string[] =>
  Object.keys(ACTIVITY_WORDS).filter((slug) => ACTIVITY_WORDS[slug].includes(id));
