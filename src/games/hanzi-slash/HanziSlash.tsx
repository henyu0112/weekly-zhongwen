'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  BookMarked,
  Check,
  Flame,
  Hand,
  Heart,
  HeartCrack,
  Leaf,
  PartyPopper,
  Pause,
  Pointer,
  Star,
  Target,
  ThumbsUp,
  X,
} from 'lucide-react';
import { GameArt } from '@/components/GameArt';
import { POS_ZH, TOPIC_ZH, WORD_BY_ID, type Word } from '@/data/words';
import { profileStore, useProfile } from '@/lib/profile';
import { createPersistentStore, useStore } from '@/lib/store';
import type { GameProps } from '@/lib/types';
import type { Locale } from '@/lib/settings';
import { SlashEngine } from './engine';
import {
  DIFFICULTIES,
  Session,
  type DifficultyId,
  type GameConfig,
  type GameMode,
  type InputMode,
  type Snapshot,
} from './session';

// ---------- preferences (remembered between visits) ----------
type RangeId = 'lower' | 'upper' | 'secondary' | 'all';

const RANGES: Record<RangeId, { label: string; levels: [number, number] }> = {
  lower: { label: '一至三年级', levels: [1, 3] },
  upper: { label: '四至六年级', levels: [4, 6] },
  secondary: { label: '中一至中五', levels: [7, 11] },
  all: { label: '全部年级', levels: [1, 11] },
};

interface Prefs {
  range: RangeId;
  difficulty: DifficultyId;
  input: InputMode;
}

const prefsStore = createPersistentStore<Prefs>('wz.hanzislash', {
  range: 'all',
  difficulty: 'normal',
  input: 'swipe',
});

// ---------- small UI helpers ----------
const SHELL = 'bg-gradient-to-b from-[#1b2440] to-[#3a2342] text-white';

function Ruby({ word, show = true }: { word: Word; show?: boolean }) {
  if (!show) return <>{word.hanzi}</>;
  return (
    <ruby>
      {word.hanzi}
      <rt className="!text-amber-200">{word.pinyin}</rt>
    </ruby>
  );
}

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
        active ? 'border-amber-300 bg-amber-300 text-slate-900' : 'border-white/20 bg-white/10 hover:bg-white/20'
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
      <h3 className="mb-2 text-sm font-extrabold text-amber-200">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

// ---------- main component ----------
type Screen = 'menu' | 'play' | 'over' | 'book';

export default function HanziSlash({ locale, settings, onStart, onAnswer, onComplete }: GameProps) {
  const prefs = useStore(prefsStore);
  const profile = useProfile();
  const [screen, setScreen] = useState<Screen>('menu');
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [finished, setFinished] = useState<Session | null>(null);
  const reported = useRef(false);

  const mistakeIds = useMemo(() => Object.keys(profile.mistakes).filter((id) => WORD_BY_ID[id]), [profile.mistakes]);

  const start = useCallback(
    (mode: GameMode) => {
      const [levelMin, levelMax] = RANGES[prefs.range].levels;
      reported.current = false;
      setConfig({
        levelMin,
        levelMax,
        difficulty: prefs.difficulty,
        mode,
        input: prefs.input,
        focusIds: mode === 'mistakes' ? mistakeIds : [],
      });
      setScreen('play');
      onStart?.();
    },
    [prefs, mistakeIds, onStart],
  );

  const finish = useCallback(
    (session: Session) => {
      if (reported.current) return;
      reported.current = true;
      setFinished(session);
      setScreen('over');
      onComplete({
        // Practice rounds do not count towards the high score.
        score: session.practice ? 0 : session.score,
        correct: session.correct,
        wrong: session.wrong,
        durationSec: Math.round(session.elapsed),
        vocabIds: [...session.seen],
        mistakeIds: [...new Set(session.mistakes.map((m) => m.word.id))],
        masteredIds: [...session.mastered],
      });
    },
    [onComplete],
  );

  return (
    <div className={`select-none ${SHELL}`}>
      {screen === 'menu' && (
        <Menu prefs={prefs} mistakeCount={mistakeIds.length} onStart={start} onBook={() => setScreen('book')} />
      )}
      {screen === 'play' && config && (
        <PlayScreen
          config={config}
          settings={settings}
          onAnswer={(c) => onAnswer?.(c)}
          onFinish={finish}
          onQuit={() => setScreen('menu')}
        />
      )}
      {screen === 'over' && finished && (
        <OverScreen
          session={finished}
          locale={locale}
          onAgain={() => start(finished.config.mode)}
          onMenu={() => setScreen('menu')}
          onBook={() => setScreen('book')}
        />
      )}
      {screen === 'book' && (
        <Book locale={locale} onBack={() => setScreen('menu')} onPractice={() => start('mistakes')} />
      )}
    </div>
  );
}

// ---------- menu ----------
function Menu({
  prefs,
  mistakeCount,
  onStart,
  onBook,
}: {
  prefs: Prefs;
  mistakeCount: number;
  onStart: (m: GameMode) => void;
  onBook: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl space-y-5 p-5 sm:p-7">
      <div className="text-center">
        <GameArt slug="hanzi-slash" className="mx-auto size-28" />
        <h2 className="mt-1 text-4xl font-black">汉字斩</h2>
        <p className="mt-2 text-sm font-bold text-white/70">
          每回合都有一条新规则，只切符合规则的水果！切错会扣分，并失去一条命。
        </p>
      </div>

      <Section title="年级范围">
        {(Object.keys(RANGES) as RangeId[]).map((id) => (
          <Chip key={id} active={prefs.range === id} onClick={() => prefsStore.set({ range: id })}>
            {RANGES[id].label}
          </Chip>
        ))}
      </Section>

      <Section title="难度">
        {(Object.keys(DIFFICULTIES) as DifficultyId[]).map((id) => (
          <Chip
            key={id}
            active={prefs.difficulty === id}
            onClick={() => prefsStore.set({ difficulty: id })}
            sub={DIFFICULTIES[id].desc}
          >
            {DIFFICULTIES[id].label}
          </Chip>
        ))}
      </Section>

      <Section title="操作方式">
        <Chip active={prefs.input === 'swipe'} onClick={() => prefsStore.set({ input: 'swipe' })} sub="滑动切水果，点一下也行">
          <span className="inline-flex items-center gap-1.5">
            <Hand className="size-4" aria-hidden /> 滑动
          </span>
        </Chip>
        <Chip active={prefs.input === 'tap'} onClick={() => prefsStore.set({ input: 'tap' })} sub="只需点击 · 范围更大 · 速度稍慢">
          <span className="inline-flex items-center gap-1.5">
            <Pointer className="size-4" aria-hidden /> 点击
          </span>
        </Chip>
      </Section>

      <div className="grid gap-3 pt-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onStart('normal')}
          className="min-h-14 rounded-full bg-amber-300 px-6 text-xl font-black text-slate-900 shadow-lg transition active:scale-95 sm:col-span-2"
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
            {mistakeCount === 0 ? '还没有错题' : `${mistakeCount} 个词语`}
          </span>
        </button>
        <button
          type="button"
          onClick={onBook}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/10 px-4 font-extrabold hover:bg-white/20 sm:col-span-2"
        >
          <BookMarked className="size-4" aria-hidden /> 错题本 {mistakeCount > 0 && `(${mistakeCount})`}
        </button>
      </div>
    </div>
  );
}

// ---------- playing ----------
function PlayScreen({
  config,
  settings,
  onAnswer,
  onFinish,
  onQuit,
}: {
  config: GameConfig;
  settings: GameProps['settings'];
  onAnswer: (correct: boolean) => void;
  onFinish: (s: Session) => void;
  onQuit: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SlashEngine | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [roundInfo, setRoundInfo] = useState<{ n: number; title: string; sub: string } | null>(null);
  const [banner, setBanner] = useState(true);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [paused, setPaused] = useState(false);

  const finishRef = useRef(onFinish);
  const answerRef = useRef(onAnswer);
  finishRef.current = onFinish;
  answerRef.current = onAnswer;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const session = new Session(config, setSnap);
    sessionRef.current = session;
    setSnap(session.snapshot());
    const engine = new SlashEngine(
      canvas,
      session,
      {
        inputMode: config.input,
        showPinyin: settings.pinyin || DIFFICULTIES[config.difficulty].forcePinyin,
        sound: settings.sound,
      },
      {
        onState: setSnap,
        onRound: (info) => {
          setRoundInfo(info);
          setBanner(true);
        },
        onRoundGo: () => setBanner(false),
        onFeedback: (f) => setToast({ id: Date.now(), text: f.text }),
        onAnswer: (c) => answerRef.current(c),
        onGameOver: () => finishRef.current(session),
      },
    );
    engineRef.current = engine;
    engine.start();
    return () => engine.destroy();
    // Settings are read once per run; changing them mid-game applies to the next run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  useEffect(() => {
    if (engineRef.current) engineRef.current.paused = paused;
  }, [paused]);

  // Auto-pause when the tab is hidden.
  useEffect(() => {
    const onHide = () => document.hidden && setPaused(true);
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  const mult = snap ? 1 + Math.min(Math.floor(snap.combo / 3), 4) * 0.5 : 1;
  const practice = config.mode === 'practice';

  return (
    <div>
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex min-w-16 items-center gap-0.5" aria-label="生命">
          {snap?.maxLives === null ? (
            <span className="text-sm font-extrabold text-emerald-300">练习 ∞</span>
          ) : (
            Array.from({ length: snap?.maxLives ?? 3 }).map((_, i) => (
              <Heart
                key={i}
                aria-hidden
                className={`size-5 ${i < (snap?.lives ?? 0) ? 'fill-rose-500 text-rose-500' : 'text-white/25'}`}
              />
            ))
          )}
        </div>
        <div className="flex items-center gap-3 text-sm font-black sm:text-base">
          <span>得分 {snap?.score ?? 0}</span>
          {snap && snap.combo >= 2 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-0.5 text-xs sm:text-sm">
              <Flame className="size-3.5" aria-hidden /> {snap.combo}连击 ×{mult}
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          {practice && (
            <button
              type="button"
              onClick={() => sessionRef.current && finishRef.current(sessionRef.current)}
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

      <div className="bg-amber-300 px-3 py-2 text-center text-base font-black text-slate-900 sm:text-lg" aria-live="polite">
        {roundInfo ? `第${roundInfo.n}回合 · ${roundInfo.title}` : '…'}
      </div>

      <div className="relative h-[min(66vh,540px)] min-h-[340px] overflow-hidden">
        <canvas ref={canvasRef} className="absolute left-0 top-0 block" />

        {banner && roundInfo && !paused && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/45 p-4">
            <div key={roundInfo.n} className="pop-in max-w-md text-center">
              <p className="text-sm font-extrabold text-amber-200">第 {roundInfo.n} 回合</p>
              <p className="mt-1 text-3xl font-black sm:text-4xl">{roundInfo.title}</p>
              <p className="mt-2 text-sm font-bold text-white/80">{roundInfo.sub}</p>
            </div>
          </div>
        )}

        {toast && (
          <div
            key={toast.id}
            className="pop-in pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-center gap-2 rounded-2xl bg-red-600/95 px-4 py-3 text-center text-sm font-extrabold shadow-lg sm:text-base"
          >
            <X className="size-5 shrink-0" aria-hidden strokeWidth={3} /> <span>{toast.text}</span>
          </div>
        )}

        {paused && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-black/65 p-4">
            <div className="pop-in space-y-3 text-center">
              <p className="text-3xl font-black">已暂停</p>
              <button
                type="button"
                onClick={() => setPaused(false)}
                className="block min-h-12 w-48 rounded-full bg-amber-300 font-black text-slate-900"
              >
                继续
              </button>
              <button
                type="button"
                onClick={onQuit}
                className="block min-h-12 w-48 rounded-full border-2 border-white/30 font-extrabold"
              >
                退出
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- game over ----------
function OverScreen({
  session,
  locale,
  onAgain,
  onMenu,
  onBook,
}: {
  session: Session;
  locale: Locale;
  onAgain: () => void;
  onMenu: () => void;
  onBook: () => void;
}) {
  const stars = session.stars();
  const practice = session.practice;

  // One row per word per kind.
  const unique = (kind: 'wrong' | 'missed') => {
    const seen = new Set<string>();
    return session.mistakes.filter((m) => m.kind === kind && !seen.has(m.word.id) && seen.add(m.word.id));
  };
  const wrong = unique('wrong');
  const missed = unique('missed');
  const gameOver = session.over;

  return (
    <div className="mx-auto max-w-xl space-y-5 p-5 sm:p-7">
      <div className="pop-in text-center">
        <span
          aria-hidden
          className={`mx-auto grid size-20 place-items-center rounded-full ${gameOver ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-300/20 text-amber-300'}`}
        >
          {gameOver ? <HeartCrack className="size-11" strokeWidth={1.7} /> : <PartyPopper className="size-11" strokeWidth={1.7} />}
        </span>
        <h2 className="mt-2 text-3xl font-black">{practice ? '练习结束' : gameOver ? '游戏结束' : '完成！'}</h2>
        {stars > 0 && (
          <p className="mt-2 flex justify-center gap-1" role="img" aria-label={`${stars}颗星`}>
            {[1, 2, 3].map((n) => (
              <Star
                key={n}
                aria-hidden
                className={`size-9 ${n <= stars ? 'fill-amber-300 text-amber-300' : 'text-white/25'}`}
              />
            ))}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
        {[
          ['得分', practice ? '—' : session.score],
          ['答对', session.correct],
          ['答错', session.wrong],
          ['最高连击', session.bestCombo],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white/10 px-2 py-3">
            <div className="text-xs font-bold text-white/60">{label}</div>
            <div className="text-2xl font-black">{value}</div>
          </div>
        ))}
      </div>
      {practice && <p className="text-center text-xs font-bold text-white/60">练习模式不计入最高分</p>}
      {session.mastered.size > 0 && (
        <p className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/20 px-4 py-2 text-center text-sm font-extrabold text-emerald-200">
          <Check className="size-4" aria-hidden strokeWidth={3} /> 已从错题本移除 {session.mastered.size} 个词语
        </p>
      )}

      {wrong.length === 0 && missed.length === 0 ? (
        <p className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 p-4 text-center font-extrabold">
          <ThumbsUp className="size-5 text-amber-300" aria-hidden /> 太棒了，没有错误！
        </p>
      ) : (
        <div className="space-y-4">
          {wrong.length > 0 && <MistakeList title="切错了" tone="red" rows={wrong} locale={locale} />}
          {missed.length > 0 && <MistakeList title="漏切了" tone="amber" rows={missed} locale={locale} />}
          <p className="text-center text-xs font-bold text-white/60">这些词语已保存到错题本。</p>
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={onAgain}
          className="min-h-12 rounded-full bg-amber-300 px-4 font-black text-slate-900 active:scale-95"
        >
          再玩一次
        </button>
        <button
          type="button"
          onClick={onBook}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-white/30 px-4 font-extrabold"
        >
          <BookMarked className="size-4" aria-hidden /> 错题本
        </button>
        <button type="button" onClick={onMenu} className="min-h-12 rounded-full border-2 border-white/30 px-4 font-extrabold">
          返回菜单
        </button>
      </div>
    </div>
  );
}

function MistakeList({
  title,
  tone,
  rows,
  locale,
}: {
  title: string;
  tone: 'red' | 'amber';
  rows: Session['mistakes'];
  locale: Locale;
}) {
  return (
    <section>
      <h3 className={`mb-2 font-extrabold ${tone === 'red' ? 'text-red-300' : 'text-amber-200'}`}>
        {title}（{rows.length}）
      </h3>
      <ul className="space-y-2">
        {rows.map((m, i) => (
          <li key={`${m.word.id}-${i}`} className="flex items-start gap-3 rounded-2xl bg-white/10 p-3">
            <span className="min-w-16 text-center text-3xl font-black leading-tight">
              <Ruby word={m.word} />
            </span>
            <span className="text-sm font-bold">
              <span className="block text-white/60">{m.rule}</span>
              <span className="block">{m.reason}</span>
              {locale === 'en' && <span className="block text-xs font-semibold text-white/50">{m.word.en}</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- mistake book ----------
function Book({ locale, onBack, onPractice }: { locale: Locale; onBack: () => void; onPractice: () => void }) {
  const profile = useProfile();
  const entries = useMemo(
    () =>
      Object.entries(profile.mistakes)
        .map(([id, m]) => ({ word: WORD_BY_ID[id], ...m }))
        .filter((e) => e.word)
        .sort((a, b) => b.count - a.count),
    [profile.mistakes],
  );

  const remove = (id: string) =>
    profileStore.set((p) => {
      const mistakes = { ...p.mistakes };
      delete mistakes[id];
      return { ...p, mistakes };
    });

  return (
    <div className="mx-auto max-w-xl space-y-4 p-5 sm:p-7">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white/15 px-4 font-extrabold"
        >
          <ArrowLeft className="size-4" aria-hidden /> 返回
        </button>
        <h2 className="flex items-center gap-2 text-2xl font-black">
          <BookMarked className="size-6" aria-hidden /> 错题本
        </h2>
        <span className="w-16" />
      </div>

      {entries.length === 0 ? (
        <p className="rounded-2xl bg-white/10 p-8 text-center font-extrabold">错题本是空的。继续加油！</p>
      ) : (
        <>
          <button
            type="button"
            onClick={onPractice}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-amber-300 font-black text-slate-900 active:scale-95"
          >
            <Target className="size-5" aria-hidden /> 开始错题练习
          </button>
          <ul className="space-y-2">
            {entries.map(({ word, count }) => (
              <li key={word.id} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
                <span className="min-w-16 text-center text-3xl font-black leading-tight">
                  <Ruby word={word} />
                </span>
                <span className="flex-1 text-sm font-bold">
                  <span className="block">
                    {POS_ZH[word.pos]}
                    {word.topic && ` · ${TOPIC_ZH[word.topic]}`}
                  </span>
                  <span className="block text-xs text-white/60">
                    错 {count} 次{locale === 'en' && ` · ${word.en}`}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => remove(word.id)}
                  className="min-h-10 rounded-full bg-emerald-500/25 px-3 text-sm font-extrabold text-emerald-200 hover:bg-emerald-500/40"
                >
                  已掌握
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
