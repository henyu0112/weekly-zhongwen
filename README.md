# 每周中文 WeeklyZhongwen

A web platform where a new Chinese-learning mini-game is released every week (Standard 1–6 topics).
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
src/app          pages (home, games, games/[slug], settings, about, shop/quests/profile placeholders)
src/components   header, search, language switch, cards, settings UI, game player
src/lib          settings, profile store, events, search, i18n, game result types
src/messages     en.ts / zh.ts: all UI text
src/games        catalog.ts (game metadata), loaders.ts, one folder per game
src/data         shared vocabulary pool (mixed Standards 1–6)
```

## Add a weekly game

1. Create `src/games/<slug>/<Name>.tsx`. It receives `GameProps` (language, settings, `onStart`, `onAnswer`, `onComplete`).
2. Add an entry to `GAMES` in `src/games/catalog.ts` (set `releaseDate`, `playable: true`).
3. Register it in `src/games/loaders.ts`.

Games with a future `releaseDate` stay hidden until that date (the weekly workflow rebuild is not required for this; it is checked in the browser).

## Built for what comes next

| Future feature | Where it plugs in |
| --- | --- |
| XP / level, currency | `src/lib/profile.ts` (fields exist), listen to `game_completed` / `answer` in `src/lib/events.ts`; header slot `PlayerStatus` |
| Shop, daily quests | Placeholder routes `/shop`, `/quests`; switch on in `src/lib/config.ts` (`FEATURES`) |
| Accounts | Swap the storage in `src/lib/store.ts` for a hosted backend (e.g. Supabase); XP/coins must be stored server-side to be tamper-proof |
