import {
  ANTONYMS,
  POS_HINT_ZH,
  POS_ZH,
  TOPIC_ZH,
  type Pos,
  type TopicKey,
  type Word,
} from '@/data/words';

export type Rule =
  | { kind: 'pos'; pos: Pos }
  | { kind: 'topic'; topic: TopicKey }
  | { kind: 'antonym'; target: Word; answer: Word };

export interface RoundItem {
  uid: string;
  word: Word;
  /** true = this fruit follows the rule and should be cut. */
  correct: boolean;
}

export interface Round {
  key: string;
  rule: Rule;
  title: string;
  sub: string;
  items: RoundItem[];
}

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Pick n items, favouring words in `focus` (used by mistake practice). */
function pick(list: Word[], n: number, focus: Set<string>): Word[] {
  const f = shuffle(list.filter((w) => focus.has(w.id)));
  const o = shuffle(list.filter((w) => !focus.has(w.id)));
  const out: Word[] = [];
  while (out.length < n && (f.length || o.length)) {
    const useFocus = f.length > 0 && (o.length === 0 || Math.random() < 0.6);
    out.push(useFocus ? f.shift()! : o.shift()!);
  }
  return out;
}

export function ruleText(rule: Rule): { title: string; sub: string } {
  switch (rule.kind) {
    case 'pos':
      return { title: `切出所有「${POS_ZH[rule.pos]}」`, sub: POS_HINT_ZH[rule.pos] };
    case 'topic':
      return {
        title: `切出和「${TOPIC_ZH[rule.topic]}」有关的词`,
        sub: '只切符合规则的水果，切错会扣分并失去一条命',
      };
    case 'antonym':
      return {
        title: `切出「${rule.target.hanzi}」的反义词`,
        sub: `${rule.target.pinyin}：找出意思相反的词`,
      };
  }
}

/** Why a wrongly-cut word was wrong (Chinese). */
export function wrongReason(rule: Rule, w: Word): string {
  switch (rule.kind) {
    case 'pos':
      return `「${w.hanzi}」是${POS_ZH[w.pos]}，不是${POS_ZH[rule.pos]}。`;
    case 'topic':
      return w.topic
        ? `「${w.hanzi}」属于「${TOPIC_ZH[w.topic]}」，和「${TOPIC_ZH[rule.topic]}」无关。`
        : `「${w.hanzi}」和「${TOPIC_ZH[rule.topic]}」无关。`;
    case 'antonym':
      return `「${w.hanzi}」不是「${rule.target.hanzi}」的反义词。「${rule.target.hanzi}」的反义词是「${rule.answer.hanzi}」。`;
  }
}

/** Why a missed (not cut) word should have been cut (Chinese). */
export function missReason(rule: Rule, w: Word): string {
  switch (rule.kind) {
    case 'pos':
      return `「${w.hanzi}」是${POS_ZH[w.pos]}，应该切。`;
    case 'topic':
      return `「${w.hanzi}」属于「${TOPIC_ZH[rule.topic]}」，应该切。`;
    case 'antonym':
      return `「${w.hanzi}」是「${rule.target.hanzi}」的反义词，应该切。`;
  }
}

interface Candidate {
  key: string;
  rule: Rule;
  good: Word[];
  bad: Word[];
}

const POS_LIST: Pos[] = ['adj', 'noun', 'verb', 'measure'];
const TOPIC_LIST = Object.keys(TOPIC_ZH) as TopicKey[];

function candidatesFor(pool: Word[]): Candidate[] {
  const ids = new Set(pool.map((w) => w.id));
  const out: Candidate[] = [];

  for (const pos of POS_LIST) {
    const good = pool.filter((w) => w.pos === pos);
    const bad = pool.filter((w) => w.pos !== pos);
    if (good.length >= 3 && bad.length >= 4) out.push({ key: `pos:${pos}`, rule: { kind: 'pos', pos }, good, bad });
  }

  for (const topic of TOPIC_LIST) {
    const good = pool.filter((w) => w.topic === topic);
    const bad = pool.filter((w) => w.topic !== topic);
    if (good.length >= 3 && bad.length >= 4) out.push({ key: `topic:${topic}`, rule: { kind: 'topic', topic }, good, bad });
  }

  for (const [a, b] of ANTONYMS) {
    if (!ids.has(a.id) || !ids.has(b.id)) continue;
    for (const [target, answer] of [
      [a, b],
      [b, a],
    ] as const) {
      const bad = pool.filter((w) => w.pos === target.pos && w.id !== a.id && w.id !== b.id);
      if (bad.length >= 3) {
        out.push({ key: `antonym:${target.id}`, rule: { kind: 'antonym', target, answer }, good: [answer], bad });
      }
    }
  }
  return out;
}

export interface RoundOptions {
  size: number;
  ratio: number;
  roundNo: number;
  prevKey?: string;
  focus: Set<string>;
}

export function makeRound(pool: Word[], opts: RoundOptions): Round {
  let cands = candidatesFor(pool);
  if (cands.length === 0) {
    // Tiny pool safety net: fall back to the whole pool as a noun round.
    const good = pool.filter((w) => w.pos === 'noun');
    cands = [{ key: 'pos:noun', rule: { kind: 'pos', pos: 'noun' }, good, bad: pool.filter((w) => w.pos !== 'noun') }];
  }
  const fresh = cands.filter((c) => c.key !== opts.prevKey);
  const usable = fresh.length ? fresh : cands;

  // Pick a rule *kind* first so antonym rules (many candidates) don't dominate.
  const kinds = [...new Set(usable.map((c) => c.rule.kind))];
  const kind = kinds[Math.floor(Math.random() * kinds.length)];
  const ofKind = usable.filter((c) => c.rule.kind === kind);

  // Prefer rules that exercise words from the mistake book.
  const weights = ofKind.map((c) => 1 + (c.good.some((w) => opts.focus.has(w.id)) ? 3 : 0));
  let r = Math.random() * weights.reduce((s, x) => s + x, 0);
  let chosen = ofKind[0];
  for (let i = 0; i < ofKind.length; i++) {
    r -= weights[i];
    if (r <= 0) {
      chosen = ofKind[i];
      break;
    }
  }

  const isAntonym = chosen.rule.kind === 'antonym';
  const nCorrect = isAntonym ? 2 : Math.min(chosen.good.length, Math.max(3, Math.round(opts.size * opts.ratio)));
  const goodWords = isAntonym ? [chosen.good[0], chosen.good[0]] : pick(chosen.good, nCorrect, opts.focus);
  const badWords = pick(chosen.bad, Math.max(opts.size - goodWords.length, 3), opts.focus);

  const items: RoundItem[] = shuffle([
    ...goodWords.map((word) => ({ word, correct: true })),
    ...badWords.map((word) => ({ word, correct: false })),
  ]).map((it, i) => ({ ...it, uid: `r${opts.roundNo}-${i}` }));

  const { title, sub } = ruleText(chosen.rule);
  return { key: chosen.key, rule: chosen.rule, title, sub, items };
}
