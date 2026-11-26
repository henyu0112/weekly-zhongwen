import type { Localized } from '@/lib/types';

/**
 * Shop catalogue. Items are cosmetic only: they change how things look and
 * never make a game easier. Add new items here; no other code changes needed
 * unless a game gets a brand-new slot.
 */
export type SlotId = 'slash.board' | 'slash.blade' | 'pop.scene' | 'pop.bubble' | 'snake.skin' | 'snake.board' | 'frame';

export interface ShopSlot {
  id: SlotId;
  name: Localized;
  /** Game the slot belongs to (catalog slug): its shop tab. Leave out for items used site-wide. */
  game?: string;
}

export const SHOP_SLOTS: ShopSlot[] = [
  { id: 'slash.board', game: 'hanzi-slash', name: { en: 'Hanzi Slash · Cutting board', zh: '汉字斩 · 砧板' } },
  { id: 'slash.blade', game: 'hanzi-slash', name: { en: 'Hanzi Slash · Blade trail', zh: '汉字斩 · 刀光' } },
  { id: 'pop.scene', game: 'word-pop', name: { en: 'Word Pop · Background', zh: '汉字泡泡 · 背景' } },
  { id: 'pop.bubble', game: 'word-pop', name: { en: 'Word Pop · Bubbles', zh: '汉字泡泡 · 泡泡' } },
  { id: 'snake.skin', game: 'hanzi-snake', name: { en: 'Hanzi Snake · Snake skin', zh: '汉字贪吃蛇 · 蛇皮' } },
  { id: 'snake.board', game: 'hanzi-snake', name: { en: 'Hanzi Snake · Board', zh: '汉字贪吃蛇 · 棋盘' } },
  { id: 'frame', name: { en: 'Avatar frame', zh: '头像框' } },
];

export interface ShopItem {
  id: string;
  slot: SlotId;
  name: Localized;
  price: number;
  /** Player level needed before it can be bought or claimed. */
  level: number;
  /** Free starter item, owned by everyone. */
  default?: boolean;
}

export const SHOP_ITEMS: ShopItem[] = [
  // Hanzi Slash cutting boards
  { id: 'board.wood', slot: 'slash.board', name: { en: 'Classic wood', zh: '经典木纹' }, price: 0, level: 1, default: true },
  { id: 'board.bamboo', slot: 'slash.board', name: { en: 'Bamboo', zh: '竹子' }, price: 120, level: 1 },
  { id: 'board.walnut', slot: 'slash.board', name: { en: 'Dark walnut', zh: '深色胡桃木' }, price: 150, level: 2 },
  { id: 'board.marble', slot: 'slash.board', name: { en: 'Marble', zh: '大理石' }, price: 200, level: 3 },
  { id: 'board.chalk', slot: 'slash.board', name: { en: 'Chalkboard', zh: '黑板' }, price: 250, level: 5 },

  // Hanzi Slash blade trails
  { id: 'blade.white', slot: 'slash.blade', name: { en: 'Classic white', zh: '经典白光' }, price: 0, level: 1, default: true },
  { id: 'blade.fire', slot: 'slash.blade', name: { en: 'Fire', zh: '火焰' }, price: 100, level: 1 },
  { id: 'blade.ice', slot: 'slash.blade', name: { en: 'Ice', zh: '冰霜' }, price: 100, level: 2 },
  { id: 'blade.rainbow', slot: 'slash.blade', name: { en: 'Rainbow', zh: '彩虹' }, price: 180, level: 4 },
  { id: 'blade.ink', slot: 'slash.blade', name: { en: 'Ink brush', zh: '毛笔墨迹' }, price: 220, level: 6 },

  // Word Pop backgrounds
  { id: 'scene.sky', slot: 'pop.scene', name: { en: 'Blue sky', zh: '蓝天' }, price: 0, level: 1, default: true },
  { id: 'scene.sunset', slot: 'pop.scene', name: { en: 'Sunset', zh: '晚霞' }, price: 120, level: 1 },
  { id: 'scene.ocean', slot: 'pop.scene', name: { en: 'Deep ocean', zh: '深海' }, price: 150, level: 2 },
  { id: 'scene.forest', slot: 'pop.scene', name: { en: 'Bamboo forest', zh: '竹林' }, price: 200, level: 3 },
  { id: 'scene.night', slot: 'pop.scene', name: { en: 'Starry night', zh: '星空' }, price: 250, level: 5 },

  // Word Pop bubbles
  { id: 'bubble.classic', slot: 'pop.bubble', name: { en: 'Classic', zh: '经典' }, price: 0, level: 1, default: true },
  { id: 'bubble.candy', slot: 'pop.bubble', name: { en: 'Candy', zh: '糖果' }, price: 100, level: 1 },
  { id: 'bubble.mint', slot: 'pop.bubble', name: { en: 'Mint', zh: '薄荷' }, price: 100, level: 2 },
  { id: 'bubble.gold', slot: 'pop.bubble', name: { en: 'Golden', zh: '金色' }, price: 180, level: 4 },
  { id: 'bubble.galaxy', slot: 'pop.bubble', name: { en: 'Galaxy', zh: '银河' }, price: 220, level: 6 },

  // Hanzi Snake skins
  { id: 'skin.classic', slot: 'snake.skin', name: { en: 'Classic green', zh: '经典绿' }, price: 0, level: 1, default: true },
  { id: 'skin.bamboo', slot: 'snake.skin', name: { en: 'Bamboo', zh: '竹节' }, price: 100, level: 1 },
  { id: 'skin.dragon', slot: 'snake.skin', name: { en: 'Dragon', zh: '中国龙' }, price: 160, level: 2 },
  { id: 'skin.ink', slot: 'snake.skin', name: { en: 'Ink brush', zh: '水墨' }, price: 200, level: 4 },
  { id: 'skin.rainbow', slot: 'snake.skin', name: { en: 'Rainbow', zh: '彩虹' }, price: 250, level: 6 },

  // Hanzi Snake boards
  { id: 'field.grass', slot: 'snake.board', name: { en: 'Grass', zh: '草地' }, price: 0, level: 1, default: true },
  { id: 'field.sand', slot: 'snake.board', name: { en: 'Sand', zh: '沙滩' }, price: 100, level: 1 },
  { id: 'field.paper', slot: 'snake.board', name: { en: 'Rice paper', zh: '宣纸' }, price: 140, level: 2 },
  { id: 'field.chalk', slot: 'snake.board', name: { en: 'Chalkboard', zh: '黑板' }, price: 180, level: 3 },
  { id: 'field.night', slot: 'snake.board', name: { en: 'Starry night', zh: '星空' }, price: 220, level: 5 },

  // Avatar frames (level rewards are free to claim)
  { id: 'frame.none', slot: 'frame', name: { en: 'No frame', zh: '无边框' }, price: 0, level: 1, default: true },
  { id: 'frame.bronze', slot: 'frame', name: { en: 'Bronze', zh: '青铜框' }, price: 0, level: 5 },
  { id: 'frame.jade', slot: 'frame', name: { en: 'Jade', zh: '翡翠框' }, price: 250, level: 3 },
  { id: 'frame.silver', slot: 'frame', name: { en: 'Silver', zh: '白银框' }, price: 0, level: 10 },
  { id: 'frame.gold', slot: 'frame', name: { en: 'Gold', zh: '黄金框' }, price: 0, level: 20 },
];

export const SHOP_ITEM_BY_ID: Record<string, ShopItem> = Object.fromEntries(SHOP_ITEMS.map((i) => [i.id, i]));

export const defaultItemFor = (slot: SlotId) => SHOP_ITEMS.find((i) => i.slot === slot && i.default)!;
