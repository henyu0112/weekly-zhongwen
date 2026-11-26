import { MEANINGS } from './meanings';

export type Pos = 'adj' | 'noun' | 'verb' | 'measure' | 'idiom';

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
  /** Picture file in public/art/words (without .svg), if this word has one. */
  art?: string;
  /** Simple Chinese meaning (释义) from meanings.ts. Never contains the word's own characters. */
  zh?: string;
}

export const POS_ZH: Record<Pos, string> = {
  adj: '形容词',
  noun: '名词',
  verb: '动词',
  measure: '量词',
  idiom: '成语',
};

export const POS_EN: Record<Pos, string> = {
  adj: 'Adjective',
  noun: 'Noun',
  verb: 'Verb',
  measure: 'Measure word',
  idiom: 'Idiom',
};

export const POS_HINT_ZH: Record<Pos, string> = {
  adj: '形容词：描写人或事物的样子',
  noun: '名词：人、事物或地方的名称',
  verb: '动词：表示动作的词',
  measure: '量词：用来计算人或事物的单位',
  idiom: '成语：意思固定的四字词语，常有典故',
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

export const TOPIC_EN: Record<TopicKey, string> = {
  food: 'Food',
  animal: 'Animals',
  nature: 'Nature',
  school: 'School',
  family: 'Family',
  body: 'Body',
  transport: 'Transport',
  place: 'Places',
  science: 'Science',
  society: 'Society',
  feeling: 'Feelings & character',
};

/** Which words have a picture (hanzi → file name). */
const PICTURES: Record<string, string> = {
  人: 'ren',
  大: 'da',
  小: 'xiao',
  山: 'shan',
  水: 'shui',
  火: 'huo',
  日: 'ri',
  月: 'yue',
  口: 'kou',
  手: 'shou',
  苹果: 'pingguo',
  猫: 'mao',
  狗: 'gou',
  鱼: 'yu',
  鸟: 'niao',
  花: 'hua',
  书: 'shu',
  学校: 'xuexiao',
  老师: 'laoshi',
  朋友: 'pengyou',
  医生: 'yisheng',
  汽车: 'qiche',
  飞机: 'feiji',
  电话: 'dianhua',
  面包: 'mianbao',
  牛奶: 'niunai',
  图书馆: 'tushuguan',
  医院: 'yiyuan',
  彩虹: 'caihong',
  星星: 'xingxing',
  雨伞: 'yusan',
  地球: 'diqiu',
  火车: 'huoche',
  电脑: 'diannao',
  蝴蝶: 'hudie',
  西瓜: 'xigua',
  望远镜: 'wangyuanjing',
  火山: 'huoshan',
  钥匙: 'yaoshi',
  宇航员: 'yuhangyuan',
};

type Row = [hanzi: string, pinyin: string, en: string, pos: Pos, topic?: TopicKey];

const L = (level: number, rows: Row[]): Word[] =>
  rows.map(([hanzi, pinyin, en, pos, topic]) => ({ id: hanzi, hanzi, pinyin, en, pos, topic, level, art: PICTURES[hanzi], zh: MEANINGS[hanzi] }));

/**
 * THE WORD DATABASE: every word exists here exactly once. Games and the
 * dictionary refer to words by id (see activities.ts), so fixing a word here
 * fixes it everywhere.
 *
 * DRAFT word list for testing. Levels, word types and topics are
 * approximate and MUST be reviewed by a teacher against the real syllabus
 * (KSSR Standard 1–6, KSSM Form 1–5) before real use.
 */
export const WORDS: Word[] = [
  // Standard 1
  ...L(1, [
    ['日', 'rì', 'sun', 'noun', 'nature'],
    ['月', 'yuè', 'moon', 'noun', 'nature'],
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
    ['朋友', 'péng you', 'friend', 'noun'],
    ['电话', 'diàn huà', 'telephone', 'noun'],
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
    ['钥匙', 'yào shi', 'key', 'noun'],
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
  // 成语 Idioms (Hanzi Snake 成语 mode; Hanzi Slash leaves them out)
  ...L(3, [
    ['一心一意', 'yī xīn yī yì', 'wholeheartedly', 'idiom'],
    ['三心二意', 'sān xīn èr yì', 'half-hearted', 'idiom'],
    ['自言自语', 'zì yán zì yǔ', 'to talk to oneself', 'idiom'],
    ['五颜六色', 'wǔ yán liù sè', 'colourful', 'idiom'],
    ['七上八下', 'qī shàng bā xià', 'nervous and uneasy', 'idiom'],
    ['一模一样', 'yī mú yī yàng', 'exactly alike', 'idiom'],
  ]),
  ...L(4, [
    ['千方百计', 'qiān fāng bǎi jì', 'by every possible means', 'idiom'],
    ['半途而废', 'bàn tú ér fèi', 'to give up halfway', 'idiom'],
    ['井底之蛙', 'jǐng dǐ zhī wā', 'a frog in a well (narrow view)', 'idiom'],
    ['守株待兔', 'shǒu zhū dài tù', 'to wait for luck instead of working', 'idiom'],
    ['亡羊补牢', 'wáng yáng bǔ láo', 'better late than never', 'idiom'],
    ['画蛇添足', 'huà shé tiān zú', 'to ruin something by overdoing it', 'idiom'],
    ['对牛弹琴', 'duì niú tán qín', 'to talk to someone who cannot understand', 'idiom'],
  ]),
  ...L(5, [
    ['自相矛盾', 'zì xiāng máo dùn', 'to contradict oneself', 'idiom'],
    ['狐假虎威', 'hú jiǎ hǔ wēi', 'to bully using someone else\'s power', 'idiom'],
    ['拔苗助长', 'bá miáo zhù zhǎng', 'to spoil things by being too hasty', 'idiom'],
    ['刻舟求剑', 'kè zhōu qiú jiàn', 'to be rigid and not adapt', 'idiom'],
    ['杯弓蛇影', 'bēi gōng shé yǐng', 'to be scared by imaginary things', 'idiom'],
    ['胸有成竹', 'xiōng yǒu chéng zhú', 'to have a well-thought-out plan', 'idiom'],
    ['一举两得', 'yī jǔ liǎng dé', 'to kill two birds with one stone', 'idiom'],
    ['争先恐后', 'zhēng xiān kǒng hòu', 'to rush to be first', 'idiom'],
  ]),
  ...L(6, [
    ['专心致志', 'zhuān xīn zhì zhì', 'fully concentrated', 'idiom'],
    ['全神贯注', 'quán shén guàn zhù', 'with rapt attention', 'idiom'],
    ['津津有味', 'jīn jīn yǒu wèi', 'with great relish', 'idiom'],
    ['废寝忘食', 'fèi qǐn wàng shí', 'to forget to eat and sleep', 'idiom'],
    ['持之以恒', 'chí zhī yǐ héng', 'to persevere', 'idiom'],
    ['坚持不懈', 'jiān chí bù xiè', 'unremitting', 'idiom'],
  ]),
  ...L(7, [
    ['卧薪尝胆', 'wò xīn cháng dǎn', 'to endure hardship to reach a goal', 'idiom'],
    ['鹤立鸡群', 'hè lì jī qún', 'to stand out from the crowd', 'idiom'],
    ['名列前茅', 'míng liè qián máo', 'among the very best', 'idiom'],
    ['循序渐进', 'xún xù jiàn jìn', 'step by step', 'idiom'],
    ['精益求精', 'jīng yì qiú jīng', 'to strive for perfection', 'idiom'],
    ['同心协力', 'tóng xīn xié lì', 'to work together', 'idiom'],
  ]),
  ...L(8, [
    ['一丝不苟', 'yī sī bù gǒu', 'meticulous', 'idiom'],
    ['锲而不舍', 'qiè ér bù shě', 'to keep at it', 'idiom'],
    ['脚踏实地', 'jiǎo tà shí dì', 'down-to-earth', 'idiom'],
    ['实事求是', 'shí shì qiú shì', 'to seek truth from facts', 'idiom'],
    ['众志成城', 'zhòng zhì chéng chéng', 'unity is strength', 'idiom'],
    ['风雨同舟', 'fēng yǔ tóng zhōu', 'to stick together through hardship', 'idiom'],
  ]),
  ...L(9, [
    ['入木三分', 'rù mù sān fēn', 'deep and penetrating', 'idiom'],
    ['破釜沉舟', 'pò fǔ chén zhōu', 'to burn one\'s boats', 'idiom'],
    ['未雨绸缪', 'wèi yǔ chóu móu', 'to prepare in advance', 'idiom'],
    ['学以致用', 'xué yǐ zhì yòng', 'to put learning into practice', 'idiom'],
    ['温故知新', 'wēn gù zhī xīn', 'to review the old to learn the new', 'idiom'],
  ]),
  ...L(10, [
    ['饮水思源', 'yǐn shuǐ sī yuán', 'to remember where good things came from', 'idiom'],
    ['居安思危', 'jū ān sī wēi', 'to be prepared in times of peace', 'idiom'],
    ['集思广益', 'jí sī guǎng yì', 'to pool everyone\'s ideas', 'idiom'],
    ['见贤思齐', 'jiàn xián sī qí', 'to learn from those better than you', 'idiom'],
    ['防微杜渐', 'fáng wēi dù jiàn', 'to nip problems in the bud', 'idiom'],
  ]),
  ...L(11, [
    ['厚积薄发', 'hòu jī bó fā', 'to build up before showing results', 'idiom'],
    ['高瞻远瞩', 'gāo zhān yuǎn zhǔ', 'far-sighted', 'idiom'],
    ['力挽狂澜', 'lì wǎn kuáng lán', 'to turn the tide', 'idiom'],
    ['自强不息', 'zì qiáng bù xī', 'to strive constantly to improve', 'idiom'],
    ['海纳百川', 'hǎi nà bǎi chuān', 'open-minded and tolerant', 'idiom'],
  ]),
];

export const WORD_BY_ID: Record<string, Word> = Object.fromEntries(WORDS.map((w) => [w.id, w]));

// Guard: a word added twice stops the build instead of silently overwriting the first.
if (Object.keys(WORD_BY_ID).length !== WORDS.length) {
  const seen = new Set<string>();
  const twice = WORDS.filter((w) => seen.size === seen.add(w.id).size).map((w) => w.id);
  throw new Error(`Duplicate words in src/data/words.ts: ${twice.join(', ')}`);
}

// Guard: a Chinese meaning that contains its own word would give the answer away in Hanzi Snake.
const leaks = WORDS.filter((w) => w.zh && [...w.hanzi].some((ch) => w.zh!.includes(ch))).map((w) => w.id);
if (leaks.length) throw new Error(`These meanings in src/data/meanings.ts contain their own word: ${leaks.join(', ')}`);

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
