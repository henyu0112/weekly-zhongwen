'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { BookMarked, Coins, Download, ShoppingBag, Sparkles, Upload } from 'lucide-react';
import { Avatar } from './Avatar';
import { GameArt } from './GameArt';
import { getGame } from '@/games/catalog';
import { SHOP_ITEM_BY_ID, SHOP_SLOTS } from '@/data/shop';
import { levelProgress } from '@/lib/economy';
import { formatDate, loc, useT } from '@/lib/i18n';
import { AVATARS, localDay, parseBackup, profileStore, useProfile } from '@/lib/profile';
import { equippedAll } from '@/lib/shop';

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-surface p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-extrabold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ProfileView() {
  const { t, locale } = useT();
  const p = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const prog = levelProgress(p.xp);
  const equipped = equippedAll(p);
  const wordsLearned = Object.keys(p.wordsLearned).length;
  const accuracy = p.totals.answered ? Math.round((p.totals.correct / p.totals.answered) * 100) : 0;
  const mistakeCount = Object.keys(p.mistakes).length;
  const best = Object.entries(p.stats.bestScores)
    .map(([slug, score]) => ({ game: getGame(slug), score }))
    .filter((b) => b.game && b.score > 0);

  const exportBackup = () => {
    const data = { app: 'weeklyzhongwen', exportedAt: new Date().toISOString(), profile: profileStore.get() };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `weeklyzhongwen-backup-${localDay()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const importBackup = async (file: File) => {
    const parsed = parseBackup(await file.text());
    if (!parsed) {
      setMsg({ ok: false, text: t('profile.importError') });
      return;
    }
    if (!window.confirm(t('profile.importConfirm'))) return;
    profileStore.set(() => parsed);
    setMsg({ ok: true, text: t('profile.importDone') });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-3xl font-black">{t('profile.title')}</h1>

      {/* identity + level */}
      <section className="rounded-3xl border border-line bg-gradient-to-br from-sky-500 to-blue-700 p-5 text-white shadow-lg sm:p-6">
        <div className="flex flex-wrap items-center gap-5">
          <Avatar char={p.avatar} frame={equipped.frame} size="lg" />
          <div className="min-w-0 flex-1">
            <label className="sr-only" htmlFor="nickname">
              {t('profile.nickname')}
            </label>
            <input
              id="nickname"
              value={p.nickname}
              maxLength={16}
              onChange={(e) => profileStore.set({ nickname: e.target.value })}
              placeholder={t('profile.defaultName')}
              className="w-full max-w-xs rounded-xl border-2 border-white/30 bg-white/10 px-3 py-1.5 text-2xl font-black text-white outline-none placeholder:text-white/60 focus:border-white"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-extrabold">
              <span className="rounded-full bg-white px-3 py-1 text-blue-700">{t('profile.level', { n: prog.level })}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300 px-3 py-1 text-slate-900">
                <Coins className="size-4" aria-hidden /> {p.coins}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <div className="h-3 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white" style={{ width: `${Math.round(prog.ratio * 100)}%` }} />
          </div>
          <p className="mt-1.5 text-sm font-bold text-white/85">
            {t('profile.xp', { into: prog.into, need: prog.need, next: prog.level + 1 })}
          </p>
        </div>
      </section>

      <Card title={t('profile.avatar')}>
        <div className="flex flex-wrap gap-3">
          {AVATARS.map((a) => (
            <button
              key={a.char}
              type="button"
              aria-label={a.char}
              aria-pressed={p.avatar === a.char}
              onClick={() => profileStore.set({ avatar: a.char })}
              className={`rounded-full p-1 transition ${p.avatar === a.char ? 'bg-brand' : 'hover:bg-soft'}`}
            >
              <Avatar char={a.char} size="sm" />
            </button>
          ))}
        </div>
      </Card>

      <Card title={t('profile.stats')}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            [t('profile.gamesPlayed'), p.stats.gamesPlayed],
            [t('profile.wordsLearned'), wordsLearned],
            [t('profile.accuracy'), p.totals.answered ? `${accuracy}%` : '—'],
            [t('profile.totalXp'), p.xp],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-soft p-3 text-center">
              <div className="text-xs font-bold text-muted">{label}</div>
              <div className="text-2xl font-black">{value}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-2">
        <Card title={t('profile.bestScores')}>
          {best.length === 0 ? (
            <p className="text-sm text-muted">{t('profile.noGames')}</p>
          ) : (
            <ul className="space-y-2">
              {best.map(({ game, score }) => (
                <li key={game!.slug}>
                  <Link href={`/games/${game!.slug}/`} className="flex items-center gap-3 rounded-2xl p-1.5 hover:bg-soft">
                    <span className={`grid size-10 place-items-center rounded-xl bg-gradient-to-br ${game!.gradient}`}>
                      <GameArt slug={game!.slug} className="size-8" />
                    </span>
                    <span className="flex-1 font-bold">{loc(game!.title, locale)}</span>
                    <span className="font-black text-brand">{score}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={t('profile.mistakes')}>
          <p className="flex items-center gap-2 text-sm font-bold">
            <BookMarked className="size-5 text-brand" aria-hidden />
            {mistakeCount ? t('profile.mistakesCount', { n: mistakeCount }) : t('profile.mistakesNone')}
          </p>
          {mistakeCount > 0 && (
            <Link
              href="/games/hanzi-slash/"
              className="mt-3 inline-block rounded-full bg-brand px-4 py-2 text-sm font-bold text-brand-fg"
            >
              汉字斩 · 错题练习
            </Link>
          )}
        </Card>
      </div>

      <Card
        title={t('profile.equipped')}
        action={
          <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand">
            <ShoppingBag className="size-4" aria-hidden /> {t('profile.toShop')}
          </Link>
        }
      >
        <ul className="grid gap-2 sm:grid-cols-3">
          {SHOP_SLOTS.map((s) => (
            <li key={s.id} className="rounded-2xl bg-soft p-3">
              <div className="text-xs font-bold text-muted">{loc(s.name, locale)}</div>
              <div className="font-extrabold">{loc(SHOP_ITEM_BY_ID[equipped[s.id]].name, locale)}</div>
            </li>
          ))}
        </ul>
      </Card>

      <Card title={t('profile.history')}>
        {p.ledger.length === 0 ? (
          <p className="text-sm text-muted">{t('profile.noHistory')}</p>
        ) : (
          <ul className="divide-y divide-line">
            {p.ledger.slice(0, 8).map((e, i) => {
              const name =
                e.kind === 'dev'
                  ? t('profile.historyDev')
                  : e.kind === 'game'
                    ? t('profile.historyGame', { name: getGame(e.ref) ? loc(getGame(e.ref)!.title, locale) : e.ref })
                    : t('profile.historyBuy', { name: SHOP_ITEM_BY_ID[e.ref] ? loc(SHOP_ITEM_BY_ID[e.ref].name, locale) : e.ref });
              return (
                <li key={`${e.at}-${i}`} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                  <span>
                    <span className="font-bold">{name}</span>{' '}
                    <span className="text-muted">{formatDate(e.at.slice(0, 10), locale)}</span>
                  </span>
                  <span className="flex gap-3 font-extrabold">
                    {e.xp !== 0 && (
                      <span className="inline-flex items-center gap-1 text-brand">
                        <Sparkles className="size-3.5" aria-hidden /> {e.xp > 0 ? `+${e.xp}` : e.xp}
                      </span>
                    )}
                    {e.coins !== 0 && (
                      <span className={`inline-flex items-center gap-1 ${e.coins > 0 ? 'text-amber-600' : 'text-muted'}`}>
                        <Coins className="size-3.5" aria-hidden /> {e.coins > 0 ? `+${e.coins}` : e.coins}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card title={t('profile.backup')}>
        <p className="text-sm text-muted">{t('profile.backupDesc')}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportBackup}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-bold text-brand-fg"
          >
            <Download className="size-4" aria-hidden /> {t('profile.export')}
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 text-sm font-bold hover:bg-soft"
          >
            <Upload className="size-4" aria-hidden /> {t('profile.import')}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importBackup(f);
              e.target.value = '';
            }}
          />
        </div>
        {msg && (
          <p className={`mt-3 text-sm font-bold ${msg.ok ? 'text-good' : 'text-bad'}`} role="status">
            {msg.text}
          </p>
        )}
      </Card>
    </div>
  );
}
