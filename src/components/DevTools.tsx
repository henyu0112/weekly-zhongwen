'use client';

import { useState } from 'react';
import { Check, Coins, FlaskConical, RotateCcw, Sparkles } from 'lucide-react';
import { levelFromXp, levelProgress, totalXpForLevel } from '@/lib/economy';
import { defaultProfile, profileStore, useProfile } from '@/lib/profile';

/**
 * STAGING ONLY testing tools (shown when FEATURES.devTools is on).
 * Lets testers give themselves coins / XP to try the shop and level rewards.
 */
function adjust(coins: number, xp: number) {
  profileStore.set((p) => {
    const newXp = Math.max(0, p.xp + xp);
    return {
      ...p,
      coins: Math.max(0, p.coins + coins),
      xp: newXp,
      level: levelFromXp(newXp),
      ledger: [{ at: new Date().toISOString(), kind: 'dev' as const, ref: 'dev', xp, coins }, ...p.ledger].slice(0, 100),
    };
  });
}

function setLevel(level: number) {
  profileStore.set((p) => {
    const xp = totalXpForLevel(level);
    return {
      ...p,
      xp,
      level,
      ledger: [{ at: new Date().toISOString(), kind: 'dev' as const, ref: 'dev', xp: xp - p.xp, coins: 0 }, ...p.ledger].slice(0, 100),
    };
  });
}

const btn = 'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-bold transition-colors';

function AmountRow({
  label,
  icon,
  presets,
  onAdd,
}: {
  label: string;
  icon: React.ReactNode;
  presets: number[];
  onAdd: (n: number) => void;
}) {
  const [value, setValue] = useState('');
  const n = Math.trunc(Number(value));
  const valid = value.trim() !== '' && Number.isFinite(n) && n !== 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 font-extrabold">
        {icon} {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button key={p} type="button" onClick={() => onAdd(p)} className={`${btn} bg-soft hover:bg-line`}>
            +{p}
          </button>
        ))}
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            onAdd(n);
            setValue('');
          }}
        >
          <input
            type="number"
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. 250 / -50"
            aria-label={`${label} amount`}
            className="h-10 w-32 rounded-full border border-line bg-bg px-4 text-sm outline-none focus:border-brand"
          />
          <button type="submit" disabled={!valid} className={`${btn} bg-brand text-brand-fg disabled:opacity-40`}>
            Add 添加
          </button>
        </form>
      </div>
    </div>
  );
}

export function DevTools() {
  const p = useProfile();
  const prog = levelProgress(p.xp);
  const [msg, setMsg] = useState<string | null>(null);
  const done = (text: string) => setMsg(text);

  return (
    <section className="mt-8 rounded-3xl border-2 border-dashed border-amber-400 bg-amber-50 p-5 text-slate-900 dark:bg-amber-950/30 dark:text-amber-50">
      <h2 className="flex items-center gap-2 text-lg font-black">
        <FlaskConical className="size-5 text-amber-600" aria-hidden /> Testing tools · 测试工具
      </h2>
      <p className="mt-1 text-sm font-semibold opacity-80">
        Staging only. Turn off with <code>FEATURES.devTools</code> in <code>src/lib/config.ts</code> before launch.
      </p>

      <p className="mt-4 rounded-2xl bg-white/70 px-4 py-2 text-sm font-extrabold dark:bg-black/20">
        Now: Level {prog.level} ({prog.into}/{prog.need} XP) · {p.xp} XP total · {p.coins} coins
      </p>

      <div className="mt-4 space-y-5">
        <AmountRow
          label="Coins 金币"
          icon={<Coins className="size-4 text-amber-600" aria-hidden />}
          presets={[100, 500, 1000]}
          onAdd={(n) => {
            adjust(n, 0);
            done(`${n > 0 ? '+' : ''}${n} coins`);
          }}
        />
        <AmountRow
          label="XP 经验"
          icon={<Sparkles className="size-4 text-brand" aria-hidden />}
          presets={[50, 200, 1000]}
          onAdd={(n) => {
            adjust(0, n);
            done(`${n > 0 ? '+' : ''}${n} XP`);
          }}
        />

        <div className="space-y-2">
          <div className="font-extrabold">Jump to level · 直接设定等级</div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 5, 6, 10, 20].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => {
                  setLevel(l);
                  done(`Level ${l}`);
                }}
                className={`${btn} ${prog.level === l ? 'bg-brand text-brand-fg' : 'bg-soft hover:bg-line'}`}
              >
                Lv {l}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="font-extrabold">Reset · 重置</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                profileStore.set({ lastDailyBonus: undefined });
                done('Daily bonus available again');
              }}
              className={`${btn} bg-soft hover:bg-line`}
            >
              Daily bonus again
            </button>
            <button
              type="button"
              onClick={() => {
                profileStore.set({ inventory: [], equipped: {} });
                done('Shop items removed');
              }}
              className={`${btn} bg-soft hover:bg-line`}
            >
              Remove shop items
            </button>
            <button
              type="button"
              onClick={() => {
                if (!window.confirm('Reset ALL progress (XP, coins, items, stats, mistake book)?')) return;
                profileStore.set(() => ({ ...defaultProfile }));
                done('Progress reset');
              }}
              className={`${btn} bg-red-600 text-white hover:bg-red-700`}
            >
              <RotateCcw className="size-4" aria-hidden /> Reset all progress
            </button>
          </div>
        </div>
      </div>

      {msg && (
        <p role="status" className="mt-4 flex items-center gap-1.5 text-sm font-extrabold text-amber-700 dark:text-amber-300">
          <Check className="size-4" aria-hidden strokeWidth={3} /> {msg}
        </p>
      )}
    </section>
  );
}
