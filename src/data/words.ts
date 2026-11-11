export type Pos = 'adj' | 'noun' | 'verb' | 'measure';

export type TopicKey =
  | 'food'
  | 'animal'
  | 'nature'
  | 'school'
  | 'family'
  | 'body'
  | 'transport'
  | 'place'
  | 'science'
  | 'society'
  | 'feeling';

export interface Word {
  /** Same as hanzi; unique across the list. */
  id: string;
  hanzi: string;
  pinyin: string;
  en: string;
  pos: Pos;
  topic?: TopicKey;
  /** 1–6 = Standard 1–6, 7–11 = Form 1–5. */
  level: number;
}

export const POS_ZH: Record<Pos, string> = {
  adj: '形容词',
  noun: '名词',
  verb: '动词',
  measure: '量词',
};

export const POS_HINT_ZH: Record<Pos, string> = {
  adj: '形容词：描写人或事物的样子',
  noun: '名词：人、事物或地方的名称',
  verb: '动词：表示动作的词',
  measure: '量词：用来计算人或事物的单位',
};

export const TOPIC_ZH: Record<TopicKey, string> = {
  food: '食物',
  animal: '动物',
  nature: '大自然',
  school: '学校',
  family: '家人',
  body: '身体',
  transport: '交通工具',
  place: '地方',
  science: '科学',
  society: '社会',
  feeling: '心情与品格',
};

type Row = [hanzi: string, pinyin: string, en: string, pos: Pos, topic?: TopicKey];

const L = (level: number, rows: Row[]): Word[] =>
  rows.map(([hanzi, pinyin, en, pos, topic]) => ({ id: hanzi, hanzi, pinyin, en, pos, topic, level }));

/**
 * DRAFT word list for testing the game. Levels, word types and topics are
 * approximate and MUST be reviewed by a teacher against the real syllabus
 * (KSSR Standard 1–6, KSSM Form 1–5) before real use.
 */
export const WORDS: Word[] = [
  // Standard 1
  ...L(1, [
    ['大', 'dà', 'big', 'adj'],
    ['小', 'xiǎo', 'small', 'adj'],
    ['多', 'duō', 'many', 'adj'],
    ['少', 'shǎo', 'few', 'adj'],
    ['长', 'cháng', 'long', 'adj'],
    ['短', 'duǎn', 'short', 'adj'],
    ['人', 'rén', 'person', 'noun'],
    ['手', 'shǒu', 'hand', 'noun', 'body'],
    ['口', 'kǒu', 'mouth', 'noun', 'body'],
    ['头', 'tóu', 'head', 'noun', 'body'],
    ['山', 'shān', 'mountain', 'noun', 'nature'],
    ['水', 'shuǐ', 'water', 'noun', 'nature'],
    ['火', 'huǒ', 'fire', 'noun', 'nature'],
    ['狗', 'gǒu', 'dog', 'noun', 'animal'],
    ['猫', 'māo', 'cat', 'noun', 'animal'],
    ['鱼', 'yú', 'fish', 'noun', 'animal'],
    ['吃', 'chī', 'to eat', 'verb'],
    ['喝', 'hē', 'to drink', 'verb'],
    ['看', 'kàn', 'to look', 'verb'],
    ['走', 'zǒu', 'to walk', 'verb'],
    ['个', 'gè', 'general measure word', 'measure'],
    ['只', 'zhī', 'measure word for animals', 'measure'],
  ]),
  // Standard 2
  ...L(2, [
    ['高', 'gāo', 'tall', 'adj'],
    ['矮', 'ǎi', 'short (height)', 'adj'],
    ['快', 'kuài', 'fast', 'adj'],
    ['慢', 'màn', 'slow', 'adj'],
    ['红', 'hóng', 'red', 'adj'],
    ['白', 'bái', 'white', 'adj'],
    ['黑', 'hēi', 'black', 'adj'],
    ['苹果', 'píng guǒ', 'apple', 'noun', 'food'],
    ['面包', 'miàn bāo', 'bread', 'noun', 'food'],
    ['牛奶', 'niú nǎi', 'milk', 'noun', 'food'],
    ['米饭', 'mǐ fàn', 'rice', 'noun', 'food'],
    ['老师', 'lǎo shī', 'teacher', 'noun', 'school'],
    ['书', 'shū', 'book', 'noun', 'school'],
    ['学校', 'xué xiào', 'school', 'noun', 'school'],
    ['爸爸', 'bà ba', 'father', 'noun', 'family'],
    ['妈妈', 'mā ma', 'mother', 'noun', 'family'],
    ['爷爷', 'yé ye', 'grandfather', 'noun', 'family'],
    ['奶奶', 'nǎi nai', 'grandmother', 'noun', 'family'],
    ['脚', 'jiǎo', 'foot', 'noun', 'body'],
    ['鸟', 'niǎo', 'bird', 'noun', 'animal'],
    ['花', 'huā', 'flower', 'noun', 'nature'],
    ['跑', 'pǎo', 'to run', 'verb'],
    ['跳', 'tiào', 'to jump', 'verb'],
    ['本', 'běn', 'measure word for books', 'measure'],
    ['条', 'tiáo', 'measure word for long things', 'measure'],
  ]),
  // Standard 3
  ...L(3, [
    ['新', 'xīn', 'new', 'adj'],
    ['旧', 'jiù', 'old (things)', 'adj'],
    ['好', 'hǎo', 'good', 'adj'],
    ['坏', 'huài', 'bad', 'adj'],
    ['冷', 'lěng', 'cold', 'adj'],
    ['热', 'rè', 'hot', 'adj'],
    ['轻', 'qīng', 'light (weight)', 'adj'],
    ['重', 'zhòng', 'heavy', 'adj'],
    ['兔子', 'tù zi', 'rabbit', 'noun', 'animal'],
    ['老虎', 'lǎo hǔ', 'tiger', 'noun', 'animal'],
    ['大象', 'dà xiàng', 'elephant', 'noun', 'animal'],
    ['西瓜', 'xī guā', 'watermelon', 'noun', 'food'],
    ['香蕉', 'xiāng jiāo', 'banana', 'noun', 'food'],
    ['汽车', 'qì chē', 'car', 'noun', 'transport'],
    ['飞机', 'fēi jī', 'airplane', 'noun', 'transport'],
    ['书包', 'shū bāo', 'schoolbag', 'noun', 'school'],
    ['铅笔', 'qiān bǐ', 'pencil', 'noun', 'school'],
    ['眼睛', 'yǎn jing', 'eyes', 'noun', 'body'],
    ['洗', 'xǐ', 'to wash', 'verb'],
    ['写', 'xiě', 'to write', 'verb'],
    ['读', 'dú', 'to read', 'verb'],
    ['张', 'zhāng', 'measure word for flat things', 'measure'],
    ['件', 'jiàn', 'measure word for clothes', 'measure'],
    ['辆', 'liàng', 'measure word for vehicles', 'measure'],
  ]),
  // Standard 4
  ...L(4, [
    ['远', 'yuǎn', 'far', 'adj'],
    ['近', 'jìn', 'near', 'adj'],
    ['胖', 'pàng', 'fat', 'adj'],
    ['瘦', 'shòu', 'thin', 'adj'],
    ['干净', 'gān jìng', 'clean', 'adj'],
    ['美丽', 'měi lì', 'beautiful', 'adj'],
    ['高兴', 'gāo xìng', 'happy', 'adj'],
    ['医生', 'yī shēng', 'doctor', 'noun', 'society'],
    ['医院', 'yī yuàn', 'hospital', 'noun', 'place'],
    ['图书馆', 'tú shū guǎn', 'library', 'noun', 'place'],
    ['公园', 'gōng yuán', 'park', 'noun', 'place'],
    ['彩虹', 'cǎi hóng', 'rainbow', 'noun', 'nature'],
    ['星星', 'xīng xing', 'star', 'noun', 'nature'],
    ['蝴蝶', 'hú dié', 'butterfly', 'noun', 'animal'],
    ['雨伞', 'yǔ sǎn', 'umbrella', 'noun'],
    ['火车', 'huǒ chē', 'train', 'noun', 'transport'],
    ['帮助', 'bāng zhù', 'to help', 'verb'],
    ['打扫', 'dǎ sǎo', 'to sweep', 'verb'],
    ['开', 'kāi', 'to open', 'verb'],
    ['关', 'guān', 'to close', 'verb'],
    ['朵', 'duǒ', 'measure word for flowers', 'measure'],
    ['棵', 'kē', 'measure word for trees', 'measure'],
    ['双', 'shuāng', 'measure word for pairs', 'measure'],
  ]),
  // Standard 5
  ...L(5, [
    ['勇敢', 'yǒng gǎn', 'brave', 'adj'],
    ['胆小', 'dǎn xiǎo', 'timid', 'adj'],
    ['勤奋', 'qín fèn', 'diligent', 'adj'],
    ['懒惰', 'lǎn duò', 'lazy', 'adj'],
    ['诚实', 'chéng shí', 'honest', 'adj'],
    ['安静', 'ān jìng', 'quiet', 'adj'],
    ['吵闹', 'chǎo nào', 'noisy', 'adj'],
    ['地球', 'dì qiú', 'Earth', 'noun', 'nature'],
    ['森林', 'sēn lín', 'forest', 'noun', 'nature'],
    ['海洋', 'hǎi yáng', 'ocean', 'noun', 'nature'],
    ['老鹰', 'lǎo yīng', 'eagle', 'noun', 'animal'],
    ['企鹅', 'qǐ é', 'penguin', 'noun', 'animal'],
    ['电脑', 'diàn nǎo', 'computer', 'noun', 'science'],
    ['望远镜', 'wàng yuǎn jìng', 'telescope', 'noun', 'science'],
    ['比赛', 'bǐ sài', 'competition', 'noun', 'school'],
    ['保护', 'bǎo hù', 'to protect', 'verb'],
    ['节约', 'jié yuē', 'to save', 'verb'],
    ['浪费', 'làng fèi', 'to waste', 'verb'],
    ['参加', 'cān jiā', 'to join', 'verb'],
    ['群', 'qún', 'measure word for groups', 'measure'],
    ['串', 'chuàn', 'measure word for bunches', 'measure'],
    ['艘', 'sōu', 'measure word for ships', 'measure'],
  ]),
  // Standard 6
  ...L(6, [
    ['危险', 'wēi xiǎn', 'dangerous', 'adj'],
    ['安全', 'ān quán', 'safe', 'adj'],
    ['复杂', 'fù zá', 'complicated', 'adj'],
    ['简单', 'jiǎn dān', 'simple', 'adj'],
    ['骄傲', 'jiāo ào', 'arrogant', 'adj'],
    ['谦虚', 'qiān xū', 'modest', 'adj'],
    ['宇航员', 'yǔ háng yuán', 'astronaut', 'noun', 'science'],
    ['火山', 'huǒ shān', 'volcano', 'noun', 'nature'],
    ['沙漠', 'shā mò', 'desert', 'noun', 'nature'],
    ['实验', 'shí yàn', 'experiment', 'noun', 'science'],
    ['文化', 'wén huà', 'culture', 'noun', 'society'],
    ['邮局', 'yóu jú', 'post office', 'noun', 'place'],
    ['市场', 'shì chǎng', 'market', 'noun', 'place'],
    ['鲸鱼', 'jīng yú', 'whale', 'noun', 'animal'],
    ['增加', 'zēng jiā', 'to increase', 'verb'],
    ['减少', 'jiǎn shǎo', 'to decrease', 'verb'],
    ['失败', 'shī bài', 'to fail', 'verb'],
    ['发现', 'fā xiàn', 'to discover', 'verb'],
    ['观察', 'guān chá', 'to observe', 'verb'],
    ['支', 'zhī', 'measure word for sticks', 'measure'],
    ['片', 'piàn', 'measure word for slices', 'measure'],
    ['座', 'zuò', 'measure word for hills/buildings', 'measure'],
  ]),
  // Form 1
  ...L(7, [
    ['富有', 'fù yǒu', 'rich', 'adj'],
    ['贫穷', 'pín qióng', 'poor', 'adj'],
    ['光明', 'guāng míng', 'bright', 'adj'],
    ['黑暗', 'hēi àn', 'dark', 'adj'],
    ['友善', 'yǒu shàn', 'friendly', 'adj'],
    ['自私', 'zì sī', 'selfish', 'adj'],
    ['积极', 'jī jí', 'positive', 'adj'],
    ['消极', 'xiāo jí', 'negative', 'adj'],
    ['环境', 'huán jìng', 'environment', 'noun', 'nature'],
    ['社会', 'shè huì', 'society', 'noun', 'society'],
    ['经济', 'jīng jì', 'economy', 'noun', 'society'],
    ['科学', 'kē xué', 'science', 'noun', 'science'],
    ['教室', 'jiào shì', 'classroom', 'noun', 'place'],
    ['操场', 'cāo chǎng', 'sports field', 'noun', 'place'],
    ['邻居', 'lín jū', 'neighbour', 'noun', 'society'],
    ['尊敬', 'zūn jìng', 'to respect', 'verb'],
    ['鼓励', 'gǔ lì', 'to encourage', 'verb'],
    ['批评', 'pī píng', 'to criticise', 'verb'],
    ['珍惜', 'zhēn xī', 'to cherish', 'verb'],
    ['位', 'wèi', 'measure word for people (polite)', 'measure'],
    ['套', 'tào', 'measure word for sets', 'measure'],
  ]),
  // Form 2
  ...L(8, [
    ['严肃', 'yán sù', 'serious', 'adj'],
    ['幽默', 'yōu mò', 'humorous', 'adj'],
    ['虚伪', 'xū wěi', 'hypocritical', 'adj'],
    ['进步', 'jìn bù', 'to progress', 'verb'],
    ['退步', 'tuì bù', 'to regress', 'verb'],
    ['赞成', 'zàn chéng', 'to agree with', 'verb'],
    ['反对', 'fǎn duì', 'to oppose', 'verb'],
    ['团结', 'tuán jié', 'to unite', 'verb'],
    ['竞争', 'jìng zhēng', 'to compete', 'verb'],
    ['污染', 'wū rǎn', 'pollution', 'noun', 'nature'],
    ['资源', 'zī yuán', 'resources', 'noun', 'nature'],
    ['气候', 'qì hòu', 'climate', 'noun', 'nature'],
    ['地震', 'dì zhèn', 'earthquake', 'noun', 'nature'],
    ['传统', 'chuán tǒng', 'tradition', 'noun', 'society'],
    ['节日', 'jié rì', 'festival', 'noun', 'society'],
    ['博物馆', 'bó wù guǎn', 'museum', 'noun', 'place'],
    ['科技', 'kē jì', 'technology', 'noun', 'science'],
    ['网络', 'wǎng luò', 'network', 'noun', 'science'],
    ['幅', 'fú', 'measure word for paintings', 'measure'],
    ['首', 'shǒu', 'measure word for songs/poems', 'measure'],
  ]),
  // Form 3
  ...L(9, [
    ['乐观', 'lè guān', 'optimistic', 'adj'],
    ['悲观', 'bēi guān', 'pessimistic', 'adj'],
    ['主动', 'zhǔ dòng', 'proactive', 'adj'],
    ['被动', 'bèi dòng', 'passive', 'adj'],
    ['繁荣', 'fán róng', 'prosperous', 'adj'],
    ['落后', 'luò hòu', 'backward', 'adj'],
    ['明智', 'míng zhì', 'wise', 'adj'],
    ['愚蠢', 'yú chǔn', 'foolish', 'adj'],
    ['能源', 'néng yuán', 'energy source', 'noun', 'science'],
    ['细胞', 'xì bāo', 'cell', 'noun', 'science'],
    ['宇宙', 'yǔ zhòu', 'universe', 'noun', 'science'],
    ['政府', 'zhèng fǔ', 'government', 'noun', 'society'],
    ['经验', 'jīng yàn', 'experience', 'noun', 'society'],
    ['友谊', 'yǒu yì', 'friendship', 'noun', 'feeling'],
    ['理想', 'lǐ xiǎng', 'ideal', 'noun', 'feeling'],
    ['克服', 'kè fú', 'to overcome', 'verb'],
    ['坚持', 'jiān chí', 'to persist', 'verb'],
    ['放弃', 'fàng qì', 'to give up', 'verb'],
    ['探索', 'tàn suǒ', 'to explore', 'verb'],
    ['届', 'jiè', 'measure word for sessions', 'measure'],
    ['项', 'xiàng', 'measure word for items/projects', 'measure'],
  ]),
  // Form 4
  ...L(10, [
    ['严谨', 'yán jǐn', 'rigorous', 'adj'],
    ['草率', 'cǎo shuài', 'careless', 'adj'],
    ['充裕', 'chōng yù', 'abundant', 'adj'],
    ['匮乏', 'kuì fá', 'scarce', 'adj'],
    ['灿烂', 'càn làn', 'brilliant', 'adj'],
    ['黯淡', 'àn dàn', 'dim', 'adj'],
    ['保守', 'bǎo shǒu', 'conservative', 'adj'],
    ['生态', 'shēng tài', 'ecology', 'noun', 'nature'],
    ['文明', 'wén míng', 'civilisation', 'noun', 'society'],
    ['价值', 'jià zhí', 'value', 'noun', 'society'],
    ['机遇', 'jī yù', 'opportunity', 'noun', 'society'],
    ['挑战', 'tiǎo zhàn', 'challenge', 'noun', 'society'],
    ['创新', 'chuàng xīn', 'to innovate', 'verb'],
    ['分析', 'fēn xī', 'to analyse', 'verb'],
    ['维护', 'wéi hù', 'to uphold', 'verb'],
    ['破坏', 'pò huài', 'to destroy', 'verb'],
    ['促进', 'cù jìn', 'to promote', 'verb'],
    ['阻碍', 'zǔ ài', 'to hinder', 'verb'],
    ['篇', 'piān', 'measure word for articles', 'measure'],
    ['场', 'chǎng', 'measure word for events', 'measure'],
  ]),
  // Form 5
  ...L(11, [
    ['谨慎', 'jǐn shèn', 'cautious', 'adj'],
    ['鲁莽', 'lǔ mǎng', 'reckless', 'adj'],
    ['深刻', 'shēn kè', 'profound', 'adj'],
    ['肤浅', 'fū qiǎn', 'superficial', 'adj'],
    ['辉煌', 'huī huáng', 'glorious', 'adj'],
    ['宏伟', 'hóng wěi', 'grand', 'adj'],
    ['渺小', 'miǎo xiǎo', 'tiny', 'adj'],
    ['哲学', 'zhé xué', 'philosophy', 'noun', 'society'],
    ['道德', 'dào dé', 'morality', 'noun', 'society'],
    ['责任', 'zé rèn', 'responsibility', 'noun', 'society'],
    ['尊严', 'zūn yán', 'dignity', 'noun', 'feeling'],
    ['智慧', 'zhì huì', 'wisdom', 'noun', 'feeling'],
    ['倡导', 'chàng dǎo', 'to advocate', 'verb'],
    ['摒弃', 'bìng qì', 'to abandon', 'verb'],
    ['弘扬', 'hóng yáng', 'to promote', 'verb'],
    ['衡量', 'héng liáng', 'to weigh up', 'verb'],
    ['汲取', 'jí qǔ', 'to absorb', 'verb'],
    ['衰退', 'shuāi tuì', 'to decline', 'verb'],
    ['幢', 'zhuàng', 'measure word for buildings', 'measure'],
    ['部', 'bù', 'measure word for films/books', 'measure'],
  ]),
];

export const WORD_BY_ID: Record<string, Word> = Object.fromEntries(WORDS.map((w) => [w.id, w]));

/** Antonym pairs (by hanzi). A pair is only used when both words are in the chosen level range. */
const ANTONYM_SOURCE: [string, string][] = [
  ['大', '小'],
  ['多', '少'],
  ['长', '短'],
  ['高', '矮'],
  ['快', '慢'],
  ['新', '旧'],
  ['好', '坏'],
  ['冷', '热'],
  ['轻', '重'],
  ['远', '近'],
  ['胖', '瘦'],
  ['开', '关'],
  ['红', '白'],
  ['勇敢', '胆小'],
  ['勤奋', '懒惰'],
  ['安静', '吵闹'],
  ['节约', '浪费'],
  ['危险', '安全'],
  ['复杂', '简单'],
  ['骄傲', '谦虚'],
  ['增加', '减少'],
  ['富有', '贫穷'],
  ['光明', '黑暗'],
  ['积极', '消极'],
  ['进步', '退步'],
  ['赞成', '反对'],
  ['诚实', '虚伪'],
  ['乐观', '悲观'],
  ['主动', '被动'],
  ['繁荣', '落后'],
  ['明智', '愚蠢'],
  ['坚持', '放弃'],
  ['充裕', '匮乏'],
  ['灿烂', '黯淡'],
  ['严谨', '草率'],
  ['促进', '阻碍'],
  ['谨慎', '鲁莽'],
  ['深刻', '肤浅'],
  ['保护', '破坏'],
];

export const ANTONYMS: [Word, Word][] = ANTONYM_SOURCE.filter(
  ([a, b]) => WORD_BY_ID[a] && WORD_BY_ID[b],
).map(([a, b]) => [WORD_BY_ID[a], WORD_BY_ID[b]]);
