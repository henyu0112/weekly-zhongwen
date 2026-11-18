import { SHOP_ITEM_BY_ID, SHOP_SLOTS, defaultItemFor, type ShopItem, type SlotId } from '@/data/shop';
import { levelFromXp } from './economy';
import { profileStore, type PlayerProfile } from './profile';

export const isOwned = (p: PlayerProfile, item: ShopItem) => !!item.default || p.inventory.includes(item.id);

/** The item equipped in a slot, falling back to the free default. */
export function equippedId(p: PlayerProfile, slot: SlotId): string {
  const id = p.equipped[slot];
  const item = id ? SHOP_ITEM_BY_ID[id] : undefined;
  return item && item.slot === slot && isOwned(p, item) ? item.id : defaultItemFor(slot).id;
}

export function equippedAll(p: PlayerProfile): Record<string, string> {
  return Object.fromEntries(SHOP_SLOTS.map((s) => [s.id, equippedId(p, s.id)]));
}

export type BuyError = 'unknown' | 'owned' | 'level' | 'coins';

/** Buys (or claims, if free) an item and equips it. */
export function buyItem(id: string): { ok: true } | { ok: false; error: BuyError } {
  const item = SHOP_ITEM_BY_ID[id];
  if (!item) return { ok: false, error: 'unknown' };
  const p = profileStore.get();
  if (isOwned(p, item)) return { ok: false, error: 'owned' };
  if (levelFromXp(p.xp) < item.level) return { ok: false, error: 'level' };
  if (p.coins < item.price) return { ok: false, error: 'coins' };

  profileStore.set((cur) => ({
    ...cur,
    coins: cur.coins - item.price,
    inventory: [...cur.inventory, item.id],
    equipped: { ...cur.equipped, [item.slot]: item.id },
    ledger: [
      { at: new Date().toISOString(), kind: 'purchase' as const, ref: item.id, xp: 0, coins: -item.price },
      ...cur.ledger,
    ].slice(0, 100),
  }));
  return { ok: true };
}

export function equipItem(id: string): boolean {
  const item = SHOP_ITEM_BY_ID[id];
  const p = profileStore.get();
  if (!item || !isOwned(p, item)) return false;
  profileStore.set((cur) => ({ ...cur, equipped: { ...cur.equipped, [item.slot]: item.id } }));
  return true;
}
