export interface VocabItem {
  id: string;
  hanzi: string;
  pinyin: string;
  en: string;
  /** Standard (1–6) where the word is typically taught. Kept for future filtering. */
  standard: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Shared question pool, mixed across Standards 1–6.
 * Games read from here, so new words appear in every game that uses the pool.
 * NOTE: sample words only; replace/extend with the real syllabus later.
 */
export const VOCAB: VocabItem[] = [
  { id: 'ren', hanzi: '人', pinyin: 'rén', en: 'person', standard: 1 },
  { id: 'da', hanzi: '大', pinyin: 'dà', en: 'big', standard: 1 },
  { id: 'xiao', hanzi: '小', pinyin: 'xiǎo', en: 'small', standard: 1 },
  { id: 'shan', hanzi: '山', pinyin: 'shān', en: 'mountain', standard: 1 },
  { id: 'shui', hanzi: '水', pinyin: 'shuǐ', en: 'water', standard: 1 },
  { id: 'huo', hanzi: '火', pinyin: 'huǒ', en: 'fire', standard: 1 },
  { id: 'ri', hanzi: '日', pinyin: 'rì', en: 'sun', standard: 1 },
  { id: 'yue', hanzi: '月', pinyin: 'yuè', en: 'moon', standard: 1 },
  { id: 'kou', hanzi: '口', pinyin: 'kǒu', en: 'mouth', standard: 1 },
  { id: 'shou', hanzi: '手', pinyin: 'shǒu', en: 'hand', standard: 1 },
  { id: 'pingguo', hanzi: '苹果', pinyin: 'píng guǒ', en: 'apple', standard: 2 },
  { id: 'mao', hanzi: '猫', pinyin: 'māo', en: 'cat', standard: 2 },
  { id: 'gou', hanzi: '狗', pinyin: 'gǒu', en: 'dog', standard: 2 },
  { id: 'yu', hanzi: '鱼', pinyin: 'yú', en: 'fish', standard: 2 },
  { id: 'niao', hanzi: '鸟', pinyin: 'niǎo', en: 'bird', standard: 2 },
  { id: 'hua', hanzi: '花', pinyin: 'huā', en: 'flower', standard: 2 },
  { id: 'shu', hanzi: '书', pinyin: 'shū', en: 'book', standard: 2 },
  { id: 'xuexiao', hanzi: '学校', pinyin: 'xué xiào', en: 'school', standard: 2 },
  { id: 'laoshi', hanzi: '老师', pinyin: 'lǎo shī', en: 'teacher', standard: 3 },
  { id: 'pengyou', hanzi: '朋友', pinyin: 'péng you', en: 'friend', standard: 3 },
  { id: 'yisheng', hanzi: '医生', pinyin: 'yī shēng', en: 'doctor', standard: 3 },
  { id: 'qiche', hanzi: '汽车', pinyin: 'qì chē', en: 'car', standard: 3 },
  { id: 'feiji', hanzi: '飞机', pinyin: 'fēi jī', en: 'airplane', standard: 3 },
  { id: 'dianhua', hanzi: '电话', pinyin: 'diàn huà', en: 'telephone', standard: 3 },
  { id: 'mianbao', hanzi: '面包', pinyin: 'miàn bāo', en: 'bread', standard: 3 },
  { id: 'niunai', hanzi: '牛奶', pinyin: 'niú nǎi', en: 'milk', standard: 3 },
  { id: 'tushuguan', hanzi: '图书馆', pinyin: 'tú shū guǎn', en: 'library', standard: 4 },
  { id: 'yiyuan', hanzi: '医院', pinyin: 'yī yuàn', en: 'hospital', standard: 4 },
  { id: 'caihong', hanzi: '彩虹', pinyin: 'cǎi hóng', en: 'rainbow', standard: 4 },
  { id: 'xingxing', hanzi: '星星', pinyin: 'xīng xing', en: 'star', standard: 4 },
  { id: 'yusan', hanzi: '雨伞', pinyin: 'yǔ sǎn', en: 'umbrella', standard: 4 },
  { id: 'diqiu', hanzi: '地球', pinyin: 'dì qiú', en: 'Earth', standard: 5 },
  { id: 'huoche', hanzi: '火车', pinyin: 'huǒ chē', en: 'train', standard: 5 },
  { id: 'diannao', hanzi: '电脑', pinyin: 'diàn nǎo', en: 'computer', standard: 5 },
  { id: 'hudie', hanzi: '蝴蝶', pinyin: 'hú dié', en: 'butterfly', standard: 5 },
  { id: 'xigua', hanzi: '西瓜', pinyin: 'xī guā', en: 'watermelon', standard: 5 },
  { id: 'wangyuanjing', hanzi: '望远镜', pinyin: 'wàng yuǎn jìng', en: 'telescope', standard: 6 },
  { id: 'huoshan', hanzi: '火山', pinyin: 'huǒ shān', en: 'volcano', standard: 6 },
  { id: 'yaoshi', hanzi: '钥匙', pinyin: 'yào shi', en: 'key', standard: 6 },
  { id: 'yuhangyuan', hanzi: '宇航员', pinyin: 'yǔ háng yuán', en: 'astronaut', standard: 6 },
];
