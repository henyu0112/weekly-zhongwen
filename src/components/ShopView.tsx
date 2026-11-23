'use client';

import { useState } from 'react';
import { Check, Coins, Lock, Sparkles } from 'lucide-react';
import { Avatar } from './Avatar';
import { SkinPreview } from '@/games/hanzi-slash/SkinPreview';
import { PopSkinPreview } from '@/games/word-pop/skins';
import { SHOP_ITEMS, SHOP_SLOTS, type ShopItem } from '@/data/shop';
import { levelFromXp } from '@/lib/economy';
import { loc, useT } from '@/lib/i18n';
import { useProfile } from '@/lib/profile';
import { buyItem, equipItem, equippedAll, isOwned } from '@/lib/shop';

export function ShopView() {
  const { t, locale } = useT();
  const p = useProfile();
  const level = levelFromXp(p.xp);
  const equipped = equippedAll(p);
  const [pending, setPending] = useState<string | null>(null);
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

      {SHOP_SLOTS.map((slot) => (
        <section key={slot.id} aria-labelledby={`slot-${slot.id}`}>
          <h2 id={`slot-${slot.id}`} className="mb-3 text-xl font-extrabold">
            {loc(slot.name, locale)}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SHOP_ITEMS.filter((i) => i.slot === slot.id).map((item) => (
              <article key={item.id} className="flex flex-col overflow-hidden rounded-3xl border border-line bg-surface">
                <div className="h-28 bg-soft">
                  {item.slot === 'frame' ? (
                    <div className="grid h-full place-items-center">
                      <Avatar char={p.avatar} frame={item.id} size="md" />
                    </div>
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
  );
}
