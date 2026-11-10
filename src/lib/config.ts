/**
 * Feature flags. Flip these to `true` as each system gets built.
 * The UI slots, routes and data layers already exist; the flags only decide
 * whether they are visible to players.
 */
export const FEATURES = {
  /** Header level bar + coin counter (XP / level / currency system). */
  economy: false,
  /** /shop in the navigation. */
  shop: false,
  /** /quests (daily quests) in the navigation. */
  quests: false,
  /** Login button + /profile. Needs a hosted backend (e.g. Supabase). */
  accounts: false,
} as const;

export const SITE = {
  name: 'WeeklyZhongwen',
  nameZh: '每周中文',
};
