import { wordsFor } from '@/data/activities';
import { WORDS, type Word } from '@/data/words';

/**
 * Hanzi Snake rules, with no drawing or React: a plain state machine stepped by
 * `update(dt)`. A "target" is any sequence of characters to eat in order, so
 * the planned 成语 mode only needs to supply 4-character targets.
 */

export type DifficultyId = 'easy' | 'normal' | 'hard';
export type GameMode = 'normal' | 'practice' | 'mistakes';
export type Dir = 'up' | 'down' | 'left' | 'right';

export const COLS = 12;
export const ROWS = 12;
export const WORDS_PER_STAGE = 10;
const START_LENGTH = 3;
/** Wrong characters shrink the snake, but never below this. */
const MIN_LENGTH = 3;

export interface DifficultyParams {
  label: string;
  desc: string;
  lives: number;
  /** Moves per second at the start. */
  speed: number;
  /** Extra moves per second after each finished word. */
  speedUp: number;
  maxSpeed: number;
  /** Walls wrap round to the other side instead of costing a life. */
  wrap: boolean;
  /** Red herring characters on the board per word: [min, max]. */
  decoys: [number, number];
  /** Pick lookalike and same-sound characters as red herrings. */
  tricky: boolean;
  maxLength: number;
  /** Seconds without progress before the next character glows. */
  hintAfter: number;
  showPinyin: boolean;
  showPicture: boolean;
}

export const DIFFICULTIES: Record<DifficultyId, DifficultyParams> = {
  easy: {
    label: '简单',
    desc: '慢速 · 可穿墙 · 有拼音和图片提示',
    lives: 3,
    speed: 4,
    speedUp: 0,
    maxSpeed: 4,
    wrap: true,
    decoys: [0, 0],
    tricky: false,
    maxLength: 2,
    hintAfter: 8,
    showPinyin: true,
    showPicture: true,
  },
  normal: {
    label: '普通',
    desc: '中速 · 撞墙扣命 · 1–2 个干扰字',
    lives: 3,
    speed: 5.5,
    speedUp: 0.1,
    maxSpeed: 6.5,
    wrap: false,
    decoys: [1, 2],
    tricky: false,
    maxLength: 3,
    hintAfter: 12,
    showPinyin: false,
    showPicture: true,
  },
  hard: {
    label: '困难',
    desc: '越来越快 · 只看意思 · 形近字和同音字陷阱',
    lives: 3,
    speed: 6.5,
    speedUp: 0.25,
    maxSpeed: 9,
    wrap: false,
    decoys: [2, 3],
    tricky: true,
    maxLength: 4,
    hintAfter: 15,
    showPinyin: false,
    showPicture: false,
  },
};

export interface SnakeConfig {
  difficulty: DifficultyId;
  mode: GameMode;
  levelMin: number;
  levelMax: number;
  focusIds: string[];
}

export interface Cell {
  x: number;
  y: number;
}

export interface Item extends Cell {
  ch: string;
  /** Position in the current word, or -1 for a red herring. */
  index: number;
}

export type SnakeEvent =
  | { type: 'eat'; x: number; y: number }
  | { type: 'wrong'; x: number; y: number; ch: string; reason: 'decoy' | 'order' }
  | { type: 'crash'; x: number; y: number; reason: CrashReason }
  | { type: 'word'; word: Word; clean: boolean }
  | { type: 'over' };

export type CrashReason = 'wall' | 'self';

/** Seconds the crash stays on screen, then the countdown before moving again. */
const CRASH_SHOW = 1.8;
const COUNTDOWN = 3;
/** After a crash the snake restarts slowly and gets back to full speed over this many seconds. */
const RECOVER_SECONDS = 6;
const RECOVER_START = 0.5;

export interface WordResult {
  word: Word;
  clean: boolean;
}

const DELTA: Record<Dir, Cell> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };

const rand = (n: number) => Math.floor(Math.random() * n);
const shuffle = <T>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ---------- red herrings ----------
const plain = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Every character in the database, and its toneless sound where we can tell. */
const ALL_CHARS = [...new Set(WORDS.flatMap((w) => [...w.hanzi]))];
const SOUND = new Map<string, string>();
for (const w of WORDS) {
  const syllables = w.pinyin.split(/\s+/);
  if (syllables.length !== w.hanzi.length) continue;
  [...w.hanzi].forEach((ch, i) => SOUND.has(ch) || SOUND.set(ch, plain(syllables[i])));
}

/** Characters that are easy to confuse by shape. */
const LOOKALIKE: Record<string, string> = {
  大: '太犬天夫', 太: '大犬', 天: '夫大', 人: '入八', 入: '人八', 土: '士工', 士: '土',
  日: '目曰白', 目: '日自', 白: '百日', 百: '白', 木: '本禾术', 本: '木', 未: '末', 末: '未',
  己: '已', 已: '己', 王: '玉主', 玉: '王', 主: '王', 果: '采', 采: '果', 鸟: '乌', 乌: '鸟',
  午: '牛', 牛: '午', 千: '干于', 干: '千', 力: '刀', 刀: '力', 田: '由甲', 由: '田', 手: '毛',
  毛: '手', 头: '买', 买: '头卖', 卖: '买', 学: '字', 字: '学', 问: '间', 间: '问', 左: '右',
  右: '左石', 石: '右', 贝: '见', 见: '贝', 今: '令', 令: '今', 休: '体', 体: '休', 清: '晴请情',
  晴: '清请', 请: '清晴', 情: '清', 进: '近', 近: '进', 住: '往', 往: '住', 明: '朋', 朋: '明',
  看: '着', 车: '东', 东: '车', 水: '永', 永: '水', 米: '来', 来: '米', 校: '较', 师: '帅',
  生: '牛', 机: '几', 包: '句', 话: '活', 活: '话', 星: '是', 花: '化', 电: '由', 汽: '气',
};

function pickDecoys(word: Word, count: number, tricky: boolean): string[] {
  if (count <= 0) return [];
  const own = new Set(word.hanzi);
  const out = new Set<string>();
  if (tricky) {
    const pool: string[] = [];
    for (const ch of word.hanzi) {
      pool.push(...(LOOKALIKE[ch] ?? ''));
      const sound = SOUND.get(ch);
      if (sound) pool.push(...ALL_CHARS.filter((c) => c !== ch && SOUND.get(c) === sound));
    }
    for (const ch of shuffle(pool)) {
      if (out.size >= count) break;
      if (!own.has(ch)) out.add(ch);
    }
  }
  while (out.size < count) {
    const ch = ALL_CHARS[rand(ALL_CHARS.length)];
    if (!own.has(ch)) out.add(ch);
  }
  return [...out];
}

// ---------- the game ----------
export class SnakeGame {
  readonly params: DifficultyParams;
  readonly practice: boolean;
  readonly maxLives: number | null;

  /** Snake cells, head first. */
  snake: Cell[] = [];
  /** Character shown on each body piece (same index as `snake`; the head has none). */
  labels: (string | undefined)[] = [];
  dir: Dir = 'right';
  private queue: Dir[] = [];

  items: Item[] = [];
  word: Word | null = null;
  /** Characters of the current word eaten so far. */
  progress = 0;
  wordsDone = 0;

  lives: number;
  score = 0;
  correct = 0;
  wrong = 0;
  crashes = 0;

  phase: 'ready' | 'run' | 'card' | 'crashed' | 'over' = 'ready';
  /** Seconds left in the current pause (get ready, crash, word card). */
  pauseLeft = 1.2;
  finished = false;
  /** Where and why the last crash happened (shown while `phase` is 'crashed'). */
  crash: { x: number; y: number; reason: CrashReason } | null = null;
  /** Seconds of slow speed left after a crash. */
  private recoverLeft = 0;

  /** Positions before the last move, for smooth drawing between moves. */
  prevSnake: Cell[] | null = null;
  /** The last move grew the snake (the body stayed still while the head moved). */
  grew = false;

  results: WordResult[] = [];
  readonly mistakeIds = new Set<string>();
  readonly mastered = new Set<string>();
  private wordMistake = false;
  private hintUsed = false;
  private sinceProgress = 0;
  private stepAcc = 0;
  private queueWords: Word[];
  private readonly focus: Set<string>;
  events: SnakeEvent[] = [];

  constructor(readonly config: SnakeConfig) {
    this.params = DIFFICULTIES[config.difficulty];
    this.practice = config.mode === 'practice';
    this.maxLives = this.practice ? null : this.params.lives;
    this.lives = this.params.lives;
    this.focus = new Set(config.mode === 'mistakes' ? config.focusIds : []);
    this.queueWords = this.pickWords();
    this.resetSnake();
    this.nextWord();
    this.phase = 'ready';
    this.pauseLeft = 1.2;
  }

  // ----- words -----
  private pickWords(): Word[] {
    const all = wordsFor('hanzi-snake');
    let pool: Word[];
    if (this.focus.size) {
      pool = all.filter((w) => this.focus.has(w.id));
    } else {
      pool = all.filter(
        (w) =>
          w.level >= this.config.levelMin &&
          w.level <= this.config.levelMax &&
          w.hanzi.length <= this.params.maxLength,
      );
      // Too few words in this group at this length: allow longer ones from the same group.
      if (pool.length < 4) pool = all.filter((w) => w.level >= this.config.levelMin && w.level <= this.config.levelMax);
    }
    if (pool.length === 0) pool = all;

    const picked: Word[] = [];
    while (picked.length < WORDS_PER_STAGE) {
      for (const w of shuffle(pool)) {
        if (picked.length >= WORDS_PER_STAGE) break;
        // Avoid the same word twice in a row, unless it is the only word there is.
        if (pool.length === 1 || picked[picked.length - 1]?.id !== w.id) picked.push(w);
      }
    }
    return picked;
  }

  private nextWord(): void {
    this.word = this.queueWords[this.wordsDone] ?? null;
    this.progress = 0;
    this.wordMistake = false;
    this.hintUsed = false;
    this.sinceProgress = 0;
    this.items = [];
    if (!this.word) return;
    [...this.word.hanzi].forEach((ch, index) => this.place({ ch, index }));
    const [lo, hi] = this.params.decoys;
    for (const ch of pickDecoys(this.word, lo + rand(hi - lo + 1), this.params.tricky)) this.place({ ch, index: -1 });
  }

  /** True once the player has been stuck long enough for the next character to glow. */
  get hint(): boolean {
    return this.phase === 'run' && this.sinceProgress >= this.params.hintAfter;
  }

  get speed(): number {
    const full = Math.min(this.params.maxSpeed, this.params.speed + this.params.speedUp * this.wordsDone);
    const slow = (this.recoverLeft / RECOVER_SECONDS) * (1 - RECOVER_START);
    return full * (1 - slow);
  }

  /** True while the snake is still in its slow start after a crash. */
  get recovering(): boolean {
    return this.recoverLeft > 0;
  }

  /** How far (0–1) the snake is between its last cell and the next, for smooth drawing. */
  get stepProgress(): number {
    if (this.phase !== 'run' || !this.prevSnake) return 1;
    return Math.min(1, this.stepAcc * this.speed);
  }

  // ----- board -----
  private occupied(x: number, y: number): boolean {
    return this.snake.some((c) => c.x === x && c.y === y) || this.items.some((c) => c.x === x && c.y === y);
  }

  /** Puts a character on a free cell away from the head and out of its path. */
  private place(item: { ch: string; index: number }): void {
    const head = this.snake[0];
    const d = DELTA[this.dir];
    const edge = this.params.wrap ? 0 : 1;
    const free: Cell[] = [];
    const fallback: Cell[] = [];
    for (let y = edge; y < ROWS - edge; y++) {
      for (let x = edge; x < COLS - edge; x++) {
        if (this.occupied(x, y)) continue;
        fallback.push({ x, y });
        const dist = Math.abs(x - head.x) + Math.abs(y - head.y);
        const ahead = [1, 2, 3].some((k) => x === head.x + d.x * k && y === head.y + d.y * k);
        if (dist >= 3 && !ahead) free.push({ x, y });
      }
    }
    const spots = free.length ? free : fallback;
    if (!spots.length) return;
    const spot = spots[rand(spots.length)];
    this.items.push({ ...spot, ...item });
  }

  private resetSnake(): void {
    const cy = Math.floor(ROWS / 2);
    const cx = Math.floor(COLS / 2) - 1;
    this.snake = Array.from({ length: START_LENGTH }, (_, i) => ({ x: cx - i, y: cy }));
    this.labels = Array.from({ length: START_LENGTH }, () => undefined);
    this.dir = 'right';
    this.queue = [];
    this.prevSnake = null;
    this.grew = false;
    // Anything now under the snake moves somewhere else.
    const under = this.items.filter((it) => this.snake.some((c) => c.x === it.x && c.y === it.y));
    this.items = this.items.filter((it) => !under.includes(it));
    for (const it of under) this.place(it);
  }

  // ----- input -----
  turn(dir: Dir): void {
    if (this.phase === 'over') return;
    const last = this.queue[this.queue.length - 1] ?? this.dir;
    if (dir === last || dir === OPPOSITE[last] || this.queue.length >= 2) return;
    this.queue.push(dir);
  }

  // ----- time -----
  update(dt: number): void {
    if (this.phase === 'over') return;
    if (this.phase === 'ready' || this.phase === 'card' || this.phase === 'crashed') {
      this.pauseLeft -= dt;
      if (this.pauseLeft > 0) return;
      if (this.phase === 'crashed') {
        // Let the player see what went wrong, then count down from the middle.
        if (!this.practice && this.lives <= 0) return this.end();
        this.resetSnake();
        this.phase = 'ready';
        this.pauseLeft = COUNTDOWN;
        this.recoverLeft = RECOVER_SECONDS;
        return;
      }
      if (this.phase === 'card') {
        this.wordsDone += 1;
        if (this.wordsDone >= WORDS_PER_STAGE) {
          this.finished = true;
          this.end();
          return;
        }
        this.nextWord();
      }
      this.phase = 'run';
      this.stepAcc = 0;
      return;
    }
    this.sinceProgress += dt;
    this.recoverLeft = Math.max(0, this.recoverLeft - dt);
    if (this.hint) this.hintUsed = true;
    this.stepAcc += dt;
    const stepTime = 1 / this.speed;
    // Cap catch-up so a slow frame can't move the snake several cells at once.
    this.stepAcc = Math.min(this.stepAcc, stepTime * 2);
    while (this.stepAcc >= stepTime && this.phase === 'run') {
      this.stepAcc -= stepTime;
      this.step();
    }
  }

  private step(): void {
    const next = this.queue.shift();
    if (next && next !== OPPOSITE[this.dir]) this.dir = next;
    const d = DELTA[this.dir];
    const head = this.snake[0];
    let x = head.x + d.x;
    let y = head.y + d.y;

    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) {
      if (!this.params.wrap) return this.crashAt(head, 'wall');
      x = (x + COLS) % COLS;
      y = (y + ROWS) % ROWS;
    }
    // The tail moves away this step, so it is safe to move into.
    if (this.snake.slice(0, -1).some((c) => c.x === x && c.y === y)) return this.crashAt({ x, y }, 'self');

    this.prevSnake = this.snake.map((c) => ({ ...c }));
    this.grew = false;
    const hit = this.items.find((it) => it.x === x && it.y === y);
    if (hit && hit.index === this.progress) {
      this.items = this.items.filter((it) => it !== hit);
      this.grew = true;
      this.snake.unshift({ x, y });
      // The new piece sits just behind the head, so the body reads left-to-right as the word.
      this.labels.splice(1, 0, hit.ch);
      this.progress += 1;
      this.correct += 1;
      this.score += 10;
      this.sinceProgress = 0;
      this.events.push({ type: 'eat', x, y });
      if (this.word && this.progress >= this.word.hanzi.length) this.completeWord();
      return;
    }

    this.snake.unshift({ x, y });
    this.snake.pop();

    if (hit) {
      // Wrong character: a red herring, or a character of this word eaten too early.
      this.items = this.items.filter((it) => it !== hit);
      if (hit.index >= 0) this.place({ ch: hit.ch, index: hit.index });
      if (this.snake.length > MIN_LENGTH) {
        this.snake.pop();
        this.labels.pop();
      }
      this.wrong += 1;
      this.score = Math.max(0, this.score - 5);
      this.wordMistake = true;
      if (this.word) this.mistakeIds.add(this.word.id);
      this.events.push({ type: 'wrong', x, y, ch: hit.ch, reason: hit.index >= 0 ? 'order' : 'decoy' });
    }
  }

  private completeWord(): void {
    const word = this.word!;
    const clean = !this.wordMistake;
    this.score += 30 + (clean && !this.hintUsed ? 20 : 0);
    if (clean && this.focus.has(word.id)) this.mastered.add(word.id);
    this.results.push({ word, clean });
    this.items = [];
    this.events.push({ type: 'word', word, clean });
    this.phase = 'card';
    this.pauseLeft = 1.4;
  }

  private crashAt(at: Cell, reason: CrashReason): void {
    this.crashes += 1;
    if (!this.practice) this.lives -= 1;
    this.crash = { x: at.x, y: at.y, reason };
    this.events.push({ type: 'crash', x: at.x, y: at.y, reason });
    // Freeze where it happened so the player can see the mistake.
    this.prevSnake = null;
    this.queue = [];
    this.phase = 'crashed';
    this.pauseLeft = CRASH_SHOW;
  }

  /** Practice runs can be ended early from the menu. */
  end(): void {
    if (this.phase === 'over') return;
    this.phase = 'over';
    this.events.push({ type: 'over' });
  }

  // ----- results -----
  accuracy(): number {
    const total = this.correct + this.wrong;
    return total ? this.correct / total : 0;
  }

  stars(): number {
    if (this.practice || this.correct === 0) return 0;
    if (!this.finished) return 1;
    const a = this.accuracy();
    return a >= 0.9 ? 3 : a >= 0.7 ? 2 : 1;
  }

  /** One perfect round = the whole stage with no wrong characters and no crashes. */
  perfectRounds(): number {
    return this.finished && this.wrong === 0 && this.crashes === 0 ? 1 : 0;
  }

  /** Words finished without a single wrong character. */
  cleanIds(): string[] {
    return [...new Set(this.results.filter((r) => r.clean).map((r) => r.word.id))].filter((id) => !this.mistakeIds.has(id));
  }
}
