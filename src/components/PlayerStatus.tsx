'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookMarked, ChevronDown, Coins, ShoppingBag, Sparkles, UserRound } from 'lucide-react';
import { FEATURES } from '@/lib/config';
import { levelFromXp, levelProgress } from '@/lib/economy';
import { useT } from '@/lib/i18n';
import { avatarGradient, profileStore, useProfile } from '@/lib/profile';

const CONFETTI = ['#facc15', '#38bdf8', '#f472b6', '#4ade80', '#fb923c', '#a78bfa', '#facc15', '#38bdf8', '#f472b6', '#4ade80'];

/** Counts a number up from `from` to `to`; returns null when idle (show the real value). */
function useCountUp(run: { from: number; to: number; id: number } | null) {
  const [shown, setShown] = useState<number | null>(null);
  useEffect(() => {
    if (!run) return;
    const start = performance.now();
    const dur = 800;
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      setShown(k < 1 ? Math.round(run.from + (run.to - run.from) * eased) : null);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [run]);
  return shown;
}

/** Avatar inside a circular XP progress ring. */
function XpRing({ char, ratio, size = 40 }: { char: string; ratio: number; size?: number }) {
  const stroke = 3.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-line" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="stroke-brand transition-[stroke-dashoffset] duration-700 ease-out"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(1, Math.max(0, ratio)))}
        />
      </svg>
      <span
        aria-hidden
        className={`grid place-items-center rounded-full bg-gradient-to-br font-black text-white ${avatarGradient(char)}`}
        style={{ width: size - 11, height: size - 11, fontSize: (size - 11) * 0.5 }}
      >
        {char}
      </span>
    </span>
  );
}

type Gain = { id: number; xp: number; coins: number };

/**
 * Header player chip: avatar with an XP ring, level and coins.
 * Animates when XP / coins go up (count-up, floating "+XP", confetti on level-up)
 * and opens a small progress menu on click.
 */
export function PlayerStatus() {
  const profile = useProfile();
  const { t } = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [gain, setGain] = useState<Gain | null>(null);
  const [levelUp, setLevelUp] = useState(0);
  const [coinRun, setCoinRun] = useState<{ from: number; to: number; id: number } | null>(null);
  const last = useRef<{ xp: number; coins: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const prog = levelProgress(profile.xp);
  const coinsShown = useCountUp(coinRun) ?? profile.coins;
  const mistakeCount = Object.keys(profile.mistakes).length;

  useEffect(() => {
    // While hydrating, React renders the empty server profile first. Ignore it, so a
    // page load never looks like a gain; the first real profile becomes the baseline.
    if (profile !== profileStore.get()) return;
    const prev = last.current;
    last.current = { xp: profile.xp, coins: profile.coins };
    if (!prev) return;
    const dXp = profile.xp - prev.xp;
    const dCoins = profile.coins - prev.coins;
    if (dCoins > 0) setCoinRun({ from: prev.coins, to: profile.coins, id: Date.now() });
    if (dXp > 0 || dCoins > 0) {
      // gains that land close together (XP then coins) show as one bubble
      setGain((g) => ({
        id: Date.now(),
        xp: (g?.xp ?? 0) + Math.max(0, dXp),
        coins: (g?.coins ?? 0) + Math.max(0, dCoins),
      }));
      if (levelFromXp(profile.xp) > levelFromXp(prev.xp)) setLevelUp(Date.now());
    }
  }, [profile]);

  useEffect(() => {
    if (!gain) return;
    const id = setTimeout(() => setGain(null), 1400);
    return () => clearTimeout(id);
  }, [gain]);

  useEffect(() => {
    if (!levelUp) return;
    const id = setTimeout(() => setLevelUp(0), 2900);
    return () => clearTimeout(id);
  }, [levelUp]);

  // close the menu on navigation, outside click and Escape
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!FEATURES.economy) return null;

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${t('status.level', { n: prog.level })}, ${profile.coins} ${t('profile.coins')}`}
        onClick={() => setOpen((v) => !v)}
        className={`relative flex h-11 items-center gap-2 whitespace-nowrap rounded-full border bg-surface p-0.5 text-sm font-extrabold transition hover:bg-soft active:scale-95 sm:pr-3 ${
          open ? 'border-brand' : 'border-line'
        } ${levelUp ? 'level-glow' : ''}`}
      >
        <XpRing char={profile.avatar} ratio={prog.ratio} />
        <span className="hidden flex-col items-start leading-tight sm:flex">
          <span className="text-[11px] font-black text-brand">Lv {prog.level}</span>
          <span className="inline-flex items-center gap-1">
            <Coins className="size-3.5 text-amber-500" aria-hidden />
            <span className="tabular-nums">{coinsShown}</span>
          </span>
        </span>
        <ChevronDown
          className={`hidden size-4 text-muted transition-transform sm:block ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />

        {levelUp > 0 && (
          <span key={levelUp} aria-hidden className="pointer-events-none absolute left-5 top-1/2">
            {CONFETTI.map((color, i) => (
              <span
                key={i}
                className="confetti"
                style={
                  {
                    background: color,
                    '--a': `${i * 36}deg`,
                    '--d': `${(i % 3) * 0.06}s`,
                  } as React.CSSProperties
                }
              />
            ))}
          </span>
        )}
      </button>

      {/* floating gains */}
      {gain && (
        <span
          key={gain.id}
          aria-hidden
          className="float-up pointer-events-none absolute left-1/2 top-full mt-1 flex gap-1 whitespace-nowrap text-xs font-black"
        >
          {gain.xp > 0 && <span className="rounded-full bg-brand px-2 py-0.5 text-brand-fg shadow">+{gain.xp} XP</span>}
          {gain.coins > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-300 px-2 py-0.5 text-slate-900 shadow">
              +{gain.coins} <Coins className="size-3" aria-hidden />
            </span>
          )}
        </span>
      )}
      {levelUp > 0 && (
        <span role="status" className="pop-in absolute right-0 top-full mt-2 whitespace-nowrap rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-slate-900 shadow-lg">
          {t('status.levelUp', { n: prog.level })}
        </span>
      )}

      {open && (
        <div
          role="dialog"
          aria-label={t('status.menu')}
          className="menu-in absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-3xl border border-line bg-surface p-4 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <XpRing char={profile.avatar} ratio={prog.ratio} size={52} />
            <div className="min-w-0">
              <div className="truncate font-black">{profile.nickname || t('profile.defaultName')}</div>
              <div className="text-sm font-bold text-brand">{t('profile.level', { n: prog.level })}</div>
            </div>
          </div>

          <div className="mt-3">
            <div className="h-2.5 overflow-hidden rounded-full bg-soft">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-brand transition-[width] duration-700"
                style={{ width: `${Math.round(prog.ratio * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs font-bold text-muted">
              {t('profile.xp', { into: prog.into, need: prog.need, next: prog.level + 1 })}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-2xl bg-soft p-2.5">
              <div className="text-xs font-bold text-muted">{t('profile.coins')}</div>
              <div className="inline-flex items-center gap-1 text-lg font-black">
                <Coins className="size-4 text-amber-500" aria-hidden /> {profile.coins}
              </div>
            </div>
            <div className="rounded-2xl bg-soft p-2.5">
              <div className="text-xs font-bold text-muted">{t('profile.totalXp')}</div>
              <div className="inline-flex items-center gap-1 text-lg font-black">
                <Sparkles className="size-4 text-brand" aria-hidden /> {profile.xp}
              </div>
            </div>
          </div>

          {mistakeCount > 0 && (
            <Link
              href="/games/hanzi-slash/"
              className="mt-2 flex items-center gap-2 rounded-2xl border border-line p-2.5 text-sm font-bold hover:bg-soft"
            >
              <BookMarked className="size-4 shrink-0 text-brand" aria-hidden />
              {t('profile.mistakesCount', { n: mistakeCount })}
            </Link>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href="/profile"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-brand px-3 py-2 text-sm font-bold text-brand-fg"
            >
              <UserRound className="size-4" aria-hidden /> {t('nav.profile')}
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line px-3 py-2 text-sm font-bold hover:bg-soft"
            >
              <ShoppingBag className="size-4" aria-hidden /> {t('nav.shop')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
