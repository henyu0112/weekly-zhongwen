'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Coins, Lock, Sparkles, UserRound } from 'lucide-react';
import { Avatar } from './Avatar';
import { GameArt } from './GameArt';
import { getGame } from '@/games/catalog';
import { SkinPreview } from '@/games/hanzi-slash/SkinPreview';
import { PopSkinPreview } from '@/games/word-pop/skins';
import { SnakePreview } from '@/games/hanzi-snake/skins';
import { SHOP_ITEMS, SHOP_SLOTS, type ShopItem } from '@/data/shop';
import { levelFromXp } from '@/lib/economy';
import { loc, useT } from '@/lib/i18n';
import { useProfile } from '@/lib/profile';
import { buyItem, equipItem, equippedAll, isOwned } from '@/lib/shop';

const GENERAL = 'general';
const TAB_KEY = 'wz.shopTab';

/** One tab per game that has items, then site-wide items (avatar frames). */
const TABS = [...new Set(SHOP_SLOTS.map((s) => s.game ?? GENERAL))].sort((a, b) =>
  a === GENERAL ? 1 : b === GENERAL ? -1 : 0,
);

const slotsIn = (tab: string) => SHOP_SLOTS.filter((s) => (s.game ?? GENERAL) === tab);

export function ShopView() {
  const { t, locale } = useT();
  const p = useProfile();
  const level = levelFromXp(p.xp);
  const equipped = equippedAll(p);
  const [pending, setPending] = useState<string | null>(null);
  const [tab, setTab] = useState(TABS[0]);
  const tabsRef = useRef<HTMLDivElement>(null);

  // On phones the tab row scrolls sideways: keep the chosen tab in view.
  useEffect(() => {
    const row = tabsRef.current;
    const el = row?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (row && el) row.scrollTo({ left: el.offsetLeft - row.clientWidth / 2 + el.offsetWidth / 2, behavior: 'smooth' });
  }, [tab]);

  // Come back to the same tab after visiting another page.
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(TAB_KEY);
      if (saved && TABS.includes(saved)) setTab(saved);
    } catch {
      /* storage unavailable */
    }
  }, []);
  const chooseTab = (id: string) => {
    setTab(id);
    setPending(null);
    try {
      window.sessionStorage.setItem(TAB_KEY, id);
    } catch {
      /* storage unavailable */
    }
  };
  const tabLabel = (id: string) => {
    const game = id === GENERAL ? undefined : getGame(id);
    return game ? loc(game.title, locale) : t('shop.general');
  };
  /** Items in a tab you could buy right now (unlocked, affordable, not owned). */
  const buyable = (id: string) =>
    SHOP_ITEMS.filter(
      (i) => slotsIn(id).some((s) => s.id === i.slot) && !isOwned(p, i) && level >= i.level && p.coins >= i.price,
    ).length;
  const [notice, setNotice] = useState<string | null>(null);

  const confirmBuy = (item: ShopItem) => {
    const res = buyItem(item.id);
    setPending(null);
    if (res.ok) setNotice(`${loc(item.name, locale)} · ${t('shop.done')}`);
  };

  const action = (item: ShopItem) => {
    const base = 'inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full px-4 text-sm font-extrabold';
    if (equipped[item.slot] === item.id) {
      return (
        <span className={`${base} bg-soft text-brand`}>
          <Check className="size-4" aria-hidden strokeWidth={3} /> {t('shop.equipped')}
        </span>
      );
    }
    if (isOwned(p, item)) {
      return (
        <button type="button" onClick={() => equipItem(item.id)} className={`${base} border border-brand text-brand hover:bg-soft`}>
          {t('shop.equip')}
        </button>
      );
    }
    if (level < item.level) {
      return (
        <span className={`${base} bg-soft text-muted`}>
          <Lock className="size-4" aria-hidden /> {t('shop.locked', { n: item.level })}
        </span>
      );
    }
    if (p.coins < item.price) {
      return <span className={`${base} bg-soft text-muted`}>{t('shop.needCoins', { n: item.price - p.coins })}</span>;
    }
    if (pending === item.id) {
      return (
        <div className="grid w-full grid-cols-2 gap-2">
          <button type="button" onClick={() => confirmBuy(item)} className={`${base} bg-brand text-brand-fg`}>
            {t('shop.confirm')}
          </button>
          <button type="button" onClick={() => setPending(null)} className={`${base} border border-line hover:bg-soft`}>
            {t('shop.cancel')}
          </button>
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={() => {
          setNotice(null);
          setPending(item.id);
        }}
        className={`${base} bg-brand text-brand-fg`}
      >
        {item.price === 0 ? t('shop.claim') : t('shop.buy')}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">{t('shop.title')}</h1>
          <p className="mt-1 max-w-xl text-muted">{t('shop.sub')}</p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-2xl border border-line bg-surface px-4 py-2 text-center">
            <div className="text-xs font-bold text-muted">{t('shop.balance')}</div>
            <div className="flex items-center justify-center gap-1.5 text-2xl font-black">
              <Coins className="size-5 text-amber-500" aria-hidden /> {p.coins}
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-surface px-4 py-2 text-center">
            <div className="text-xs font-bold text-muted">{t('shop.yourLevel')}</div>
            <div className="flex items-center justify-center gap-1.5 text-2xl font-black">
              <Sparkles className="size-5 text-brand" aria-hidden /> {level}
            </div>
          </div>
        </div>
      </header>

      <p className="rounded-2xl bg-soft px-4 py-3 text-sm font-bold">{t('shop.howToEarn')}</p>
      {notice && (
        <p role="status" className="flex items-center gap-2 rounded-2xl bg-good/15 px-4 py-3 text-sm font-extrabold text-good">
          <Check className="size-4" aria-hidden strokeWidth={3} /> {notice}
        </p>
      )}

      <div
        ref={tabsRef}
        role="tablist"
        aria-label={t('shop.tabs')}
        className="relative -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map((id) => {
          const active = tab === id;
          const game = id === GENERAL ? undefined : getGame(id);
          const count = buyable(id);
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`tab-${id}`}
              aria-selected={active}
              aria-controls="shop-panel"
              onClick={() => chooseTab(id)}
              className={`relative inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-4 text-sm font-extrabold transition-colors ${
                active ? 'border-brand bg-brand text-brand-fg' : 'border-line bg-surface hover:bg-soft'
              }`}
            >
              <span
                aria-hidden
                className={`grid size-9 place-items-center rounded-full ${game ? `bg-gradient-to-br ${game.gradient}` : 'bg-soft text-brand'}`}
              >
                {game ? <GameArt slug={game.slug} className="size-7" /> : <UserRound className="size-5" />}
              </span>
              {tabLabel(id)}
              {count > 0 && (
                <span
                  className="grid min-w-5 place-items-center rounded-full bg-amber-400 px-1.5 text-xs font-black text-slate-900"
                  aria-label={t('shop.canBuy', { n: count })}
                  title={t('shop.canBuy', { n: count })}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div id="shop-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="space-y-6">
      {slotsIn(tab).map((slot) => (
        <section key={slot.id} aria-labelledby={`slot-${slot.id}`}>
          <h2 id={`slot-${slot.id}`} className="mb-3 text-xl font-extrabold">
            {/* The tab already names the game, so show just the item type. */}
            {loc(slot.name, locale).split(' · ').pop()}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SHOP_ITEMS.filter((i) => i.slot === slot.id).map((item) => (
              <article key={item.id} className="flex flex-col overflow-hidden rounded-3xl border border-line bg-surface">
                <div className="h-28 bg-soft">
                  {item.slot === 'frame' ? (
                    <div className="grid h-full place-items-center">
                      <Avatar char={p.avatar} frame={item.id} size="md" />
                    </div>
                  ) : item.slot.startsWith('snake.') ? (
                    <SnakePreview itemId={item.id} />
                  ) : item.slot.startsWith('pop.') ? (
                    <PopSkinPreview itemId={item.id} />
                  ) : (
                    <SkinPreview itemId={item.id} />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold">{loc(item.name, locale)}</h3>
                    <span className="inline-flex shrink-0 items-center gap-1 text-sm font-black">
                      {item.price === 0 ? (
                        t('shop.free')
                      ) : (
                        <>
                          <Coins className="size-4 text-amber-500" aria-hidden /> {item.price}
                        </>
                      )}
                    </span>
                  </div>
                  <div className="mt-auto">{action(item)}</div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
      </div>
    </div>
  );
}
