'use client';

import { useEffect, useState } from 'react';
import { Coins, PartyPopper, Sparkles } from 'lucide-react';
import { levelProgress, type RewardKey, type RewardSummary } from '@/lib/economy';

const REWARD_LABEL: Record<RewardKey, (n?: number) => string> = {
  correct: (n) => `答对 ×${n}`,
  newWords: (n) => `新学词语 ×${n}`,
  mastered: (n) => `掌握错题 ×${n}`,
  perfect: (n) => `完美回合 ×${n}`,
  finish: () => '完成游戏',
  stars: (n) => `星星 ×${n}`,
  difficulty: () => '难度加成',
  practice: () => '练习模式（经验减半）',
  daily: () => '每日首局奖励',
  levelUp: (n) => `升级奖励 ×${n}`,
};

/** XP / coins earned this game, with an animated level bar. */
export function RewardPanel({ reward }: { reward: RewardSummary }) {
  const after = levelProgress(reward.xpAfter);
  const leveledUp = reward.levelAfter > reward.levelBefore;
  const startRatio = leveledUp ? 0 : levelProgress(reward.xpBefore).ratio;
  const [ratio, setRatio] = useState(startRatio);
  useEffect(() => {
    const id = requestAnimationFrame(() => setRatio(after.ratio));
    return () => cancelAnimationFrame(id);
  }, [after.ratio]);

  return (
    <section className="pop-in space-y-3 rounded-2xl bg-white/10 p-4" aria-label="奖励">
      {leveledUp && (
        <p className="flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-3 py-2 text-center font-black text-slate-900">
          <PartyPopper className="size-5" aria-hidden /> 升级了！现在是 {reward.levelAfter} 级
        </p>
      )}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl bg-sky-500/20 py-2">
          <div className="text-xs font-bold text-sky-200">经验</div>
          <div className="flex items-center justify-center gap-1 text-2xl font-black text-sky-100">
            <Sparkles className="size-5" aria-hidden /> +{reward.xp}
          </div>
        </div>
        <div className="rounded-xl bg-amber-400/20 py-2">
          <div className="text-xs font-bold text-amber-200">金币</div>
          <div className="flex items-center justify-center gap-1 text-2xl font-black text-amber-100">
            <Coins className="size-5" aria-hidden /> +{reward.coins}
          </div>
        </div>
      </div>
      <div>
        <div className="mb-1 flex justify-between text-xs font-bold text-white/70">
          <span>{after.level} 级</span>
          <span>
            {after.into} / {after.need} 经验
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-[width] duration-1000 ease-out"
            style={{ width: `${Math.round(ratio * 100)}%` }}
          />
        </div>
      </div>
      <ul className="grid gap-1 text-sm font-bold text-white/80 sm:grid-cols-2">
        {reward.lines.map((l) => (
          <li key={l.key} className="flex justify-between gap-2 rounded-lg bg-white/5 px-2.5 py-1">
            <span>{REWARD_LABEL[l.key](l.count)}</span>
            <span className="whitespace-nowrap">
              {l.xp !== 0 && <span className="text-sky-200">{l.xp > 0 ? `+${l.xp}` : l.xp} 经验</span>}
              {l.xp !== 0 && l.coins !== 0 && ' · '}
              {l.coins !== 0 && <span className="text-amber-200">+{l.coins} 金币</span>}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
