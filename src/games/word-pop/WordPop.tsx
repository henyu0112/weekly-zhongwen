'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Flame, PartyPopper, Star } from 'lucide-react';
import { wordsFor } from '@/data/activities';
import type { Word } from '@/data/words';
import { GameArt } from '@/components/GameArt';
import { Hanzi } from '@/components/Hanzi';
import { RewardPanel } from '@/components/RewardPanel';
import { WordArt } from '@/components/WordArt';
import type { RewardSummary } from '@/lib/economy';
import { beep } from '@/lib/sound';
import type { GameProps } from '@/lib/types';
import { DriftBubbles, popBubble, popScene } from './skins';

const ROUND_SECONDS = 45;
/** Every this many correct answers in a row counts as a perfect round. */
const PERFECT_STREAK = 10;
/** Stars need at least this many answers, so one lucky tap can't earn three. */
const MIN_ANSWERS_FOR_STARS = 5;
const POOL = wordsFor('word-pop');

const TEXT = {
  en: {
    title: 'Word Pop',
    start: 'Start',
    again: 'Play again',
    ready: 'Match the pictures and the Chinese words. 45 seconds!',
    time: 'Time',
    score: 'Score',
    streak: 'Streak',
    q1: 'Which Chinese word is this?',
    q2: 'What does this word mean?',
    timeUp: "Time's up!",
    correct: 'Correct',
    accuracy: 'Accuracy',
    wrong: 'Wrong',
  },
  zh: {
    title: '汉字泡泡',
    start: '开始',
    again: '再玩一次',
    ready: '把图片和中文词语配对，限时 45 秒！',
    time: '时间',
    score: '得分',
    streak: '连击',
    q1: '这是哪个中文词语？',
    q2: '这个词语是什么意思？',
    timeUp: '时间到！',
    correct: '答对',
    accuracy: '正确率',
    wrong: '答错',
  },
} as const;

interface Question {
  kind: 'toHanzi' | 'toMeaning';
  answer: Word;
  options: Word[];
}

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function makeQuestion(lastId?: string): Question {
  const pool = POOL.filter((v) => v.id !== lastId);
  const answer = pool[Math.floor(Math.random() * pool.length)];
  const distractors = shuffle(POOL.filter((v) => v.id !== answer.id)).slice(0, 3);
  return {
    kind: Math.random() < 0.5 ? 'toHanzi' : 'toMeaning',
    answer,
    options: shuffle([answer, ...distractors]),
  };
}

export default function WordPop({ locale, settings, player, onStart, onAnswer, onComplete }: GameProps) {
  const tx = TEXT[locale];
  const scene = popScene(player.equipped['pop.scene']);
  const bubble = popBubble(player.equipped['pop.bubble']);
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [reward, setReward] = useState<RewardSummary | null>(null);
  const [stars, setStars] = useState(0);
  const seen = useRef<Set<string>>(new Set());
  const rightIds = useRef<Set<string>>(new Set());
  const wrongIds = useRef<Set<string>>(new Set());
  const stats = useRef({ score: 0, correct: 0, wrong: 0, run: 0, perfect: 0 });
  const nextTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finished = useRef(false);

  useEffect(
    () => () => {
      if (nextTimer.current) clearTimeout(nextTimer.current);
    },
    [],
  );

  const start = () => {
    if (nextTimer.current) clearTimeout(nextTimer.current);
    finished.current = false;
    stats.current = { score: 0, correct: 0, wrong: 0, run: 0, perfect: 0 };
    seen.current = new Set();
    rightIds.current = new Set();
    wrongIds.current = new Set();
    setReward(null);
    setStars(0);
    setScore(0);
    setStreak(0);
    setCorrect(0);
    setWrong(0);
    setPicked(null);
    setTimeLeft(ROUND_SECONDS);
    const q = makeQuestion();
    seen.current.add(q.answer.id);
    setQuestion(q);
    setPhase('playing');
    onStart?.();
  };

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    if (nextTimer.current) clearTimeout(nextTimer.current);
    setPhase('done');
    beep('end', settings.sound);
    const { score: finalScore, correct: right, wrong: missed, perfect } = stats.current;
    const answered = right + missed;
    const rate = answered ? right / answered : 0;
    const earned = answered < MIN_ANSWERS_FOR_STARS ? 0 : rate >= 0.9 ? 3 : rate >= 0.7 ? 2 : 1;
    setStars(earned);
    setReward(
      onComplete({
        score: finalScore,
        correct: right,
        wrong: missed,
        durationSec: ROUND_SECONDS,
        vocabIds: [...seen.current],
        // A word missed this game doesn't also count as learned.
        correctIds: [...rightIds.current].filter((id) => !wrongIds.current.has(id)),
        mistakeIds: [...wrongIds.current],
        perfectRounds: perfect,
        stars: earned,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.sound]);

  // Countdown
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === 'playing' && timeLeft <= 0) finish();
  }, [phase, timeLeft, finish]);

  const choose = (opt: Word) => {
    if (!question || picked || phase !== 'playing') return;
    const ok = opt.id === question.answer.id;
    setPicked(opt.id);
    onAnswer?.(ok);
    beep(ok ? 'good' : 'bad', settings.sound);

    if (ok) {
      const gained = 10 + Math.min(streak, 5) * 2;
      stats.current.score += gained;
      stats.current.correct += 1;
      stats.current.run += 1;
      if (stats.current.run % PERFECT_STREAK === 0) stats.current.perfect += 1;
      rightIds.current.add(question.answer.id);
      setScore(stats.current.score);
      setCorrect(stats.current.correct);
      setStreak((s) => s + 1);
    } else {
      stats.current.wrong += 1;
      stats.current.run = 0;
      wrongIds.current.add(question.answer.id);
      setWrong(stats.current.wrong);
      setStreak(0);
    }

    nextTimer.current = setTimeout(
      () => {
        const next = makeQuestion(question.answer.id);
        seen.current.add(next.answer.id);
        setQuestion(next);
        setPicked(null);
      },
      ok ? 500 : 900,
    );
  };

  const total = correct + wrong;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;

  // ---- Screens ----
  if (phase === 'ready' || phase === 'done') {
    return (
      <div className="relative grid min-h-[26rem] place-items-center overflow-hidden p-6 text-center" style={{ background: scene.background, color: scene.ink }}>
        <DriftBubbles color={scene.drift} />
        <div className="pop-in relative w-full max-w-md">
          <span
            aria-hidden
            className="mx-auto grid size-24 place-items-center rounded-3xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg"
          >
            {phase === 'done' ? (
              <PartyPopper className="size-14 text-white" strokeWidth={1.7} />
            ) : (
              <GameArt slug="word-pop" className="size-20" />
            )}
          </span>
          <h2 className="mt-2 text-3xl font-black">{phase === 'done' ? tx.timeUp : tx.title}</h2>
          {phase === 'done' ? (
            <>
              {stars > 0 && (
                <p className="mt-2 flex justify-center gap-1" role="img" aria-label={`${stars} / 3`}>
                  {[1, 2, 3].map((n) => (
                    <Star
                      key={n}
                      aria-hidden
                      className={`size-9 ${n <= stars ? 'fill-amber-300 text-amber-400' : 'opacity-30'}`}
                    />
                  ))}
                </p>
              )}
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <Stat scene={scene} label={tx.score} value={score} big />
                <Stat scene={scene} label={tx.correct} value={correct} />
                <Stat scene={scene} label={tx.accuracy} value={`${accuracy}%`} />
              </div>
              {reward && (
                <div className="mt-4 rounded-2xl bg-slate-900 text-left text-white">
                  <RewardPanel reward={reward} />
                </div>
              )}
            </>
          ) : (
            <p className="mt-2 font-semibold">{tx.ready}</p>
          )}
          <button
            type="button"
            onClick={start}
            style={{ background: scene.accent }}
            className="mt-6 min-h-14 rounded-full px-10 text-lg font-extrabold text-white shadow-lg transition active:scale-95"
          >
            {phase === 'done' ? tx.again : tx.start}
          </button>
        </div>
      </div>
    );
  }

  if (!question) return null;
  const q = question;

  return (
    <div className="relative overflow-hidden p-4 sm:p-6" style={{ background: scene.background, color: scene.ink }}>
      <DriftBubbles color={scene.drift} />
      {/* HUD */}
      <div className="relative mb-3 grid grid-cols-3 gap-2 text-center text-sm font-bold">
        <Stat scene={scene} label={tx.time} value={`${Math.max(timeLeft, 0)}s`} />
        <Stat scene={scene} label={tx.score} value={score} />
        <Stat
          scene={scene}
          label={tx.streak}
          value={
            <span className="inline-flex items-center gap-1">
              <Flame className="size-5 text-orange-500" aria-hidden /> {streak}
            </span>
          }
        />
      </div>
      <div className="relative mb-4 h-2 overflow-hidden rounded-full bg-white/50">
        <div
          className="h-full rounded-full transition-[width] duration-1000 ease-linear"
          style={{ background: scene.accent, width: `${(Math.max(timeLeft, 0) / ROUND_SECONDS) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div key={`${q.answer.id}-${q.kind}`} className="pop-in relative mb-4 rounded-3xl p-5 text-center shadow" style={{ background: scene.panel, color: scene.panelInk }}>
        <p className="text-sm font-bold" style={{ color: scene.muted }}>{q.kind === 'toHanzi' ? tx.q1 : tx.q2}</p>
        {q.kind === 'toHanzi' ? (
          <p className="mt-1">
            <WordArt id={q.answer.art!} className="mx-auto size-20 sm:size-24" />
            <span className="block text-lg font-bold" style={{ color: scene.muted }}>{q.answer.en}</span>
          </p>
        ) : (
          <p className="mt-3 text-6xl font-black sm:text-7xl">
            <Hanzi text={q.answer.hanzi} pinyin={q.answer.pinyin} />
          </p>
        )}
      </div>

      {/* Options */}
      <div className="relative grid grid-cols-2 gap-3">
        {q.options.map((opt) => {
          const isAnswer = opt.id === q.answer.id;
          const isPicked = picked === opt.id;
          const state = picked
            ? isAnswer
              ? 'border-emerald-500 bg-emerald-100 text-emerald-900'
              : isPicked
                ? 'shake border-red-500 bg-red-100 text-red-900'
                : 'border-transparent opacity-50'
            : 'border-transparent hover:border-white/80 active:scale-95';
          const skinned = !picked || (!isAnswer && !isPicked);
          return (
            <button
              key={opt.id}
              type="button"
              disabled={!!picked}
              onClick={() => choose(opt)}
              style={skinned ? { background: bubble.background, color: bubble.ink } : undefined}
              className={`relative flex min-h-24 items-center justify-center rounded-[2rem] border-4 px-2 py-3 text-center font-black shadow transition ${state}`}
            >
              {picked && isPicked && isAnswer && (
                <span aria-hidden className="pointer-events-none absolute inset-0">
                  {Array.from({ length: 10 }, (_, i) => (
                    <span
                      key={i}
                      className="confetti"
                      style={
                        {
                          background: bubble.burst[i % bubble.burst.length],
                          borderRadius: 9999,
                          '--a': `${i * 36}deg`,
                          '--d': '0s',
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </span>
              )}
              {q.kind === 'toHanzi' ? (
                <span className="text-4xl sm:text-5xl">
                  <Hanzi text={opt.hanzi} pinyin={opt.pinyin} />
                </span>
              ) : (
                <span className="flex flex-col items-center">
                  <WordArt id={opt.art!} className="size-11" />
                  <span className="text-base font-bold">{opt.en}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Stat({
  scene,
  label,
  value,
  big,
}: {
  scene: ReturnType<typeof popScene>;
  label: string;
  value: React.ReactNode;
  big?: boolean;
}) {
  return (
    <div className="rounded-2xl px-2 py-2" style={{ background: scene.panel, color: scene.panelInk }}>
      <div className="text-xs font-bold" style={{ color: scene.muted }}>
        {label}
      </div>
      <div className={`font-black ${big ? 'text-3xl' : 'text-xl'}`}>{value}</div>
    </div>
  );
}
