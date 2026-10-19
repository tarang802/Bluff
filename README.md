# Bluff Night ♠

**The House of Bluff** — a private-casino leaderboard for a group of friends playing Bluff.
Seat players, record who won each round, and crown the champion at the end of the night.

Everything runs in the browser. There is no backend, no login, no database and no environment variables.
Scores are saved in `localStorage`, so a game survives page refreshes on the same device and browser.

## Features

- **Players:** 2–15 per table. Blank and duplicate names (case-insensitive) are rejected. Players can be added or removed at any time. Removing someone mid-game asks for confirmation; their points leave the leaderboard, but their rounds stay in the history.
- **Scoring:** each round, the **winner gets 2 points** and the **runner-up gets 1 point**. Tap the winner first, then the runner-up, then press *Declare Winner*. With only two players, the runner-up is filled in automatically. The leaderboard re-ranks and a short celebration plays.
- **Ranking:** by score; when scores tie, more round wins comes first.
- **Fix a round (5-minute window):** every round shows an **Edit** button with a countdown for 5 minutes after it is declared. Change the winner and runner-up and scores recalculate instantly. After 5 minutes the round locks for good (marked *Edited* if it was changed).
- **Leaderboard:** players are ranked by score. Tied players share a rank (1, 1, 3), and gold, silver and bronze accents go to the top three. Phones get compact cards and larger screens get a table.
- **The Night's History:** a log of every round with the winner, runner-up, points, and the date and time it was recorded, newest first.
- **Champion screen:** shows the final standings. Tied leaders become joint champions. You can resume an ended game.
- **New Game** saves the current game to **Past Games**, then starts fresh scores with the same players (after a confirmation). Nothing is ever deleted, and there is no "reset everything" option.
- **Past Games:** every saved game with its date, time span, number of rounds, champion and final standings. Tap a game to see its standings, its full round log, and a Share button.
- **Hall of Fame:** all-time records per player across every game: crowns, games, round wins, runner-ups, win rate, best winning streak and lifetime points.
- **Backup & restore:** save every game (current + Past Games) to a JSON file, and restore it on any phone. Restoring merges: past games combine without duplicates, and a replaced current game is moved to Past Games first. Nothing is deleted.
- **Install as an app:** an Install banner near the top (phones) and an Install App button in the Vault. Where the browser supports it (Chrome, Edge, Samsung Internet) it opens the install dialog; everywhere else it shows step-by-step instructions for that phone and browser, including how to leave WhatsApp/Instagram's built-in browser first. It opens full-screen and works offline; the browser is asked to keep its saved data.
- **Resilient storage:** a broken save is backed up and replaced with a fresh table, and a partly damaged save is repaired. Other tabs stay in sync.
- **Accessibility:** keyboard navigation, focus trapping in dialogs, Escape to close, and screen-reader text for the standings. Animations are reduced when `prefers-reduced-motion` is set.

## Tech

React 18 · Vite 6 · Tailwind CSS 4 · Framer Motion · Lucide icons

```
src/
  App.jsx                    app state wiring, handlers, layout
  hooks/useGame.js           reducer + localStorage persistence
  hooks/useFocusTrap.js      dialog focus trap / scroll lock
  lib/game.js                rules: validation, standings, ties
  lib/storage.js             load / sanitize / save
  components/                Header, HeroSection, Leaderboard, TableActions,
                             AddPlayersModal, RecordWinnerModal, RoundHistory,
                             ChampionScreen, WinnerCelebration,
                             ConfirmationDialog, ToastNotifications, Modal
```

Scores are not stored directly. Each round records its placings (1st and 2nd), and scores are calculated from that log, so scores and history can never disagree, and undo just removes the last round.

## Local development

Requires Node 18+.

```bash
npm install
npm run dev        # http://localhost:5173
```

Production build and local preview:

```bash
npm run build      # outputs to dist/
npm run preview
```

## Deploy to Vercel

**Option A — dashboard:** push this folder to a GitHub repo and import it at [vercel.com/new](https://vercel.com/new).
Vercel detects Vite automatically. The build command is `npm run build` and the output directory is `dist`.

**Option B — CLI:**

```bash
npm i -g vercel
vercel           # preview deployment
vercel --prod    # production
```

`vercel.json` sets the framework and adds a fallback rewrite to `index.html`.
No environment variables or API keys are needed.

## Note

Scores are stored per device. If two phones each keep score, they will not see each other's results.
Pick one device as the scorekeeper for the night.
