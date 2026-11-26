'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Gamepad2,
  Heart,
  HeartCrack,
  Leaf,
  PartyPopper,
  Pause,
  Star,
  Target,
  ThumbsUp,
  Volume2,
  X,
} from 'lucide-react';
import { GameArt } from '@/components/GameArt';
import { RewardPanel } from '@/components/RewardPanel';
import { WordArt } from '@/components/WordArt';
import { ACTIVITY_WORDS } from '@/data/activities';
import type { Word } from '@/data/words';
import type { RewardSummary } from '@/lib/economy';
import { LEVEL_GROUPS, type LevelGroupId } from '@/lib/levels';
import { useProfile } from '@/lib/profile';
import { speak } from '@/lib/speech';
import { createPersistentStore, useStore } from '@/lib/store';
import type { GameProps } from '@/lib/types';
import { DIFFICULTIES, STAGE_SIZE, SnakeGame, type Content, type DifficultyId, type Dir, type GameMode, type SnakeConfig } from './game';
import { SnakeView } from './view';

// ---------- preferences ----------
type RangeId = LevelGroupId | 'all';

const RANGES: Record<RangeId, { label: string; sub?: string; levels: [number, number] }> = {
  ...(Object.fromEntries(
    LEVEL_GROUPS.map((g) => [g.id, { label: g.name.zh, sub: g.years.zh, levels: g.levels }]),
  ) as Record<LevelGroupId, { label: string; sub: string; levels: [number, number] }>),
  all: { label: '全部年级', levels: [1, 11] },
};

interface Prefs {
  content: Content;
  range: RangeId;
  difficulty: DifficultyId;
  /** On-screen arrow pad. null = automatic (shown on touch screens). */
  dpad: boolean | null;
}

const prefsStore = createPersistentStore<Prefs>('wz.hanzisnake', {
  content: 'words',
  range: 'all',
  difficulty: 'normal',
  dpad: null,
});

const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
const CONTENT_WORDS: Record<Content, Set<string>> = {
  words: new Set(ACTIVITY_WORDS['hanzi-snake']),
  idioms: new Set(ACTIVITY_WORDS['hanzi-snake-idioms']),
};

const CONTENT: Record<Content, { label: string; sub: string; unit: string; title: string; intro: string }> = {
  words: {
    label: '组词',
    sub: '按顺序吃字，拼出词语',
    unit: '个词',
    title: '汉字贪吃蛇 · 组词',
    intro: '看提示，按顺序吃下汉字，拼出词语！',
  },
  idioms: {
    label: '成语',
    sub: '按顺序吃下四个字，拼出成语',
    unit: '个成语',
    title: '汉字贪吃蛇 · 成语',
    intro: '看意思，按顺序吃下四个字，拼出成语！',
  },
};

const SHELL = 'bg-gradient-to-b from-[#0d2b20] to-[#123c2d] text-white';

// ---------- small UI pieces ----------
function Chip({
  active,
  onClick,
  children,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  sub?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-11 rounded-2xl border-2 px-4 py-2 text-left font-extrabold transition active:scale-95 ${
        active ? 'border-lime-300 bg-lime-300 text-slate-900' : 'border-white/20 bg-white/10 hover:bg-white/20'
      }`}
    >
      <span className="block">{children}</span>
      {sub && <span className={`block text-xs font-bold ${active ? 'text-slate-700' : 'text-white/60'}`}>{sub}</span>}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-extrabold text-lime-200">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

// ---------- main ----------
type Screen = 'menu' | 'play' | 'over';

export default function HanziSnake({ settings, player, onStart, onAnswer, onComplete }: GameProps) {
  const prefs = useStore(prefsStore);
  const profile = useProfile();
  const [screen, setScreen] = useState<Screen>('menu');
  const [config, setConfig] = useState<SnakeConfig | null>(null);
  const [finished, setFinished] = useState<SnakeGame | null>(null);
  const [reward, setReward] = useState<RewardSummary | null>(null);
  const reported = useRef(false);
  const startedAt = useRef(0);

  const mistakeIds = useMemo(
    () => Object.keys(profile.mistakes).filter((id) => CONTENT_WORDS[prefs.content].has(id)),
    [profile.mistakes, prefs.content],
  );

  const start = useCallback(
    (mode: GameMode) => {
      const range = RANGES[prefs.range] ?? RANGES.all;
      reported.current = false;
      startedAt.current = performance.now();
      setReward(null);
      setConfig({
        content: prefs.content === 'idioms' ? 'idioms' : 'words',
        difficulty: prefs.difficulty,
        mode,
        levelMin: range.levels[0],
        levelMax: range.levels[1],
        focusIds: mode === 'mistakes' ? mistakeIds : [],
      });
      setScreen('play');
      onStart?.();
    },
    [prefs, mistakeIds, onStart],
  );

  const finish = useCallback(
    (game: SnakeGame) => {
      if (reported.current) return;
      reported.current = true;
      game.end();
      setFinished(game);
      setScreen('over');
      setReward(
        onComplete({
          score: game.practice ? 0 : game.score,
          correct: game.correct,
          wrong: game.wrong,
          durationSec: Math.round((performance.now() - startedAt.current) / 1000),
          vocabIds: [...new Set(game.results.map((r) => r.word.id))],
          correctIds: game.cleanIds(),
          mistakeIds: [...game.mistakeIds],
          masteredIds: [...game.mastered],
          perfectRounds: game.perfectRounds(),
          stars: game.stars(),
          practice: game.practice,
          difficulty: game.config.difficulty,
        }),
      );
    },
    [onComplete],
  );

  return (
    <div className={`${SHELL} min-h-[30rem]`}>
      {screen === 'menu' && <Menu prefs={prefs} mistakeCount={mistakeIds.length} onStart={start} />}
      {screen === 'play' && config && (
        <PlayScreen
          config={config}
          sound={settings.sound}
          showPinyinSetting={settings.pinyin}
          skin={player.equipped['snake.skin']}
          board={player.equipped['snake.board']}
          dpad={prefs.dpad ?? isTouch()}
          onAnswer={(c) => onAnswer?.(c)}
          onFinish={finish}
          onQuit={() => setScreen('menu')}
        />
      )}
      {screen === 'over' && finished && (
        <OverScreen game={finished} reward={reward} onAgain={() => start(finished.config.mode)} onMenu={() => setScreen('menu')} />
      )}
    </div>
  );
}

// ---------- menu ----------
function Menu({ prefs, mistakeCount, onStart }: { prefs: Prefs; mistakeCount: number; onStart: (m: GameMode) => void }) {
  const dpad = prefs.dpad ?? isTouch();
  return (
    <div className="mx-auto max-w-xl space-y-5 p-5 sm:p-7">
      <div className="text-center">
        <GameArt slug="hanzi-snake" className="mx-auto size-28" />
        <h2 className="mt-1 text-4xl font-black">{CONTENT[prefs.content].title}</h2>
        <p className="mt-2 text-sm font-bold text-white/70">
          {CONTENT[prefs.content].intro}吃对一个字，小蛇长一格。吃错字或顺序不对，小蛇会变短。别撞墙，也别咬到自己！
        </p>
      </div>

      <Section title="玩法">
        {(Object.keys(CONTENT) as Content[]).map((id) => (
          <Chip key={id} active={prefs.content === id} onClick={() => prefsStore.set({ content: id })} sub={CONTENT[id].sub}>
            {CONTENT[id].label}
          </Chip>
        ))}
      </Section>

      <Section title="年级范围">
        {(Object.keys(RANGES) as RangeId[]).map((id) => (
          <Chip key={id} sub={RANGES[id].sub} active={prefs.range === id} onClick={() => prefsStore.set({ range: id })}>
            {RANGES[id].label}
          </Chip>
        ))}
      </Section>

      <Section title="难度">
        {(Object.keys(DIFFICULTIES) as DifficultyId[]).map((id) => (
          <Chip key={id} active={prefs.difficulty === id} onClick={() => prefsStore.set({ difficulty: id })} sub={DIFFICULTIES[id].desc}>
            {DIFFICULTIES[id].label}
          </Chip>
        ))}
      </Section>

      <Section title="屏幕方向键">
        <Chip active={dpad} onClick={() => prefsStore.set({ dpad: true })} sub="在棋盘下方显示方向键">
          <span className="inline-flex items-center gap-1.5">
            <Gamepad2 className="size-4" aria-hidden /> 显示
          </span>
        </Chip>
        <Chip active={!dpad} onClick={() => prefsStore.set({ dpad: false })} sub="用键盘方向键或在棋盘上滑动">
          隐藏
        </Chip>
      </Section>

      <div className="grid gap-3 pt-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onStart('normal')}
          className="min-h-14 rounded-full bg-lime-300 px-6 text-xl font-black text-slate-900 shadow-lg transition active:scale-95 sm:col-span-2"
        >
          开始游戏
        </button>
        <button
          type="button"
          onClick={() => onStart('practice')}
          className="min-h-12 rounded-full border-2 border-white/30 bg-white/10 px-4 font-extrabold hover:bg-white/20"
        >
          <span className="inline-flex items-center gap-1.5">
            <Leaf className="size-4" aria-hidden /> 练习模式
          </span>
          <span className="block text-xs font-bold text-white/60">没有生命限制</span>
        </button>
        <button
          type="button"
          onClick={() => onStart('mistakes')}
          disabled={mistakeCount === 0}
          className="min-h-12 rounded-full border-2 border-white/30 bg-white/10 px-4 font-extrabold hover:bg-white/20 disabled:opacity-40"
        >
          <span className="inline-flex items-center gap-1.5">
            <Target className="size-4" aria-hidden /> 错题练习
          </span>
          <span className="block text-xs font-bold text-white/60">
            {mistakeCount === 0 ? '还没有可练习的错题' : `${mistakeCount} 个词语`}
          </span>
        </button>
      </div>
    </div>
  );
}

// ---------- playing ----------
const KEYS: Record<string, Dir> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
  W: 'up',
  S: 'down',
  A: 'left',
  D: 'right',
};

function PlayScreen({
  config,
  sound,
  showPinyinSetting,
  skin,
  board,
  dpad,
  onAnswer,
  onFinish,
  onQuit,
}: {
  config: SnakeConfig;
  sound: boolean;
  showPinyinSetting: boolean;
  skin?: string;
  board?: string;
  dpad: boolean;
  onAnswer: (correct: boolean) => void;
  onFinish: (g: SnakeGame) => void;
  onQuit: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<SnakeGame | null>(null);
  const viewRef = useRef<SnakeView | null>(null);
  const [, setTick] = useState(0);
  const [paused, setPaused] = useState(false);
  const [toast, setToast] = useState<{ id: number; text: string; tone: 'bad' } | null>(null);
  const [card, setCard] = useState<{ word: Word; clean: boolean } | null>(null);
  const finishRef = useRef(onFinish);
  const answerRef = useRef(onAnswer);
  finishRef.current = onFinish;
  answerRef.current = onAnswer;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const game = new SnakeGame(config);
    gameRef.current = game;
    const view = new SnakeView(
      canvas,
      game,
      { skin, board, sound },
      {
        onChange: () => {
          setTick((t) => t + 1);
          if (game.phase !== 'card') setCard(null);
        },
        onEvent: (e) => {
          if (e.type === 'eat') answerRef.current(true);
          if (e.type === 'wrong') {
            answerRef.current(false);
            setToast({
              id: Date.now(),
              tone: 'bad',
              text: e.reason === 'order' ? `「${e.ch}」顺序不对，小蛇变短了` : `「${e.ch}」不是这个词里的字，小蛇变短了`,
            });
          }
          if (e.type === 'word') setCard({ word: e.word, clean: e.clean });
          if (e.type === 'over') finishRef.current(game);
        },
      },
    );
    viewRef.current = view;
    view.start();
    return () => view.destroy();
    // Settings and skins are read once per run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  useEffect(() => {
    if (viewRef.current) viewRef.current.paused = paused;
  }, [paused]);

  useEffect(() => {
    const onHide = () => document.hidden && setPaused(true);
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const turn = useCallback((d: Dir) => {
    if (!paused) gameRef.current?.turn(d);
  }, [paused]);

  // Keyboard: arrows / WASD to steer, Space / P / Esc to pause.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      const d = KEYS[e.key];
      if (d) {
        e.preventDefault();
        turn(d);
      } else if (e.key === ' ' || e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [turn]);

  // Swipe on the board.
  const swipe = useRef<{ x: number; y: number; done: boolean } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY, done: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = swipe.current;
    if (!s || s.done) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
    // Allow a second swipe without lifting the finger.
    swipe.current = { x: e.clientX, y: e.clientY, done: false };
  };
  const onPointerUp = () => {
    swipe.current = null;
  };

  const game = gameRef.current;
  const word = game?.word;
  const params = DIFFICULTIES[config.difficulty];
  const showPinyin = params.showPinyin || showPinyinSetting;

  return (
    <div>
      {/* HUD */}
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex min-w-16 items-center gap-0.5" aria-label="生命">
          {game?.maxLives === null ? (
            <span className="text-sm font-extrabold text-emerald-300">练习 ∞</span>
          ) : (
            Array.from({ length: params.lives }).map((_, i) => (
              <Heart key={i} aria-hidden className={`size-5 ${i < (game?.lives ?? 0) ? 'fill-rose-500 text-rose-500' : 'text-white/25'}`} />
            ))
          )}
        </div>
        <div className="flex items-center gap-3 text-sm font-black sm:text-base">
          <span>
            第 {Math.min((game?.wordsDone ?? 0) + 1, game?.stageSize ?? STAGE_SIZE[config.content])}/
            {game?.stageSize ?? STAGE_SIZE[config.content]} {CONTENT[config.content].unit}
          </span>
          <span>得分 {game?.score ?? 0}</span>
        </div>
        <div className="flex gap-1.5">
          {config.mode === 'practice' && (
            <button
              type="button"
              onClick={() => game && finishRef.current(game)}
              className="min-h-10 rounded-full bg-white/15 px-3 text-sm font-extrabold hover:bg-white/25"
            >
              结束
            </button>
          )}
          <button
            type="button"
            aria-label="暂停"
            onClick={() => setPaused(true)}
            className="grid size-10 place-items-center rounded-full bg-white/15 hover:bg-white/25"
          >
            <Pause className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      {/* Prompt: what to build */}
      {word && (
        <div className="mx-3 mb-2 flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2" aria-live="polite">
          {params.showPicture && word.art && (
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/90">
              <WordArt id={word.art} className="size-10" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-base font-black leading-snug sm:text-lg" lang="zh-CN">
              {word.zh}
            </p>
            {showPinyin && <p className="text-sm font-bold text-lime-200">{word.pinyin}</p>}
          </div>
          <div className="flex shrink-0 gap-1" aria-label="已经拼出的字">
            {[...word.hanzi].map((ch, i) => (
              <span
                key={i}
                className={`grid size-9 place-items-center rounded-lg text-xl font-black sm:size-10 sm:text-2xl ${
                  i < (game?.progress ?? 0) ? 'bg-lime-300 text-slate-900' : 'border-2 border-dashed border-white/30 text-white/40'
                }`}
              >
                {i < (game?.progress ?? 0) ? ch : '？'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Board */}
      <div className="px-3 pb-3">
        <div
          className="relative mx-auto aspect-square w-full max-w-[min(100%,560px,62vh)] touch-none select-none overflow-hidden rounded-2xl shadow-xl"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <canvas ref={canvasRef} className="absolute left-0 top-0 block" />

          {game?.phase === 'ready' && !paused && game.crashes === 0 && (
            <div className="pointer-events-none absolute inset-x-0 top-[18%] text-center">
              <span className="rounded-full bg-black/55 px-4 py-1.5 text-sm font-black">准备… 用方向键或滑动控制</span>
            </div>
          )}

          {game?.phase === 'crashed' && game.crash && !paused && (
            <div className="pointer-events-none absolute inset-x-3 top-3 text-center">
              <div className="pop-in inline-block rounded-2xl bg-orange-600/95 px-4 py-2.5 shadow-lg">
                <p className="text-lg font-black">{game.crash.reason === 'wall' ? '撞墙了！' : '咬到自己了！'}</p>
                <p className="text-sm font-bold text-white/90">
                  {game.crash.reason === 'wall' ? '转弯要早一点，别碰到边上的墙。' : '小蛇变长了，转弯时要绕开自己的身体。'}
                  {!game.practice && (game.lives > 0 ? ` 还剩 ${game.lives} 条命。` : ' 没有生命了。')}
                </p>
              </div>
            </div>
          )}

          {game?.phase === 'ready' && game.crashes > 0 && !paused && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/30">
              <div className="text-center">
                <p key={Math.ceil(game.pauseLeft)} className="pop-in text-7xl font-black drop-shadow-lg">
                  {Math.max(1, Math.ceil(game.pauseLeft))}
                </p>
                <p className="mt-2 rounded-full bg-black/55 px-4 py-1.5 text-sm font-black">小蛇会先慢慢出发，再慢慢加速</p>
              </div>
            </div>
          )}

          {game?.recovering && game.phase === 'run' && !paused && (
            <div className="pointer-events-none absolute left-2 top-2 rounded-full bg-sky-600/90 px-3 py-1 text-xs font-black">
              慢速中…
            </div>
          )}

          {card && (
            <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/45 p-4">
              <div key={card.word.id} className="pop-in rounded-3xl bg-white px-8 py-5 text-center text-slate-900 shadow-2xl">
                <p className="text-sm font-bold text-slate-500">{card.word.pinyin}</p>
                <p className="text-5xl font-black sm:text-6xl">{card.word.hanzi}</p>
                <p className="mt-1 max-w-[16rem] font-bold text-slate-600">{card.word.zh}</p>
                <p className={`mt-2 text-sm font-black ${card.clean ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {card.clean ? '完美！' : '完成，下次别吃错哦'}
                </p>
              </div>
            </div>
          )}

          {toast && (
            <div
              key={toast.id}
              className="pop-in pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-2xl bg-red-600/95 px-4 py-2.5 text-center text-sm font-extrabold shadow-lg"
            >
              <X className="size-5 shrink-0" aria-hidden strokeWidth={3} /> {toast.text}
            </div>
          )}

          {paused && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-black/65 p-4">
              <div className="pop-in space-y-3 text-center">
                <p className="text-3xl font-black">已暂停</p>
                <button
                  type="button"
                  onClick={() => setPaused(false)}
                  className="block min-h-12 w-48 rounded-full bg-lime-300 font-black text-slate-900"
                >
                  继续
                </button>
                <button
                  type="button"
                  onClick={onQuit}
                  className="block min-h-12 w-48 rounded-full border-2 border-white/40 font-extrabold hover:bg-white/10"
                >
                  退出
                </button>
              </div>
            </div>
          )}
        </div>

        {dpad && (
          <div className="mx-auto mt-3 grid w-44 grid-cols-3 gap-1.5" aria-label="方向键">
            {(
              [
                ['up', ArrowUp, 'col-start-2'],
                ['left', ArrowLeft, 'col-start-1 row-start-2'],
                ['down', ArrowDown, 'col-start-2 row-start-2'],
                ['right', ArrowRight, 'col-start-3 row-start-2'],
              ] as const
            ).map(([d, Icon, pos]) => (
              <button
                key={d}
                type="button"
                aria-label={{ up: '上', down: '下', left: '左', right: '右' }[d]}
                onPointerDown={(e) => {
                  e.preventDefault();
                  turn(d);
                }}
                className={`grid aspect-square place-items-center rounded-2xl bg-white/15 active:scale-95 active:bg-white/30 ${pos}`}
              >
                <Icon className="size-6" aria-hidden />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- results ----------
function OverScreen({
  game,
  reward,
  onAgain,
  onMenu,
}: {
  game: SnakeGame;
  reward: RewardSummary | null;
  onAgain: () => void;
  onMenu: () => void;
}) {
  const stars = game.stars();
  const practice = game.practice;
  const results = game.results;
  const unfinished = game.word && !game.finished && !results.some((r) => r.word.id === game.word!.id) ? game.word : null;

  return (
    <div className="mx-auto max-w-xl space-y-5 p-5 sm:p-7">
      <div className="pop-in text-center">
        <span
          aria-hidden
          className={`mx-auto grid size-20 place-items-center rounded-full ${
            game.finished ? 'bg-lime-300/20 text-lime-300' : 'bg-rose-500/20 text-rose-300'
          }`}
        >
          {game.finished ? <PartyPopper className="size-11" strokeWidth={1.7} /> : <HeartCrack className="size-11" strokeWidth={1.7} />}
        </span>
        <h2 className="mt-2 text-3xl font-black">{practice ? '练习结束' : game.finished ? '完成！' : '游戏结束'}</h2>
        {stars > 0 && (
          <p className="mt-2 flex justify-center gap-1" role="img" aria-label={`${stars}颗星`}>
            {[1, 2, 3].map((n) => (
              <Star key={n} aria-hidden className={`size-9 ${n <= stars ? 'fill-amber-300 text-amber-300' : 'text-white/25'}`} />
            ))}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        {[
          ['得分', practice ? '—' : game.score],
          [game.config.content === 'idioms' ? '完成成语' : '完成词语', `${results.length}/${game.stageSize}`],
          ['吃对的字', game.correct],
          ['吃错的字', game.wrong],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white/10 px-2 py-3">
            <div className="text-xs font-bold text-white/60">{label}</div>
            <div className="text-2xl font-black">{value}</div>
          </div>
        ))}
      </div>
      {practice && <p className="text-center text-xs font-bold text-white/60">练习模式不计入最高分</p>}
      {reward && <RewardPanel reward={reward} />}
      {game.mastered.size > 0 && (
        <p className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/20 px-4 py-2 text-center text-sm font-extrabold text-emerald-200">
          <Check className="size-4" aria-hidden strokeWidth={3} /> 已从错题本移除 {game.mastered.size} 个词语
        </p>
      )}

      {results.length > 0 && game.wrong === 0 && !unfinished ? (
        <p className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 p-4 text-center font-extrabold">
          <ThumbsUp className="size-5 text-lime-300" aria-hidden /> 太棒了，一个字都没吃错！
        </p>
      ) : null}

      {(results.length > 0 || unfinished) && (
        <section>
          <h3 className="mb-2 text-sm font-extrabold text-lime-200">
            {game.config.content === 'idioms' ? '这一局的成语' : '这一局的词语'}
          </h3>
          <ul className="space-y-1.5">
            {[...results.map((r) => ({ word: r.word, state: r.clean ? 'clean' : 'mistake' })), ...(unfinished ? [{ word: unfinished, state: 'unfinished' }] : [])].map(
              ({ word, state }, i) => (
                <li key={`${word.id}-${i}`} className="flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2">
                  <span
                    aria-hidden
                    className={`grid size-7 shrink-0 place-items-center rounded-full ${
                      state === 'clean' ? 'bg-emerald-500' : state === 'mistake' ? 'bg-amber-500' : 'bg-white/20'
                    }`}
                  >
                    {state === 'clean' ? <Check className="size-4" strokeWidth={3} /> : <X className="size-4" strokeWidth={3} />}
                  </span>
                  <span className="text-2xl font-black">{word.hanzi}</span>
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="block font-bold text-lime-200">{word.pinyin}</span>
                    <span className="block text-white/70">{word.zh}</span>
                  </span>
                  {state !== 'clean' && (
                    <span className="text-xs font-extrabold text-amber-200">{state === 'mistake' ? '已存进错题本' : '没完成'}</span>
                  )}
                  <button
                    type="button"
                    aria-label={`听「${word.hanzi}」的发音`}
                    onClick={() => speak(word.hanzi)}
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 hover:bg-white/25"
                  >
                    <Volume2 className="size-4" aria-hidden />
                  </button>
                </li>
              ),
            )}
          </ul>
        </section>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onAgain}
          className="min-h-14 rounded-full bg-lime-300 px-6 text-lg font-black text-slate-900 shadow-lg active:scale-95"
        >
          再玩一次
        </button>
        <button
          type="button"
          onClick={onMenu}
          className="min-h-14 rounded-full border-2 border-white/30 bg-white/10 px-6 font-extrabold hover:bg-white/20"
        >
          返回菜单
        </button>
      </div>
    </div>
  );
}
