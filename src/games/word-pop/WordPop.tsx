'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Flame, PartyPopper } from 'lucide-react';
import { VOCAB, type VocabItem } from '@/data/vocab';
import { GameArt } from '@/components/GameArt';
import { Hanzi } from '@/components/Hanzi';
import { WordArt } from '@/components/WordArt';
import { beep } from '@/lib/sound';
import type { GameProps } from '@/lib/types';

const ROUND_SECONDS = 45;

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
  answer: VocabItem;
  options: VocabItem[];
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
  const pool = VOCAB.filter((v) => v.id !== lastId);
  const answer = pool[Math.floor(Math.random() * pool.length)];
  const distractors = shuffle(VOCAB.filter((v) => v.id !== answer.id)).slice(0, 3);
  return {
    kind: Math.random() < 0.5 ? 'toHanzi' : 'toMeaning',
    answer,
    options: shuffle([answer, ...distractors]),
  };
}

export default function WordPop({ locale, settings, onStart, onAnswer, onComplete }: GameProps) {
  const tx = TEXT[locale];
  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const seen = useRef<Set<string>>(new Set());
  const stats = useRef({ score: 0, correct: 0, wrong: 0 });

  const start = () => {
    stats.current = { score: 0, correct: 0, wrong: 0 };
    seen.current = new Set();
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
    setPhase('done');
    beep('end', settings.sound);
    onComplete({
      score: stats.current.score,
      correct: stats.current.correct,
      wrong: stats.current.wrong,
      durationSec: ROUND_SECONDS,
      vocabIds: [...seen.current],
    });
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

  const choose = (opt: VocabItem) => {
    if (!question || picked || phase !== 'playing') return;
    const ok = opt.id === question.answer.id;
    setPicked(opt.id);
    onAnswer?.(ok);
    beep(ok ? 'good' : 'bad', settings.sound);

    if (ok) {
      const gained = 10 + Math.min(streak, 5) * 2;
      stats.current.score += gained;
      stats.current.correct += 1;
      setScore(stats.current.score);
      setCorrect(stats.current.correct);
      setStreak((s) => s + 1);
    } else {
      stats.current.wrong += 1;
      setWrong(stats.current.wrong);
      setStreak(0);
    }

    setTimeout(
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
      <div className="grid min-h-[26rem] place-items-center bg-gradient-to-b from-sky-100 to-indigo-100 p-6 text-center text-slate-900 dark:from-sky-950 dark:to-indigo-950 dark:text-white">
        <div className="pop-in max-w-sm">
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
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <Stat label={tx.score} value={score} big />
              <Stat label={tx.correct} value={correct} />
              <Stat label={tx.accuracy} value={`${accuracy}%`} />
            </div>
          ) : (
            <p className="mt-2 text-slate-600 dark:text-slate-300">{tx.ready}</p>
          )}
          <button
            type="button"
            onClick={start}
            className="mt-6 min-h-14 rounded-full bg-indigo-600 px-10 text-lg font-extrabold text-white shadow-lg transition active:scale-95"
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
    <div className="bg-gradient-to-b from-sky-100 to-indigo-100 p-4 text-slate-900 dark:from-sky-950 dark:to-indigo-950 dark:text-white sm:p-6">
      {/* HUD */}
      <div className="mb-3 grid grid-cols-3 gap-2 text-center text-sm font-bold">
        <Stat label={tx.time} value={`${Math.max(timeLeft, 0)}s`} />
        <Stat label={tx.score} value={score} />
        <Stat
          label={tx.streak}
          value={
            <span className="inline-flex items-center gap-1">
              <Flame className="size-5 text-orange-500" aria-hidden /> {streak}
            </span>
          }
        />
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/60 dark:bg-white/20">
        <div
          className="h-full rounded-full bg-indigo-500 transition-[width] duration-1000 ease-linear"
          style={{ width: `${(Math.max(timeLeft, 0) / ROUND_SECONDS) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div key={`${q.answer.id}-${q.kind}`} className="pop-in mb-4 rounded-3xl bg-white p-5 text-center shadow dark:bg-slate-800">
        <p className="text-sm font-bold text-slate-500 dark:text-slate-300">{q.kind === 'toHanzi' ? tx.q1 : tx.q2}</p>
        {q.kind === 'toHanzi' ? (
          <p className="mt-1">
            <WordArt id={q.answer.id} className="mx-auto size-20 sm:size-24" />
            <span className="block text-lg font-bold text-slate-500 dark:text-slate-300">{q.answer.en}</span>
          </p>
        ) : (
          <p className="mt-3 text-6xl font-black sm:text-7xl">
            <Hanzi text={q.answer.hanzi} pinyin={q.answer.pinyin} />
          </p>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {q.options.map((opt) => {
          const isAnswer = opt.id === q.answer.id;
          const isPicked = picked === opt.id;
          const state = picked
            ? isAnswer
              ? 'border-emerald-500 bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-50'
              : isPicked
                ? 'shake border-red-500 bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-50'
                : 'opacity-50'
            : 'border-transparent bg-white hover:border-indigo-400 active:scale-95 dark:bg-slate-800';
          return (
            <button
              key={opt.id}
              type="button"
              disabled={!!picked}
              onClick={() => choose(opt)}
              className={`flex min-h-24 items-center justify-center rounded-2xl border-4 px-2 py-3 text-center font-black shadow transition ${state}`}
            >
              {q.kind === 'toHanzi' ? (
                <span className="text-4xl sm:text-5xl">
                  <Hanzi text={opt.hanzi} pinyin={opt.pinyin} />
                </span>
              ) : (
                <span className="flex flex-col items-center">
                  <WordArt id={opt.id} className="size-11" />
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

function Stat({ label, value, big }: { label: string; value: React.ReactNode; big?: boolean }) {
  return (
    <div className="rounded-2xl bg-white/80 px-2 py-2 dark:bg-slate-800/80">
      <div className="text-xs font-bold text-slate-500 dark:text-slate-300">{label}</div>
      <div className={`font-black ${big ? 'text-3xl' : 'text-xl'}`}>{value}</div>
    </div>
  );
}
