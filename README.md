# 每周中文 WeeklyZhongwen

A web platform where a new Chinese-learning mini-game is released every week (Standard 1 – Form 5).
Levels are numbered 1–11 internally: 1–6 = Standard 1–6, 7–11 = Form 1–5 (see `src/lib/levels.ts`).
Static site built with Next.js (static export), TypeScript and Tailwind CSS, hosted on GitHub Pages.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static site -> /out
```

## Deploy (GitHub Pages)

1. Push to the `main` branch.
2. In the repo: **Settings → Pages → Source: GitHub Actions**.
3. `.github/workflows/deploy.yml` builds and publishes automatically. The base path is set from the repo name.

## Project layout

```
src/app          pages (home, games, games/[slug], settings, about, profile, shop, quests placeholder)
src/components   header, search, language switch, cards, settings UI, game player
src/lib          settings, profile store, events, search, i18n, game result types
src/messages     en.ts / zh.ts: all UI text
src/games        catalog.ts (game metadata), loaders.ts, one folder per game
src/data         vocab.ts (Word Pop) and words.ts (tagged words for Hanzi Slash: level, word type, topic, antonyms)
                 NOTE: words.ts is a DRAFT; levels/word types must be reviewed against the real syllabus.
```

## Add a weekly game

1. Create `src/games/<slug>/<Name>.tsx`. It receives `GameProps` (language, settings, `player.equipped`, `onStart`, `onAnswer`, `onComplete`).
2. Add an entry to `GAMES` in `src/games/catalog.ts` (set `releaseDate`, `playable: true`).
3. Register it in `src/games/loaders.ts`.
4. To earn XP and coins, set `rewards: true` in the catalog entry and report `correctIds`, `perfectRounds`, `stars`, `practice` and `difficulty` in the result.

Games with a future `releaseDate` stay hidden until that date (the weekly workflow rebuild is not required for this; it is checked in the browser).

## Artwork (no emoji)

- **Interface icons:** [Lucide](https://lucide.dev) (`lucide-react`, ISC licence).
- **Game illustrations:** original SVGs in `src/components/GameArt.tsx`, keyed by game slug. Add a case there for each new game.
- **Word pictures (Word Pop):** `public/art/words/<word id>.svg`, from Twemoji (CC-BY 4.0, credited on the About page).
- **Colours:** theme tokens at the top of `src/app/globals.css` (blue theme, light and dark).

## XP, coins, profile and shop

- **Tuning numbers:** all in `src/lib/economy.ts` (XP per action, coins, level curve). `computeRewards()` is a pure function, so it can later run on a server.
- **Recording a game:** `src/lib/rewards.ts` updates stats, mistake book, learned words, XP, level, coins and the reward history. It is called by `GamePlayer`, never by games.
- **Shop catalogue:** `src/data/shop.ts`. Items are cosmetic only. Buying and equipping: `src/lib/shop.ts`.
- **Hanzi Slash skins:** `src/games/hanzi-slash/skins.ts` (boards and blade trails, also used by shop previews).
- **Where data lives:** this browser's localStorage (`wz.profile`). Players can download and restore a backup on the Profile page.

## Built for what comes next

| Future feature | Where it plugs in |
| --- | --- |
| Daily quests | Placeholder route `/quests`; listen to `game_completed` / `answer` in `src/lib/events.ts`; switch on in `src/lib/config.ts` (`FEATURES`) |
| Accounts / cloud saves | Swap the storage in `src/lib/store.ts` for a hosted backend (e.g. Supabase). Upload the local profile on first login. Move `computeRewards()` server-side so XP/coins can't be edited in the browser |
| More games earning rewards | `rewards: true` in the catalog; add their cosmetic slots to `src/data/shop.ts` |
