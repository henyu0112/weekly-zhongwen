export interface VocabItem {
  id: string;
  hanzi: string;
  pinyin: string;
  en: string;
  emoji: string;
  /** Standard (1–6) where the word is typically taught. Kept for future filtering. */
  standard: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Shared question pool, mixed across Standards 1–6.
 * Games read from here, so new words appear in every game that uses the pool.
 * NOTE: sample words only; replace/extend with the real syllabus later.
 */
export const VOCAB: VocabItem[] = [
  { id: 'ren', hanzi: '人', pinyin: 'rén', en: 'person', emoji: '🧑', standard: 1 },
  { id: 'da', hanzi: '大', pinyin: 'dà', en: 'big', emoji: '🐘', standard: 1 },
  { id: 'xiao', hanzi: '小', pinyin: 'xiǎo', en: 'small', emoji: '🐜', standard: 1 },
  { id: 'shan', hanzi: '山', pinyin: 'shān', en: 'mountain', emoji: '⛰️', standard: 1 },
  { id: 'shui', hanzi: '水', pinyin: 'shuǐ', en: 'water', emoji: '💧', standard: 1 },
  { id: 'huo', hanzi: '火', pinyin: 'huǒ', en: 'fire', emoji: '🔥', standard: 1 },
  { id: 'ri', hanzi: '日', pinyin: 'rì', en: 'sun', emoji: '☀️', standard: 1 },
  { id: 'yue', hanzi: '月', pinyin: 'yuè', en: 'moon', emoji: '🌙', standard: 1 },
  { id: 'kou', hanzi: '口', pinyin: 'kǒu', en: 'mouth', emoji: '👄', standard: 1 },
  { id: 'shou', hanzi: '手', pinyin: 'shǒu', en: 'hand', emoji: '✋', standard: 1 },
  { id: 'pingguo', hanzi: '苹果', pinyin: 'píng guǒ', en: 'apple', emoji: '🍎', standard: 2 },
  { id: 'mao', hanzi: '猫', pinyin: 'māo', en: 'cat', emoji: '🐱', standard: 2 },
  { id: 'gou', hanzi: '狗', pinyin: 'gǒu', en: 'dog', emoji: '🐶', standard: 2 },
  { id: 'yu', hanzi: '鱼', pinyin: 'yú', en: 'fish', emoji: '🐟', standard: 2 },
  { id: 'niao', hanzi: '鸟', pinyin: 'niǎo', en: 'bird', emoji: '🐦', standard: 2 },
  { id: 'hua', hanzi: '花', pinyin: 'huā', en: 'flower', emoji: '🌸', standard: 2 },
  { id: 'shu', hanzi: '书', pinyin: 'shū', en: 'book', emoji: '📖', standard: 2 },
  { id: 'xuexiao', hanzi: '学校', pinyin: 'xué xiào', en: 'school', emoji: '🏫', standard: 2 },
  { id: 'laoshi', hanzi: '老师', pinyin: 'lǎo shī', en: 'teacher', emoji: '🧑‍🏫', standard: 3 },
  { id: 'pengyou', hanzi: '朋友', pinyin: 'péng you', en: 'friend', emoji: '🤝', standard: 3 },
  { id: 'yisheng', hanzi: '医生', pinyin: 'yī shēng', en: 'doctor', emoji: '🧑‍⚕️', standard: 3 },
  { id: 'qiche', hanzi: '汽车', pinyin: 'qì chē', en: 'car', emoji: '🚗', standard: 3 },
  { id: 'feiji', hanzi: '飞机', pinyin: 'fēi jī', en: 'airplane', emoji: '✈️', standard: 3 },
  { id: 'dianhua', hanzi: '电话', pinyin: 'diàn huà', en: 'telephone', emoji: '📞', standard: 3 },
  { id: 'mianbao', hanzi: '面包', pinyin: 'miàn bāo', en: 'bread', emoji: '🍞', standard: 3 },
  { id: 'niunai', hanzi: '牛奶', pinyin: 'niú nǎi', en: 'milk', emoji: '🥛', standard: 3 },
  { id: 'tushuguan', hanzi: '图书馆', pinyin: 'tú shū guǎn', en: 'library', emoji: '📚', standard: 4 },
  { id: 'yiyuan', hanzi: '医院', pinyin: 'yī yuàn', en: 'hospital', emoji: '🏥', standard: 4 },
  { id: 'caihong', hanzi: '彩虹', pinyin: 'cǎi hóng', en: 'rainbow', emoji: '🌈', standard: 4 },
  { id: 'xingxing', hanzi: '星星', pinyin: 'xīng xing', en: 'star', emoji: '⭐', standard: 4 },
  { id: 'yusan', hanzi: '雨伞', pinyin: 'yǔ sǎn', en: 'umbrella', emoji: '☂️', standard: 4 },
  { id: 'diqiu', hanzi: '地球', pinyin: 'dì qiú', en: 'Earth', emoji: '🌍', standard: 5 },
  { id: 'huoche', hanzi: '火车', pinyin: 'huǒ chē', en: 'train', emoji: '🚆', standard: 5 },
  { id: 'diannao', hanzi: '电脑', pinyin: 'diàn nǎo', en: 'computer', emoji: '💻', standard: 5 },
  { id: 'hudie', hanzi: '蝴蝶', pinyin: 'hú dié', en: 'butterfly', emoji: '🦋', standard: 5 },
  { id: 'xigua', hanzi: '西瓜', pinyin: 'xī guā', en: 'watermelon', emoji: '🍉', standard: 5 },
  { id: 'wangyuanjing', hanzi: '望远镜', pinyin: 'wàng yuǎn jìng', en: 'telescope', emoji: '🔭', standard: 6 },
  { id: 'huoshan', hanzi: '火山', pinyin: 'huǒ shān', en: 'volcano', emoji: '🌋', standard: 6 },
  { id: 'yaoshi', hanzi: '钥匙', pinyin: 'yào shi', en: 'key', emoji: '🔑', standard: 6 },
  { id: 'yuhangyuan', hanzi: '宇航员', pinyin: 'yǔ háng yuán', en: 'astronaut', emoji: '🧑‍🚀', standard: 6 },
];
