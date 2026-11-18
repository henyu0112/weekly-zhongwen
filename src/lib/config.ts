/**
 * Feature flags. Flip these to `true` as each system gets built.
 * The UI slots, routes and data layers already exist; the flags only decide
 * whether they are visible to players.
 */
export const FEATURES = {
  /** Header level bar + coin counter (XP / level / currency system). */
  economy: true,
  /** /shop in the navigation. */
  shop: true,
  /** /profile in the navigation (local profile; cloud accounts come later). */
  profile: true,
  /** /quests (daily quests) in the navigation. */
  quests: false,
  /**
   * Testing tools in Settings (add coins / XP, set level, reset progress).
   * STAGING ONLY: set to false before the site launches to real players.
   */
  devTools: true,
  /** Login button + /profile. Needs a hosted backend (e.g. Supabase). */
  accounts: false,
} as const;

export const SITE = {
  name: 'WeeklyZhongwen',
  nameZh: '每周中文',
};
